# Hướng dẫn kiểm tra PWA Push Notifications trên iOS

## ✅ Kiểm tra cấu hình hiện tại

PWA của bạn đã được cấu hình để hỗ trợ push notifications trên iOS với các yếu tố sau:

### 1. Service Worker (`src/sw.ts`)
- ✅ Đã có event listener cho `push` event
- ✅ Đã có event listener cho `notificationclick` event
- ✅ Service worker được đăng ký qua Vite PWA plugin

### 2. Manifest (`manifest.json`)
- ✅ `display: "standalone"` - Bắt buộc cho iOS PWA
- ✅ Có `gcm_sender_id` (cho Firebase Cloud Messaging nếu cần)
- ✅ Có đầy đủ icons

### 3. HTML Meta Tags (`index.html`)
- ✅ `apple-mobile-web-app-capable` - Cho phép PWA chạy standalone
- ✅ `apple-mobile-web-app-status-bar-style`
- ✅ `apple-mobile-web-app-title`

### 4. Push Service (`src/service/push/pushService.ts`)
- ✅ Đã có function `subscribeUserToPush()`
- ✅ Đã có function `triggerTestPush()`
- ✅ Đã tích hợp với VAPID keys

## 📱 Yêu cầu cho iOS

1. **iOS Version**: iOS 16.4+ (Web Push chỉ hỗ trợ từ iOS 16.4)
2. **Browser**: Safari (không hỗ trợ trên Chrome iOS)
3. **PWA phải được thêm vào Home Screen**: 
   - Mở PWA trên Safari
   - Tap vào nút Share
   - Chọn "Add to Home Screen"
   - Mở app từ Home Screen (KHÔNG mở từ Safari)

## 🧪 Cách test trên iOS

### Bước 1: Setup Backend

```bash
cd backend
npm install
npm run generate-keys
# Copy VAPID keys vào file .env
cp .env.example .env
# Chỉnh sửa .env với VAPID keys đã generate
npm run dev
```

### Bước 2: Setup Frontend

1. Thêm VAPID public key vào file `.env` của frontend:
```env
VITE_VAPID_PUBLIC_KEY=<public-key-từ-backend>
```

2. Chạy frontend:
```bash
npm run dev
```

### Bước 3: Test trên iOS Device

1. **Mở PWA trên Safari iOS** (không phải Chrome)
2. **Thêm vào Home Screen**:
   - Tap nút Share (hình vuông với mũi tên)
   - Scroll xuống và chọn "Add to Home Screen"
   - Đặt tên cho app
   - Tap "Add"

3. **Mở app từ Home Screen** (quan trọng!)
   - Đóng Safari
   - Mở app từ Home Screen icon
   - App sẽ chạy ở chế độ standalone

4. **Cho phép Notifications**:
   - Khi app yêu cầu permission, chọn "Allow"
   - Hoặc vào Settings > [App Name] > Notifications và bật

5. **Đăng ký Push Subscription**:
   - Trong app, tìm button "Bật thông báo hệ thống" hoặc "Test Push Notification"
   - Tap để đăng ký

6. **Test gửi notification**:
   - Từ backend, gửi test notification:
   ```bash
   curl -X POST http://localhost:3001/api/notifications/webpush/test
   ```
   - Hoặc dùng button "Test Push Notification" trong app

7. **Test khi app không hoạt động**:
   - Đóng app hoàn toàn (swipe up và đóng)
   - Gửi notification từ backend
   - Notification sẽ xuất hiện trên lock screen hoặc notification center

## 🔍 Kiểm tra Service Worker

Để kiểm tra service worker đã active chưa:

1. Mở Safari Developer Tools (nếu có Mac):
   - Kết nối iPhone với Mac
   - Mở Safari trên Mac
   - Develop > [Your iPhone] > [Your PWA]

2. Hoặc dùng console trong app:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations)
})
```

## ⚠️ Lưu ý quan trọng

1. **iOS chỉ hỗ trợ Web Push từ iOS 16.4+**
   - Nếu device < iOS 16.4, push notifications sẽ không hoạt động

2. **Phải mở từ Home Screen**
   - Push notifications KHÔNG hoạt động nếu mở PWA từ Safari
   - Phải mở từ Home Screen icon

3. **HTTPS bắt buộc**
   - Push notifications chỉ hoạt động trên HTTPS
   - Localhost OK cho development
   - Production cần HTTPS

4. **Service Worker phải active**
   - Kiểm tra service worker đã được đăng ký và active
   - Có thể kiểm tra trong Safari Developer Tools

5. **VAPID Keys phải giống nhau**
   - Frontend và Backend phải dùng cùng VAPID keys
   - Public key cho frontend, Private key cho backend

## 🐛 Troubleshooting

### Notification không hiển thị

1. Kiểm tra subscription đã được lưu:
   ```bash
   curl http://localhost:3001/api/notifications/webpush/subscriptions
   ```

2. Kiểm tra service worker:
   - Mở Safari Developer Tools
   - Xem tab "Service Workers"
   - Đảm bảo service worker đang active

3. Kiểm tra permissions:
   - Settings > [App Name] > Notifications
   - Đảm bảo "Allow Notifications" đã bật

4. Kiểm tra console logs:
   - Xem có lỗi gì trong console không
   - Kiểm tra network requests

### Subscription không được lưu

1. Kiểm tra backend đang chạy:
   ```bash
   curl http://localhost:3001/health
   ```

2. Kiểm tra CORS:
   - Đảm bảo `CORS_ORIGIN` trong backend `.env` đúng với frontend URL

3. Kiểm tra VAPID keys:
   - Đảm bảo public key trong frontend `.env` giống với backend

### iOS không nhận được notifications

1. Kiểm tra iOS version >= 16.4
2. Đảm bảo mở app từ Home Screen (không phải Safari)
3. Kiểm tra app đã được thêm vào Home Screen chưa
4. Kiểm tra Settings > Notifications cho app

## 📚 Tài liệu tham khảo

- [Apple: Web Push Notifications for PWAs](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)

