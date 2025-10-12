#!/bin/bash

# Grafana CloudWatch IAM 설정 스크립트
#
# 사용법: ./setup-grafana-iam.sh

set -e

echo "🔧 Grafana CloudWatch IAM 설정 시작..."

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# IAM 사용자 이름
IAM_USER_NAME="grafana-cloudwatch-user"
IAM_POLICY_NAME="GrafanaCloudWatchReadOnlyPolicy"

echo -e "${YELLOW}1. IAM 정책 생성 중...${NC}"
POLICY_ARN=$(aws iam create-policy \
    --policy-name $IAM_POLICY_NAME \
    --policy-document file://grafana-cloudwatch-policy.json \
    --description "Policy for Grafana to read CloudWatch metrics and logs" \
    --query 'Policy.Arn' \
    --output text 2>/dev/null || \
    aws iam list-policies --query "Policies[?PolicyName=='$IAM_POLICY_NAME'].Arn" --output text)

if [ -z "$POLICY_ARN" ]; then
    echo -e "${RED}❌ 정책 생성 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 정책 생성/확인 완료: $POLICY_ARN${NC}"

echo -e "${YELLOW}2. IAM 사용자 생성 중...${NC}"
aws iam create-user --user-name $IAM_USER_NAME 2>/dev/null || \
    echo -e "${YELLOW}   사용자가 이미 존재합니다.${NC}"

echo -e "${YELLOW}3. 정책을 사용자에게 연결 중...${NC}"
aws iam attach-user-policy \
    --user-name $IAM_USER_NAME \
    --policy-arn $POLICY_ARN

echo -e "${GREEN}✅ 정책 연결 완료${NC}"

echo -e "${YELLOW}4. Access Key 생성 중...${NC}"
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $IAM_USER_NAME)

ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

# 자격 증명을 안전한 파일에 저장
CREDENTIALS_FILE="grafana-aws-credentials.txt"
cat > $CREDENTIALS_FILE << EOF
# Grafana CloudWatch 연동 자격 증명
# ⚠️  이 파일을 안전하게 보관하고 절대 Git에 커밋하지 마세요!

AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY
AWS_DEFAULT_REGION=ap-northeast-2

# Grafana 데이터소스 설정시 필요한 정보:
User Name: $IAM_USER_NAME
Policy ARN: $POLICY_ARN
EOF

chmod 600 $CREDENTIALS_FILE

echo -e "${GREEN}✅ IAM 설정 완료!${NC}"
echo ""
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "1. $CREDENTIALS_FILE 파일의 자격 증명을 확인하세요"
echo "2. Grafana Cloud에서 CloudWatch 데이터소스를 추가하세요"
echo "3. 설정 완료 후 $CREDENTIALS_FILE 파일을 안전한 곳에 보관하세요"
echo ""
echo -e "${RED}⚠️  보안 주의사항:${NC}"
echo "- $CREDENTIALS_FILE 파일을 Git에 커밋하지 마세요"
echo "- .gitignore에 추가되었는지 확인하세요"
echo "- 사용 후 파일을 삭제하거나 안전한 곳에 보관하세요"