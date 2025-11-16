# WAS 서버 Prometheus + Grafana Cloud 설정 가이드

## 🎯 목표
Public Subnet의 WAS 서버에서 Prometheus 메트릭을 수집하고 Grafana Cloud로 전송

## 📋 사전 준비사항

### 1. Grafana Cloud 무료 계정 생성
```bash
# 1. https://grafana.com 접속
# 2. "Get started for free" 클릭
# 3. 계정 생성 후 로그인
# 4. "My Account" → "Grafana Cloud Portal" 이동
```

### 2. Grafana Cloud 접속 정보 확인
```bash
# Prometheus 섹션에서 "Details" 클릭하여 확인:
# - Remote Write Endpoint: https://prometheus-xxx.grafana.net/api/prom/push
# - Username: 123456 (숫자)
# - Password: glc_eyJv... (API Key)
```

## 🔧 Step 1: Node Exporter 설치 (시스템 메트릭용)

### 1.1 Node Exporter 다운로드

```bash
# 최신 버전 확인
curl -s https://api.github.com/repos/prometheus/node_exporter/releases/latest | grep browser_download_url | grep linux-amd64 | cut -d '"' -f 4

# 다운로드 (현재 기준 v1.9.1)
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz

# 압축 해제
tar -xzf node_exporter-1.9.1.linux-amd64.tar.gz

# 바이너리 복사
sudo cp node_exporter-1.9.1.linux-amd64/node_exporter /usr/local/bin/

# 정리
rm -rf node_exporter-1.9.1.linux-amd64*

# 버전 확인
node_exporter --version
```

### 1.2 Node Exporter 서비스 설정

```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/node_exporter.service
```

다음 내용 입력:
```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=nobody
Group=nogroup
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --web.listen-address=":9100" \
  --collector.filesystem.mount-points-exclude="^/(dev|proc|sys|run)($|/)" \
  --collector.filesystem.fs-types-exclude="^(autofs|binfmt_misc|bpf|cgroup2?|configfs|debugfs|devpts|devtmpfs|fusectl|hugetlbfs|iso9660|mqueue|nsfs|overlay|proc|procfs|pstore|rpc_pipefs|securityfs|selinuxfs|squashfs|sysfs|tracefs|tmpfs)$"

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 1.3 Node Exporter 시작
```bash
# 서비스 리로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅시 자동 시작)
sudo systemctl enable node_exporter

# 서비스 시작
sudo systemctl start node_exporter

# 상태 확인
sudo systemctl status node_exporter

# 메트릭 확인 (브라우저나 curl로)
curl http://localhost:9100/metrics | head -20
```

## 🔧 Step 2: Grafana Agent 설치 (메트릭 전송용)

### 2.1 Grafana Agent 다운로드
```bash
# 아키텍처 확인
uname -m  # x86_64 또는 aarch64

# 최신 버전 다운로드 (AMD64용)
cd /tmp
wget https://github.com/grafana/agent/releases/download/v0.44.2/grafana-agent-linux-amd64.zip

# unzip 설치 (필요시)
sudo apt-get update && sudo apt-get install -y unzip  # Ubuntu/Debian
# sudo yum install -y unzip  # CentOS/RHEL

# 압축 해제
unzip grafana-agent-linux-amd64.zip

# 바이너리 설치
sudo mv grafana-agent-linux-amd64 /usr/local/bin/grafana-agent
sudo chmod +x /usr/local/bin/grafana-agent

# 정리
rm grafana-agent-linux-amd64.zip

# 버전 확인
grafana-agent --version
```

### 2.2 Grafana Agent 설정 디렉토리 생성
```bash
# 설정 디렉토리
sudo mkdir -p /etc/grafana-agent

# 데이터 디렉토리 (WAL 저장용)
sudo mkdir -p /var/lib/grafana-agent
```

### 2.3 Grafana Agent 설정 파일 작성
```bash
# 설정 파일 생성
sudo nano /etc/grafana-agent/agent.yaml
```

다음 내용 입력 (값 치환 필요):
```yaml
server:
  log_level: info
  http_listen_port: 12345

metrics:
  global:
    scrape_interval: 30s
    external_labels:
      cluster: 'production'
      node_type: 'was'

  configs:
    - name: default
      scrape_configs:
        - job_name: 'node-exporter'
          static_configs:
            - targets: ['localhost:9100']
              labels:
                instance: 'was-server-01'
                environment: 'production'
                server_type: 'application'
    remote_write:
      - url: https://prometheus-prod-49-prod-ap-northeast-0.grafana.net/api/prom/push
        basic_auth:
          username: 2548585
          password: 1234

integrations:
  node_exporter:
    enabled: false
