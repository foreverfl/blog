#!/bin/bash

TARGET_DATE=$1

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

echo "📥 Fetching HackerNews list from $BASE_URL"
HACKERNEWS_LIST=$(curl -L -s -w "\n%{http_code}" -X GET "$BASE_URL/api/hackernews" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")

HTTP_BODY=$(echo "$HACKERNEWS_LIST" | head -n -1)
HTTP_STATUS=$(echo "$HACKERNEWS_LIST" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
  log_message "❌ Failed! HTTP Status: $HTTP_STATUS"
  log_message "Response: $HTTP_BODY"
  exit 1
fi

# extract IDs from the JSON response
IDS=$(echo "$HTTP_BODY" | jq -r '.[].id')
# echo "📝 Found IDs: $IDS"

echo "🚀 Running content fetcher for HackerNews (Date: ${TARGET_DATE:-today})"
npx tsx scripts/fetchContents.ts "$TARGET_DATE"

echo "🏁 All done!"