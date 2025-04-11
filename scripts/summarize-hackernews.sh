#!/bin/bash

log_message() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

TARGET_DATE="$1"

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

if [ -z "$HACKERNEWS_API_KEY" ]; then
  log_message "❌ Error: HACKERNEWS_API_KEY environment variable not set!"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $HACKERNEWS_API_KEY"

if [ -n "$TARGET_DATE" ]; then
  LIST_ENDPOINT="$BASE_URL/api/hackernews/$TARGET_DATE"
else
  LIST_ENDPOINT="$BASE_URL/api/hackernews"
fi

log_message "📥 Fetching HackerNews content list from $LIST_ENDPOINT"
HACKERNEWS_LIST=$(curl -L -s -w "\n%{http_code}" -X GET "$LIST_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")

HTTP_STATUS=$(echo "$HACKERNEWS_LIST" | tail -n 1)
HTTP_BODY=$(echo "$HACKERNEWS_LIST" | sed '$d')

if [ "$HTTP_STATUS" != "200" ]; then
  log_message "❌ Failed to get HackerNews list! HTTP Status: $HTTP_STATUS"
  log_message "Response: $HTTP_BODY"
  exit 1
fi

IDS=$(echo "$HTTP_BODY" | jq -r '.[] | select(.content != null and (.summary.en == null or .summary.en == "")) | .id')

i=1
echo "$IDS" | while read -r id; do
  if [ -z "$id" ]; then
    continue
  fi

  padded_index=$(printf "%02d" $i)

  if [ -n "$TARGET_DATE" ]; then
    ENDPOINT="$BASE_URL/api/hackernews/summarize/$TARGET_DATE"
  else
    ENDPOINT="$BASE_URL/api/hackernews/summarize/"
  fi

  log_message "🚀 [$padded_index] Sending summarize request for ID: $id (Date: ${TARGET_DATE:-today})"
  RESPONSE=$(curl -L -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"id\": \"$id\", \"webhookUrl\": \"$BASE_URL/api/hackernews/webhook/summary\"}")

  SUCCESS=$(echo "$RESPONSE" | jq -r '.ok')
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // empty')

  if [ "$SUCCESS" == "true" ]; then
    log_message "✅ Summarize request sent for ID: $id"
  else
    log_message "⚠️  Failed to summarize ID: $id"
    if [ ! -z "$ERROR_MSG" ]; then
      log_message "🛑 Reason: $ERROR_MSG"
    fi
  fi

  i=$((i + 1))
done

log_message "🏁 All summarization requests sent!"