#!/bin/bash

# Script để gửi custom push notification
# Sử dụng: ./send-custom-notification.sh "Tiêu đề" "Nội dung" "/url"

BASE_URL="http://localhost:3001"

TITLE="${1:-Thông báo mới}"
BODY="${2:-Đây là nội dung thông báo}"
URL="${3:-/}"

echo "📤 Gửi custom notification..."
echo "Tiêu đề: $TITLE"
echo "Nội dung: $BODY"
echo "URL: $URL"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications/webpush/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"payload\": {
      \"title\": \"$TITLE\",
      \"body\": \"$BODY\",
      \"icon\": \"/icon-192x192.png\",
      \"badge\": \"/icon-192x192.png\",
      \"url\": \"$URL\"
    }
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success.*true"; then
  echo "✅ Notification đã được gửi thành công!"
else
  echo "❌ Có lỗi xảy ra"
fi

