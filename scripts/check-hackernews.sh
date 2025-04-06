#!/bin/bash

set -e

TYPE=$1
TARGET_DATE=$2 

log_message() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

if [ "$GITHUB_ACTIONS" != "true" ] && [ -f ".env.local" ]; then
  log_message "📂 Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
fi

if [ "$GITHUB_ACTIONS" = "true" ]; then
  log_message "🌐 Running in GitHub Actions"
  BASE_URL="https://mogumogu.dev"
else
  log_message "💻 Running locally"
  BASE_URL="http://localhost:3000"
fi

# Check if TYPE is provided
if [ -z "$HACKERNEWS_API_KEY" ]; then
  log_message "❌ Error: HACKERNEWS_API_KEY environment variable not set!"
  exit 1
fi

DATE=${TARGET_DATE:-$(date +"%y%m%d")}
AUTH_HEADER="Authorization: Bearer $HACKERNEWS_API_KEY"
COUNT_URL="$BASE_URL/api/hackernews/count/$DATE"

log_message "📊 Checking HackerNews progress for '$TYPE' on $DATE..."

STABLE_COUNT=-1
STABLE_REPEAT=0
STABLE_THRESHOLD=5
MAX_LOOP=180
SLEEP_SEC=90

for ((i=1; i<=MAX_LOOP; i++)); do
  response=$(curl -s -H "$AUTH_HEADER" "$COUNT_URL")
  padded_index=$(printf "%02d" $i)
  enCount=$(echo "$response" | jq ".counts.nullSummaryEnCount")

  case "$TYPE" in
    summary)
      count=$(echo "$response" | jq ".counts.nullSummaryEnCount")
      log_message "⏱️ [$padded_index] nullSummaryEnCount=$count"
      ;;
    translation-ko)
      count=$(echo "$response" | jq ".counts.nullSummaryKoCount")
      log_message "⏱️ [$padded_index] nullSummaryKoCount=$count (nullSummaryEnCount: $enCount)"
      if [ "$count" -eq "$enCount" ]; then
        log_message "✅ 'translation-ko' step done (count matched EN)"
        exit 0
      fi
      ;;
    translation-ja)
      count=$(echo "$response" | jq ".counts.nullSummaryJaCount")
      log_message "⏱️ [$padded_index] nullSummaryJaCount=$count (nullSummaryEnCount: $enCount)"
      if [ "$count" -eq "$enCount" ]; then
        log_message "✅ 'translation-ja' step done (count matched EN)"
        exit 0
      fi
      ;;
    *)
      log_message "❌ Unknown TYPE: $TYPE"
      exit 1
      ;;
  esac

  if [ "$count" -eq "$STABLE_COUNT" ]; then
    STABLE_REPEAT=$((STABLE_REPEAT + 1))
    log_message "🔁 Count unchanged for $STABLE_REPEAT times"
    if [ "$STABLE_REPEAT" -ge "$STABLE_THRESHOLD" ]; then
      log_message "✅ '$TYPE' step seems done (unchanged for $STABLE_REPEAT times)"
      exit 0
    fi
  else
    STABLE_COUNT=$count
    STABLE_REPEAT=0
  fi

  sleep "$SLEEP_SEC"
done

log_message "⚠️ Timeout reached. '$TYPE' step may be incomplete."
exit 1