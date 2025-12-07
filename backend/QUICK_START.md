# 🚀 Quick Start Guide

## ✅ Đã cấu hình sẵn

- ✅ VAPID keys đã được generate và cấu hình trong `backend/.env`
- ✅ Frontend `.env` đã có VAPID public key
- ✅ Backend sẵn sàng chạy

## 📝 Chạy Backend

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: `http://localhost:3001`

## 🧪 Test Backend

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Gửi Test Notification
Sau khi frontend đã subscribe, gửi test notification:
```bash
curl -X POST http://localhost:3001/api/notifications/webpush/test
```

### 3. Xem danh sách Subscriptions
```bash
curl http://localhost:3001/api/notifications/webpush/subscriptions
```

## 📱 Test trên Frontend

1. Chạy frontend:
```bash
npm run dev
```

2. Mở app và click button "Bật thông báo hệ thống" hoặc "Test Push Notification"

3. Cho phép notifications khi được hỏi

4. Gửi test notification từ backend hoặc click button "Test Push Notification" trong app

## 🔑 VAPID Keys

**Public Key (Frontend):**
```
BMFxcjSd4SsaO12aORIUC-yryEpM7jMQhz8Mb_WBfiPLTYzxUddLdxk2kQjoQY1-zMF2r8KuKwBYhsnQ2ZUL51s
```

**Private Key (Backend - đã lưu trong .env):**
```
ZNA8dOEoZZG5Y15bLCcfRYwR35ct8rcwz6Jfv90N_pI
```

## ⚠️ Lưu ý

- Backend và Frontend phải chạy cùng lúc
- Đảm bảo CORS_ORIGIN trong backend/.env đúng với frontend URL
- Trên iOS, phải mở PWA từ Home Screen (không phải Safari)

