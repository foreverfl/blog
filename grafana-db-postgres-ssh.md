# DB 서버 PostgreSQL 모니터링 (SSH 터널 방식)

## 🎯 목표
Private Subnet의 DB 서버 (PostgreSQL)를 SSH 터널을 통해 WAS 서버로 메트릭 전달하여 Grafana Cloud에서 모니터링

## 🏗️ 아키텍처
```
[Private Subnet]          [Public Subnet]           [Internet]
 DB Server (EC2)    SSH    WAS Server (EC2)   Push   Grafana Cloud
  - PostgreSQL      ←──→    - Grafana Agent   ──→    - Dashboard
  - Node Exporter           - SSH Tunnel
  - PG Exporter
   :9100, :9187             localhost:19100,19187
```

---

# Part 1: DB 서버 설정 (Private Subnet)

## 🔧 Step 1: PostgreSQL 설치 및 설정

### 1.1 PostgreSQL 15 설치 (Ubuntu 22.04 기준)
```bash
# PostgreSQL 공식 리포지토리 추가
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# 서명 키 추가
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# 패키지 업데이트
sudo apt-get update

# PostgreSQL 15 설치
sudo apt-get install -y postgresql-15 postgresql-client-15

# 서비스 상태 확인
sudo systemctl status postgresql

# PostgreSQL 버전 확인
sudo -u postgres psql -c "SELECT version();"
```

### 1.2 모니터링용 PostgreSQL 사용자 생성
```bash
# postgres 사용자로 전환
sudo -u postgres psql

# 모니터링 전용 사용자 생성
CREATE USER exporter WITH PASSWORD 'your_secure_password_here';

# 필요한 권한 부여
GRANT pg_monitor TO exporter;
GRANT CONNECT ON DATABASE postgres TO exporter;

# 추가 권한 (상세 모니터링용)
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO exporter;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA pg_catalog TO exporter;

# 확인
\du exporter

# 나가기
\q
```

### 1.3 PostgreSQL 접속 설정
```bash
# pg_hba.conf 편집 (로컬 접속용)
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

다음 라인 추가:
```conf
# Monitoring user
local   all             exporter                                md5
host    all             exporter        127.0.0.1/32            md5
```

```bash
# PostgreSQL 재시작
sudo systemctl reload postgresql

# 접속 테스트
psql -U exporter -d postgres -h localhost -c "SELECT 1;"
```

## 🔧 Step 2: Node Exporter 설치 (시스템 메트릭)

### 2.1 Node Exporter 다운로드 및 설치
```bash
# 다운로드
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz

# 압축 해제
tar -xzf node_exporter-1.7.0.linux-amd64.tar.gz

# 바이너리 복사
sudo cp node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/

# 정리
rm -rf node_exporter-1.7.0.linux-amd64*

# 버전 확인
node_exporter --version
```

### 2.2 Node Exporter 서비스 설정
```bash
# systemd 서비스 생성
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
ExecStart=/usr/local/bin/node_exporter --web.listen-address=":9100"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

# 상태 확인
sudo systemctl status node_exporter

# 메트릭 확인
curl http://localhost:9100/metrics | grep node_
```

## 🔧 Step 3: PostgreSQL Exporter 설치

### 3.1 PostgreSQL Exporter 다운로드
```bash
# 최신 버전 다운로드 (0.15.0)
cd /tmp
wget https://github.com/prometheus-community/postgres_exporter/releases/download/v0.15.0/postgres_exporter-0.15.0.linux-amd64.tar.gz

# 압축 해제
tar -xzf postgres_exporter-0.15.0.linux-amd64.tar.gz

# 바이너리 설치
sudo cp postgres_exporter-0.15.0.linux-amd64/postgres_exporter /usr/local/bin/

# 정리
rm -rf postgres_exporter-0.15.0.linux-amd64*

# 버전 확인
postgres_exporter --version
```

### 3.2 PostgreSQL Exporter 환경 설정
```bash
# 환경 변수 파일 생성
sudo nano /etc/postgres_exporter.env
```

다음 내용 입력:
```bash
DATA_SOURCE_NAME="postgresql://exporter:your_secure_password_here@localhost:5432/postgres?sslmode=disable"
```

```bash
# 파일 권한 설정
sudo chmod 600 /etc/postgres_exporter.env
sudo chown nobody:nogroup /etc/postgres_exporter.env
```

### 3.3 PostgreSQL Exporter 서비스 설정
```bash
# systemd 서비스 생성
sudo nano /etc/systemd/system/postgres_exporter.service
```

다음 내용 입력:
```ini
[Unit]
Description=PostgreSQL Exporter
After=network.target postgresql.service

