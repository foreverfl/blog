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

AUTH_HEADER="Authorization: Bearer $HACKERNEWS_API_KEY"

echo "📥 Fetching saved HackerNews contents from $BASE_URL"
SAVED_LIST=$(curl -L -s -w "\n%{http_code}" -X GET "$BASE_URL/api/hackernews/saved" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")

HTTP_BODY=$(echo "$SAVED_LIST" | head -n -1)
HTTP_STATUS=$(echo "$SAVED_LIST" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
  log_message "❌ Failed to get saved list! HTTP Status: $HTTP_STATUS"
  log_message "Response: $HTTP_BODY"
  exit 1
fi

IDS=$(echo "$HTTP_BODY" | jq -r '.[].id')

for id in $IDS; do
  echo "📝 Summarizing content for ID: $id"
  RESPONSE=$(curl -L -s -X POST "$BASE_URL/api/hackernews/summarize/" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"id\": \"$id\", \"webhookUrl\": \"$BASE_URL/api/hackernews/webhook/summary\"}")

  echo "✅ Summarize triggered for ID: $id"
done

echo "🏁 Summarizing requests completed!"
