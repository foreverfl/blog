#!/bin/bash

set -e

TYPE=$1
TARGET_DATE=$2 

log_message() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

if [ "$GITHUB_ACTIONS" != "true" ] && [ -f ".env.local" ]; then
  echo "📂 Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
fi

if [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "🌐 Running in GitHub Actions"
  BASE_URL="https://mogumogu.dev"
else
  echo "💻 Running locally"
  BASE_URL="http://localhost:3000"
fi

# Check if TYPE is provided
if [ -z "$HACKERNEWS_API_KEY" ]; then
  echo "❌ Error: HACKERNEWS_API_KEY environment variable not set!"
  exit 1
fi

DATE=${TARGET_DATE:-$(date +"%y%m%d")}
AUTH_HEADER="Authorization: Bearer $HACKERNEWS_API_KEY"
COUNT_URL="$BASE_URL/api/hackernews/count/$DATE"

log_message "📊 Checking HackerNews progress for '$TYPE' on $DATE..."

STABLE_COUNT=-1
STABLE_REPEAT=0
STABLE_THRESHOLD=3  # 몇 번 연속 유지되면 종료할지

for i in {1..60}; do
  response=$(curl -s -H "$AUTH_HEADER" "$COUNT_URL")

  case "$TYPE" in
    summary)
      count=$(echo "$response" | jq ".counts.nullSummaryEnCount")
      echo "⏱️ [$i] nullSummaryEnCount=$count"
      ;;
    translation-ko)
      count=$(echo "$response" | jq ".counts.nullSummaryKoCount")
      echo "⏱️ [$i] nullSummaryKoCount=$count"
      ;;
    translation-ja)
      count=$(echo "$response" | jq ".counts.nullSummaryJaCount")
      echo "⏱️ [$i] nullSummaryJaCount=$count"
      ;;
    *)
      echo "❌ Unknown TYPE: $TYPE"
      exit 1
      ;;
  esac

  if [ "$count" -eq "$STABLE_COUNT" ]; then
    STABLE_REPEAT=$((STABLE_REPEAT + 1))
    echo "🔁 Count unchanged for $STABLE_REPEAT times"
    if [ "$STABLE_REPEAT" -ge "$STABLE_THRESHOLD" ]; then
      echo "✅ '$TYPE' step seems done (unchanged for $STABLE_REPEAT times)"
      exit 0
    fi
  else
    STABLE_COUNT=$count
    STABLE_REPEAT=0
  fi

  sleep 10
done

log_message "⚠️ Timeout reached. '$TYPE' step may be incomplete."
exit 1