[Service]
User=nobody
Group=nogroup
Type=simple
EnvironmentFile=/etc/postgres_exporter.env
ExecStart=/usr/local/bin/postgres_exporter \
  --web.listen-address=":9187" \
  --collector.database \
  --collector.database_wraparound \
  --collector.locks \
  --collector.postmaster \
  --collector.process_idle \
  --collector.replication \
  --collector.replication_slot \
  --collector.stat_activity_autovacuum \
  --collector.stat_archiver \
  --collector.stat_bgwriter \
  --collector.stat_database \
  --collector.stat_replication \
  --collector.stat_statements \
  --collector.stat_user_tables \
  --collector.stat_wal_receiver \
  --collector.statio_user_indexes \
  --collector.statio_user_sequences \
  --collector.statio_user_tables \
  --collector.wal

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable postgres_exporter
sudo systemctl start postgres_exporter

# 상태 확인
sudo systemctl status postgres_exporter

# 메트릭 확인
curl http://localhost:9187/metrics | grep pg_
```

## 🔧 Step 4: Security Group 설정 (AWS)

```bash
# DB 서버 Security Group에 추가해야 할 Inbound Rules:
#
# Type: Custom TCP
# Port: 22
# Source: WAS 서버 Security Group ID 또는 IP
# Description: SSH from WAS
#
# (9100, 9187 포트는 열 필요 없음 - SSH 터널 사용)
```

---

# Part 2: WAS 서버 설정 (Public Subnet)

## 🔧 Step 5: SSH 터널 설정

### 5.1 SSH 키 설정
```bash
# DB 서버 접속용 SSH 키가 있는지 확인
ls ~/.ssh/

# 키 권한 확인 (400이어야 함)
chmod 400 ~/.ssh/your-db-key.pem

# SSH 접속 테스트
ssh -i ~/.ssh/your-db-key.pem ubuntu@10.0.2.10  # DB 서버 Private IP
```

### 5.2 자동 SSH 터널 스크립트 생성
```bash
# 터널 스크립트 생성
sudo nano /usr/local/bin/db-tunnel.sh
```

다음 내용 입력:
```bash
#!/bin/bash
# DB 서버 메트릭 SSH 터널 스크립트

DB_HOST="10.0.2.10"  # DB 서버 Private IP
SSH_KEY="/home/ubuntu/.ssh/your-db-key.pem"  # SSH 키 경로
SSH_USER="ubuntu"  # DB 서버 사용자

# 기존 터널 종료
pkill -f "ssh.*${DB_HOST}.*9100:localhost:9100" || true
pkill -f "ssh.*${DB_HOST}.*9187:localhost:9187" || true

# Node Exporter 터널 (9100 -> 19100)
ssh -N -L 19100:localhost:9100 \
    -i ${SSH_KEY} \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    ${SSH_USER}@${DB_HOST} &

echo "Node Exporter tunnel started on port 19100"

# PostgreSQL Exporter 터널 (9187 -> 19187)
ssh -N -L 19187:localhost:9187 \
    -i ${SSH_KEY} \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    ${SSH_USER}@${DB_HOST} &

echo "PostgreSQL Exporter tunnel started on port 19187"

# PID 저장
ps aux | grep "ssh.*${DB_HOST}" | grep -v grep
```

```bash
# 실행 권한 부여
sudo chmod +x /usr/local/bin/db-tunnel.sh

# 수동 실행 테스트
/usr/local/bin/db-tunnel.sh

# 터널 확인
curl http://localhost:19100/metrics | head -20  # Node Exporter
curl http://localhost:19187/metrics | head -20  # PostgreSQL Exporter
```

### 5.3 Systemd 서비스로 자동화
```bash
# systemd 서비스 생성
sudo nano /etc/systemd/system/db-tunnel.service
```

다음 내용 입력:
```ini
[Unit]
Description=DB Metrics SSH Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
User=ubuntu
ExecStart=/usr/local/bin/db-tunnel.sh
ExecStop=/usr/bin/pkill -f "ssh.*9100:localhost:9100"
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable db-tunnel
sudo systemctl start db-tunnel

# 상태 확인
sudo systemctl status db-tunnel

# 포트 확인
netstat -tlnp | grep -E "19100|19187"
```

## 🔧 Step 6: Grafana Agent 설정 업데이트

### 6.1 기존 agent.yaml 수정
```bash
# Grafana Agent 설정 편집
sudo nano /etc/grafana-agent/agent.yaml
```

scrape_configs 섹션에 추가:
```yaml
        # DB 서버 시스템 메트릭 (SSH 터널 경유)
        - job_name: 'node-db'
          static_configs:
            - targets: ['localhost:19100']  # SSH 터널 포트
              labels:
                instance: 'db-server-01'
                environment: 'production'
                server_type: 'database'
                tunnel: 'ssh'

        # PostgreSQL 메트릭 (SSH 터널 경유)
        - job_name: 'postgres'
          static_configs:
            - targets: ['localhost:19187']  # SSH 터널 포트
              labels:
                instance: 'postgres-01'
                environment: 'production'
                db_type: 'postgresql'
                tunnel: 'ssh'
```

### 6.2 Grafana Agent 재시작
```bash
# 설정 검증
grafana-agent --config.file=/etc/grafana-agent/agent.yaml --config.check

# 서비스 재시작
sudo systemctl restart grafana-agent

