#!/bin/bash

LANG=$1
if [ -z "$LANG" ]; then
  echo "❌ Error: Translation language not specified! (ex. ja or ko)"
  exit 1
fi

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
SAVED_LIST=$(curl -L -s -w "\n%{http_code}" -X GET "$BASE_URL/api/hackernews" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")

HTTP_BODY=$(echo "$SAVED_LIST" | head -n -1)
HTTP_STATUS=$(echo "$SAVED_LIST" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
  log_message "❌ Failed to get saved list! HTTP Status: $HTTP_STATUS"
  log_message "Response: $HTTP_BODY"
  exit 1
fi

IDS=$(echo "$HTTP_BODY" | jq -r ".[] | select((.summary.en != null) and ((.summary[\"$LANG\"] == null) or (.summary[\"$LANG\"] == \"\"))) | .id")

echo "$IDS" | while read -r id; do
  if [ -z "$id" ]; then
    continue
  fi
  echo "🌏 Sending translate request for ID: $id to $LANG"
  RESPONSE=$(curl -L -s -X POST "$BASE_URL/api/hackernews/translate/" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"id\": \"$id\", \"lan\": \"$LANG\", \"webhookUrl\": \"$BASE_URL/api/hackernews/webhook/translate\"}")

  SUCCESS=$(echo "$RESPONSE" | jq -r '.ok')
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // empty')

  if [ "$SUCCESS" == "true" ]; then
    echo "✅ Translate request sent for ID: $id ($LANG)"
  else
    echo "⚠️  Failed to translate ID: $id"
    if [ ! -z "$ERROR_MSG" ]; then
      echo "🛑 Reason: $ERROR_MSG"
    fi
  fi
done

echo "🏁 All translation requests sent for language: $LANG!"