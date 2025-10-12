# Grafana Cloud CloudWatch 연동 가이드

## 📊 Grafana Cloud 데이터소스 설정

### 1. Grafana Cloud 접속

- [Grafana Cloud](https://grafana.com) 로그인
- 좌측 메뉴에서 **Connections** → **Data sources** 클릭

### 2. CloudWatch 데이터소스 추가

1. **Add data source** 버튼 클릭
2. **CloudWatch** 검색 및 선택
3. 다음 정보 입력:

#### Authentication Provider

- **Access & secret key** 선택

#### Connection Details

```
Default Region: ap-northeast-2
```

#### Authentication

```
Access Key ID: [setup-grafana-iam.sh 실행 후 생성된 값]
Secret Access Key: [setup-grafana-iam.sh 실행 후 생성된 값]
```

#### Optional Settings

- **Assume Role ARN**: 비워두기 (직접 액세스 키 사용)
- **External ID**: 비워두기
- **Default Query Type**: CloudWatch Metrics
- **Custom Metrics namespace**: 필요시 설정
- **Auth Provider**: AWS SDK Default

4. **Save & Test** 버튼 클릭
5. "Data source is working" 메시지 확인

## 🎯 모니터링할 주요 메트릭

### EC2 인스턴스 메트릭

```yaml
Namespace: AWS/EC2
Dimensions:
  - InstanceId: [YOUR_INSTANCE_ID]
Metrics:
  - CPUUtilization
  - NetworkIn/NetworkOut
  - DiskReadBytes/DiskWriteBytes
  - StatusCheckFailed
```

### Docker 컨테이너 메트릭 (CloudWatch Agent 설치 필요)

```yaml
Namespace: CWAgent
Metrics:
  - cpu_usage_total
  - mem_used_percent
  - disk_used_percent
```

### Application 메트릭 (Custom)

```yaml
Namespace: CustomApp/Blog
Metrics:
  - RequestCount
  - RequestLatency
  - ErrorRate
  - ActiveConnections
```

## 📈 대시보드 템플릿

### 1. EC2 & Docker 모니터링 대시보드

```json
{
  "dashboard": {
    "title": "Blog Application Monitoring",
    "panels": [
      {
        "title": "CPU Utilization",
        "type": "graph",
        "targets": [
          {
            "namespace": "AWS/EC2",
            "metricName": "CPUUtilization",
            "statistics": ["Average", "Maximum"],
            "dimensions": {
              "InstanceId": "$instance_id"
            }
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "targets": [
          {
            "namespace": "CWAgent",
            "metricName": "mem_used_percent",
            "statistics": ["Average"]
          }
        ]
      },
      {
        "title": "Network Traffic",
        "type": "graph",
        "targets": [
          {
            "namespace": "AWS/EC2",
            "metricName": "NetworkIn",
            "statistics": ["Sum"]
          },
          {
            "namespace": "AWS/EC2",
            "metricName": "NetworkOut",
            "statistics": ["Sum"]
          }
        ]
      },
      {
        "title": "Application Health",
        "type": "stat",
        "targets": [
          {
            "namespace": "AWS/EC2",
            "metricName": "StatusCheckFailed",
            "statistics": ["Maximum"]
          }
        ]
      }
    ]
  }
}
```

### 2. Application Performance 대시보드

주요 패널:

- **Request Rate**: 분당 요청 수
- **Response Time**: P50, P95, P99 레이턴시
- **Error Rate**: 5xx 에러 비율
- **Container Status**: 컨테이너 상태 및 재시작 횟수

## 🚨 알람 설정 예시

### Critical Alerts

```yaml
- CPU > 90% for 5 minutes
- Memory > 85% for 5 minutes
- Disk Usage > 80%
- StatusCheckFailed = 1
- Container Restart > 3 in 10 minutes
```

### Warning Alerts

```yaml
- CPU > 70% for 10 minutes
- Memory > 70% for 10 minutes
- Response Time P95 > 1s
- Error Rate > 1%
```

## 📝 CloudWatch Logs Insights 쿼리 예시

### 최근 에러 로그 확인

```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

### API 응답 시간 분석

```sql
fields @timestamp, duration
| filter @message like /api/
| stats avg(duration) as avg_duration,
        pct(duration, 95) as p95_duration,
        pct(duration, 99) as p99_duration
by bin(5m)
```

### 컨테이너 재시작 이벤트

```sql
fields @timestamp, @message
| filter @message like /container.*restart/
| sort @timestamp desc
```

## 🔧 추가 설정 (선택사항)

### CloudWatch Agent 설치 (상세 메트릭 수집)

EC2 인스턴스에서:

```bash
# CloudWatch Agent 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# 설정 파일 생성
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Agent 시작
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

### Docker 메트릭 수집 설정

`docker-compose.prod.yml`에 추가:

```yaml
services:
  app:
    # 기존 설정...
    logging:
      driver: awslogs
      options:
        awslogs-region: ap-northeast-2
        awslogs-group: /ecs/blog-app
        awslogs-stream-prefix: blog
```

## 🔍 트러블슈팅

### 일반적인 문제 해결

1. **"Data source is not working" 에러**
   - IAM 권한 확인
   - Region 설정 확인
   - Access Key 유효성 확인

2. **메트릭이 표시되지 않음**
   - CloudWatch에서 메트릭 존재 확인
   - Namespace와 Dimension 정확성 확인
   - 시간 범위 설정 확인

3. **로그가 보이지 않음**
   - CloudWatch Logs 권한 확인
   - Log Group 이름 확인
   - 로그 스트림 존재 확인

## 📚 참고 자료

- [Grafana CloudWatch 공식 문서](https://grafana.com/docs/grafana/latest/datasources/cloudwatch/)
- [AWS CloudWatch 메트릭 목록](https://docs.aws.amazon.com/cloudwatch/latest/monitoring/aws-services-cloudwatch-metrics.html)
- [CloudWatch Logs Insights 쿼리 구문](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