# 로그 확인
sudo journalctl -u grafana-agent -f
```

---

# Part 3: Grafana Cloud 대시보드 설정

## 🔧 Step 7: Grafana Cloud에서 확인

### 7.1 메트릭 확인
```bash
# Grafana Cloud 로그인 후 Explore 메뉴에서:

# DB 서버 메트릭 확인
up{job="node-db"}

# PostgreSQL 메트릭 확인
up{job="postgres"}

# PostgreSQL 연결 수
pg_stat_database_numbackends{datname="postgres"}

# DB 크기
pg_database_size_bytes{datname="postgres"}
```

### 7.2 대시보드 Import
```bash
# 추천 대시보드:
# - 9628: PostgreSQL Database
# - 3742: PostgreSQL Exporter Quickstart
# - 1860: Node Exporter Full (DB 서버용)
```

## 📊 유용한 PostgreSQL 메트릭 쿼리

### 데이터베이스 메트릭
```promql
# 활성 연결 수
sum(pg_stat_database_numbackends)

# 데이터베이스 크기 (GB)
pg_database_size_bytes / 1024 / 1024 / 1024

# 트랜잭션 처리율 (TPS)
rate(pg_stat_database_xact_commit[5m]) + rate(pg_stat_database_xact_rollback[5m])

# Cache Hit Ratio (%)
100 * sum(pg_stat_database_blks_hit) / (sum(pg_stat_database_blks_hit) + sum(pg_stat_database_blks_read))

# Deadlocks
rate(pg_stat_database_deadlocks[5m])

# 복제 지연 (Replica인 경우)
pg_replication_lag

# 가장 큰 테이블 Top 5
topk(5, pg_stat_user_tables_n_tup_ins)

# Slow Query (pg_stat_statements 활성화 필요)
topk(10, rate(pg_stat_statements_total_time_seconds[5m]))
```

### 시스템 메트릭 (DB 서버)
```promql
# CPU 사용률
100 - (avg(rate(node_cpu_seconds_total{job="node-db",mode="idle"}[5m])) * 100)

# 메모리 사용률
(1 - (node_memory_MemAvailable_bytes{job="node-db"} / node_memory_MemTotal_bytes{job="node-db"})) * 100

# 디스크 I/O (읽기)
rate(node_disk_read_bytes_total{job="node-db"}[5m])

# 디스크 I/O (쓰기)
rate(node_disk_written_bytes_total{job="node-db"}[5m])
```

## 🔍 트러블슈팅

### SSH 터널 문제
```bash
# 터널 상태 확인
ps aux | grep ssh | grep -v grep

# 터널 재시작
sudo systemctl restart db-tunnel

# 수동 터널 테스트
ssh -N -L 19100:localhost:9100 -i ~/.ssh/key.pem ubuntu@10.0.2.10 -v

# 터널 로그 확인
sudo journalctl -u db-tunnel -n 50
```

### PostgreSQL Exporter 문제
```bash
# PostgreSQL 접속 테스트
psql -U exporter -d postgres -h localhost -c "SELECT 1;"

# Exporter 로그 확인
sudo journalctl -u postgres_exporter -n 50

# 권한 확인
sudo -u postgres psql -c "\du exporter"

# 수동 실행 테스트
DATA_SOURCE_NAME="postgresql://exporter:password@localhost:5432/postgres?sslmode=disable" \
  postgres_exporter --log.level=debug
```

### 메트릭이 Grafana에 안 보일 때
```bash
# 1. 로컬 메트릭 확인
curl http://localhost:19100/metrics | grep up
curl http://localhost:19187/metrics | grep up

# 2. Grafana Agent 타겟 확인
curl http://localhost:12345/metrics | grep target

# 3. 네트워크 테스트
telnet localhost 19100
telnet localhost 19187

# 4. Security Group 확인 (AWS)
# WAS → DB 서버 SSH (port 22) 허용 확인
```

## 💡 최적화 팁

### 1. SSH 터널 안정성
```bash
# autossh 사용 (자동 재연결)
sudo apt-get install autossh

# autossh로 터널 생성
autossh -M 20000 -N -L 19100:localhost:9100 \
  -i ~/.ssh/key.pem ubuntu@10.0.2.10
```

### 2. PostgreSQL 성능 모니터링 강화
```sql
-- pg_stat_statements 활성화 (슬로우 쿼리 추적)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- postgresql.conf 수정
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

### 3. 메트릭 수집 최적화
```yaml
# agent.yaml에서 불필요한 메트릭 필터링
metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'go_.*|promhttp_.*'
    action: drop
```

## 🚀 다음 단계

1. **알람 설정**: Grafana Alert Rules 구성
2. **백업 모니터링**: pg_dump 스케줄 및 크기 추적
3. **Query Performance**: pg_stat_statements 기반 슬로우 쿼리 대시보드
4. **Replication 모니터링**: Primary-Standby 구성시 지연 추적

## 📚 참고 자료
- [PostgreSQL Exporter](https://github.com/prometheus-community/postgres_exporter)
- [PostgreSQL Monitoring Best Practices](https://www.postgresql.org/docs/current/monitoring.html)
- [SSH Tunneling Guide](https://www.ssh.com/academy/ssh/tunneling)