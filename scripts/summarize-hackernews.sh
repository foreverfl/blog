#!/bin/bash

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

if [ -z "$HACKERNEWS_API_KEY" ]; then
  echo "❌ Error: HACKERNEWS_API_KEY environment variable not set!"
  exit 1
fi

LANG=$1
if [ -z "$LANG" ]; then
  echo "❌ Error: Translation language not specified! (ex. ja or ko)"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $HACKERNEWS_API_KEY"

echo "📥 Fetching summarized HackerNews content from $BASE_URL"
SUMMARIZED_LIST=$(curl -L -s -w "\n%{http_code}" -X GET "$BASE_URL/api/hackernews/summarized" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")

HTTP_BODY=$(echo "$SUMMARIZED_LIST" | head -n -1)
HTTP_STATUS=$(echo "$SUMMARIZED_LIST" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
  log_message "❌ Failed to get summarized list! HTTP Status: $HTTP_STATUS"
  log_message "Response: $HTTP_BODY"
  exit 1
fi

IDS=$(echo "$HTTP_BODY" | jq -r '.[].id')

for id in $IDS; do
  echo "🌍 Translating content for ID: $id to $LANG"
  RESPONSE=$(curl -L -s -X POST "$BASE_URL/api/hackernews/translate/" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"id\": \"$id\", \"lan\": \"$LANG\", \"webhookUrl\": \"$BASE_URL/api/hackernews/webhook/summary\"}")

  echo "✅ Translate triggered for ID: $id to $LANG"
done

echo "🏁 Translation requests completed!"
