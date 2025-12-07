# PWA Push Notification Server

Backend server để gửi push notifications cho PWA app, hỗ trợ cả iOS và Android.

## 📋 Yêu cầu

- Node.js >= 18
- npm hoặc yarn

## 🚀 Cài đặt

1. **Cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Tạo VAPID keys:**
```bash
npm run generate-keys
```

3. **Cấu hình environment variables:**
```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` và thêm VAPID keys đã generate ở bước 2:

```env
PORT=3001
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:admin@yourdomain.com
CORS_ORIGIN=http://localhost:5173
```

4. **Chạy server:**

Development mode (với hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Đăng ký Subscription
```
POST /api/notifications/webpush/subscribe
Body: {
  endpoint: string,
  keys: {
    p256dh: string,
    auth: string
  }
}
```

### 3. Gửi Test Notification
```
POST /api/notifications/webpush/test
```
Gửi notification test đến subscription cuối cùng.

### 4. Gửi Custom Notification
```
POST /api/notifications/webpush/send
Body: {
  subscription?: PushSubscription,  // Optional, nếu không có sẽ gửi đến tất cả
  payload: {
    title: string,
    body: string,
    icon?: string,
    badge?: string,
    url?: string,
    data?: object
  }
}
```

### 5. Lấy danh sách Subscriptions
```
GET /api/notifications/webpush/subscriptions
```

### 6. Xóa Subscription
```
DELETE /api/notifications/webpush/subscribe
Body: {
  endpoint: string
}
```

## 🧪 Test với cURL

### Đăng ký subscription (giả lập):
```bash
curl -X POST http://localhost:3001/api/notifications/webpush/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'
```

### Gửi test notification:
```bash
curl -X POST http://localhost:3001/api/notifications/webpush/test
```

### Gửi custom notification:
```bash
curl -X POST http://localhost:3001/api/notifications/webpush/send \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "title": "Thông báo mới",
      "body": "Nội dung thông báo",
      "url": "/dashboard"
    }
  }'
```

## 📱 iOS PWA Push Notifications

Để PWA có thể nhận push notifications trên iOS:

1. **iOS 16.4+** hỗ trợ Web Push cho PWAs
2. PWA phải được **thêm vào Home Screen** (Add to Home Screen)
3. Service Worker phải được đăng ký và active
4. User phải cho phép notifications

### Kiểm tra:
- Mở PWA trên Safari iOS
- Thêm vào Home Screen
- Mở từ Home Screen (không phải từ Safari)
- Cho phép notifications khi được hỏi

## 🔧 Troubleshooting

### Lỗi "VAPID keys chưa được cấu hình"
- Kiểm tra file `.env` có đầy đủ VAPID keys
- Đảm bảo VAPID keys giống nhau giữa frontend và backend

### Notification không hiển thị
- Kiểm tra subscription đã được lưu chưa
- Kiểm tra service worker đã active chưa
- Kiểm tra browser console để xem lỗi

### iOS không nhận được notifications
- Đảm bảo PWA được mở từ Home Screen (không phải Safari)
- Kiểm tra iOS version >= 16.4
- Kiểm tra Settings > Notifications cho app

## 📝 Lưu ý

- Trong production, nên lưu subscriptions vào database thay vì memory
- Nên implement authentication để bảo vệ API endpoints
- Nên implement rate limiting để tránh spam
- Nên log và monitor các lỗi khi gửi notifications

