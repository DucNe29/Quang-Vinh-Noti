# 📡 CURL Commands để test Push Notifications

## 🧪 1. Test Notification (Đơn giản nhất)

Gửi test notification đến subscription cuối cùng:

```bash
curl -X POST http://localhost:3001/api/notifications/webpush/test
```

## 📤 2. Gửi Custom Notification

Gửi notification với nội dung tùy chỉnh:

```bash
curl -X POST http://localhost:3001/api/notifications/webpush/send \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "title": "Thông báo mới",
      "body": "Đây là nội dung thông báo",
      "icon": "/icon-192x192.png",
      "badge": "/icon-192x192.png",
      "url": "/dashboard"
    }
  }'
```

## 📤 3. Gửi Custom Notification với data

```bash
curl -X POST http://localhost:3001/api/notifications/webpush/send \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "title": "Task mới được giao",
      "body": "Bạn có một task mới cần xử lý",
      "icon": "/icon-192x192.png",
      "badge": "/icon-192x192.png",
      "url": "/tasks/123",
      "data": {
        "taskId": "123",
        "type": "task_assigned"
      }
    }
  }'
```

## 📋 4. Xem danh sách Subscriptions

```bash
curl http://localhost:3001/api/notifications/webpush/subscriptions
```

## ✅ 5. Health Check

```bash
curl http://localhost:3001/health
```

## 🔍 6. Xem response đẹp hơn (với jq)

Nếu đã cài `jq`:

```bash
curl -s http://localhost:3001/health | jq '.'
curl -s -X POST http://localhost:3001/api/notifications/webpush/test | jq '.'
```

## 📝 7. Ví dụ đầy đủ với các options

```bash
# Verbose mode để xem chi tiết
curl -v -X POST http://localhost:3001/api/notifications/webpush/test \
  -H "Content-Type: application/json"

# Lưu response vào file
curl -X POST http://localhost:3001/api/notifications/webpush/test \
  -o response.json

# Xem response
cat response.json | jq '.'
```

## 🚀 Sử dụng Scripts (Dễ hơn)

### Test notification:

```bash
cd backend
./test-notification.sh
```

### Gửi custom notification:

```bash
cd backend
./send-custom-notification.sh "Tiêu đề" "Nội dung" "/url"
```

Ví dụ:

```bash
./send-custom-notification.sh "Task mới" "Bạn có task mới cần xử lý" "/tasks"
```

## 💡 Tips

1. **Kiểm tra server đang chạy:**

   ```bash
   curl http://localhost:3001/health
   ```

2. **Kiểm tra có subscription chưa:**

   ```bash
   curl http://localhost:3001/api/notifications/webpush/subscriptions
   ```

3. **Nếu không có subscription:**
   - Mở frontend app
   - Click button "Bật thông báo hệ thống"
   - Cho phép notifications
   - Sau đó mới gửi test notification

4. **Test trên iOS:**
   - Đảm bảo PWA được mở từ Home Screen
   - Không mở từ Safari
   - iOS version >= 16.4