```

### 2.4 Grafana Agent 서비스 설정
```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/grafana-agent.service
```

다음 내용 입력:
```ini
[Unit]
Description=Grafana Agent
Documentation=https://github.com/grafana/agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/grafana-agent \
  --config.file=/etc/grafana-agent/agent.yaml \
  --metrics.wal-directory=/var/lib/grafana-agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2.5 Grafana Agent 시작
```bash
# 서비스 리로드
sudo systemctl daemon-reload

# 서비스 활성화
sudo systemctl enable grafana-agent

# 서비스 시작
sudo systemctl start grafana-agent

# 상태 확인
sudo systemctl status grafana-agent

# 로그 확인
sudo journalctl -u grafana-agent -f
```

## 🔧 Step 3: 애플리케이션 메트릭 추가 (선택사항)

### 3.1 Docker 컨테이너 메트릭 (Docker 사용시)
```bash
# cAdvisor 실행 (Docker 메트릭 수집)
docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  --restart=unless-stopped \
  gcr.io/cadvisor/cadvisor:latest
```

agent.yaml에 추가:
```yaml
        # Docker 메트릭
        - job_name: 'cadvisor'
          static_configs:
            - targets: ['localhost:8080']
              labels:
                instance: 'was-server-01'
                service: 'docker'
```

### 3.2 Nginx 메트릭 (Nginx 사용시)
```bash
# Nginx status 모듈 활성화
sudo nano /etc/nginx/sites-available/default
```

server 블록에 추가:
```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

```bash
# Nginx 재시작
sudo nginx -t
sudo systemctl reload nginx

# nginx-prometheus-exporter 설치
cd /tmp
wget https://github.com/nginxinc/nginx-prometheus-exporter/releases/download/v0.11.0/nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz
tar -xzf nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz
sudo mv nginx-prometheus-exporter /usr/local/bin/
```

## 🔧 Step 4: Grafana Cloud에서 확인

### 4.1 메트릭 확인
```bash
# 1. Grafana Cloud 로그인
# 2. Explore 메뉴 클릭
# 3. Datasource: "grafanacloud-xxxxx-prom" 선택
# 4. 쿼리 입력: up{job="node-exporter"}
# 5. Run Query 클릭
```

### 4.2 대시보드 Import
```bash
# 1. Dashboards → Browse 클릭
# 2. New → Import 클릭
# 3. Dashboard ID 입력:
#    - 1860: Node Exporter Full
#    - 11074: Node Exporter for Prometheus
# 4. Load 클릭
# 5. Prometheus datasource 선택
# 6. Import 클릭
```

## 📊 유용한 PromQL 쿼리

### 시스템 메트릭
```promql
# CPU 사용률
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 메모리 사용률
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 디스크 사용률
100 - ((node_filesystem_avail_bytes{mountpoint="/",fstype!="tmpfs"} * 100) / node_filesystem_size_bytes{mountpoint="/",fstype!="tmpfs"})

# 네트워크 수신 속도 (MB/s)
rate(node_network_receive_bytes_total[5m]) / 1024 / 1024

# Load Average (1분)
node_load1

# 업타임 (일)
(time() - node_boot_time_seconds) / 86400
```

## 🔍 트러블슈팅

### 메트릭이 Grafana Cloud에 안 보일 때
```bash
# 1. Node Exporter 확인
curl http://localhost:9100/metrics | grep -i "node_"

# 2. Grafana Agent 로그 확인
sudo journalctl -u grafana-agent -n 50 --no-pager

# 3. 네트워크 연결 테스트
curl -X POST https://prometheus-xxx.grafana.net/api/prom/push \
  -u "YOUR_USER:YOUR_API_KEY" \
  -H "Content-Type: text/plain"

# 4. 설정 파일 검증
grafana-agent --config.file=/etc/grafana-agent/agent.yaml --config.check

# 5. 서비스 재시작
sudo systemctl restart grafana-agent
sudo systemctl restart node_exporter
```

### 포트 확인
```bash
# 열린 포트 확인
sudo netstat -tlnp | grep -E "9100|12345"

# 방화벽 상태 (Ubuntu)
sudo ufw status

# Security Group 확인 (AWS)
# AWS 콘솔에서 EC2 → Security Groups 확인
# Inbound rules에 포트 9100은 localhost만 필요 (Grafana Agent가 로컬에서 수집)
```

## 💡 팁

1. **메트릭 수집 간격**: 기본 30초, 비용 절감하려면 60초로 조정
2. **Label 관리**: 너무 많은 label은 cardinality 증가 → 비용 증가
3. **Retention**: Grafana Cloud 무료 플랜은 14일 보관
4. **Alert**: Grafana에서 Alert rule 설정 가능 (무료 50개)

## 📚 참고 문서
- [Grafana Agent Documentation](https://grafana.com/docs/agent/latest/)
- [Node Exporter Documentation](https://github.com/prometheus/node_exporter)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)