#!/bin/bash

# Script để test gửi push notification
# Sử dụng: ./test-notification.sh

BASE_URL="http://localhost:3001"

echo "🧪 Test Push Notification"
echo "=========================="
echo ""

# Test 1: Health check
echo "1️⃣  Kiểm tra server..."
curl -s "$BASE_URL/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/health"
echo ""
echo ""

# Test 2: Xem danh sách subscriptions
echo "2️⃣  Danh sách subscriptions hiện tại:"
curl -s "$BASE_URL/api/notifications/webpush/subscriptions" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/notifications/webpush/subscriptions"
echo ""
echo ""

# Test 3: Gửi test notification
echo "3️⃣  Gửi test notification..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/notifications/webpush/test" \
  -H "Content-Type: application/json")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Kiểm tra kết quả
if echo "$RESPONSE" | grep -q "success.*true"; then
  echo "✅ Notification đã được gửi thành công!"
else
  echo "❌ Có lỗi xảy ra. Kiểm tra lại:"
  echo "   - Backend đang chạy chưa?"
  echo "   - Frontend đã subscribe chưa?"
fi

