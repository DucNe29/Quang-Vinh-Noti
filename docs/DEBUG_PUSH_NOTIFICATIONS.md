# 🐛 Debug Push Notifications

## Vấn đề: Đã cho phép thông báo nhưng không có subscription

### Nguyên nhân có thể:

1. **Backend không chạy hoặc URL sai**
   - Frontend đang gọi đến backend production thay vì localhost:3001
   - Backend local chưa được khởi động

2. **Subscription đã được tạo nhưng không gửi lên backend thành công**
   - Lỗi network
   - CORS issue
   - Backend endpoint không đúng

3. **Service Worker chưa ready**
   - Service worker chưa được đăng ký
   - Service worker bị lỗi

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật `pushService.ts`
- ✅ Thêm logging chi tiết để debug
- ✅ Tự động detect backend URL (localhost:3001 cho development)
- ✅ Xử lý lỗi tốt hơn
- ✅ Gửi lại subscription nếu đã tồn tại

### 2. Thêm Debug Button
- ✅ Component `DebugPushButton` để kiểm tra toàn bộ hệ thống
- ✅ Kiểm tra Service Worker
- ✅ Kiểm tra Notification Permission
- ✅ Kiểm tra VAPID Key
- ✅ Kiểm tra kết nối backend
- ✅ Kiểm tra subscriptions trên backend

### 3. Cấu hình Environment
- ✅ Thêm `VITE_PUSH_SERVER_URL=http://localhost:3001` vào `.env`

## 🔧 Cách sử dụng Debug Button

1. **Import và sử dụng component:**
```tsx
import { DebugPushButton } from '@/components/ui/debug-push-button'

// Trong component của bạn
<DebugPushButton />
```

2. **Click button "Debug Push Notifications"**
   - Sẽ kiểm tra toàn bộ hệ thống
   - Hiển thị thông tin chi tiết
   - Tự động thử subscribe nếu chưa có

3. **Xem console logs**
   - Mở Developer Tools (F12)
   - Xem tab Console
   - Sẽ có các log chi tiết về quá trình subscribe

## 📋 Checklist Debug

### Bước 1: Kiểm tra Backend
```bash
# Kiểm tra backend có đang chạy không
curl http://localhost:3001/health

# Kiểm tra subscriptions
curl http://localhost:3001/api/notifications/webpush/subscriptions
```

### Bước 2: Kiểm tra Frontend
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Chạy lệnh:
```javascript
// Kiểm tra Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs)
  if (regs.length > 0) {
    regs[0].pushManager.getSubscription().then(sub => {
      console.log('Subscription:', sub)
    })
  }
})

// Kiểm tra Notification Permission
console.log('Notification Permission:', Notification.permission)

// Kiểm tra VAPID Key
console.log('VAPID Key:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
```

### Bước 3: Kiểm tra Network
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Thử subscribe lại
4. Xem request đến `/api/notifications/webpush/subscribe`
   - Status code phải là 200
   - Response phải có `success: true`

## 🔍 Các lỗi thường gặp

### 1. "Backend error: 404"
**Nguyên nhân:** Backend không chạy hoặc URL sai
**Giải pháp:**
```bash
cd backend
npm run dev
```

### 2. "CORS error"
**Nguyên nhân:** Backend chưa cấu hình CORS đúng
**Giải pháp:** Kiểm tra `CORS_ORIGIN` trong `backend/.env`

### 3. "Thiếu VITE_VAPID_PUBLIC_KEY"
**Nguyên nhân:** File `.env` chưa có VAPID key
**Giải pháp:** Thêm vào `.env`:
```env
VITE_VAPID_PUBLIC_KEY=your-public-key
```

### 4. "Subscription không được lưu"
**Nguyên nhân:** Request đến backend thất bại
**Giải pháp:**
- Kiểm tra backend có đang chạy không
- Kiểm tra network tab xem request có lỗi gì không
- Kiểm tra console logs

## 🚀 Test nhanh

1. **Chạy backend:**
```bash
cd backend
npm run dev
```

2. **Chạy frontend:**
```bash
npm run dev
```

3. **Mở app và click "Debug Push Notifications"**

4. **Xem kết quả:**
   - Nếu tất cả đều ✅ → Hệ thống hoạt động tốt
   - Nếu có ❌ → Xem thông tin lỗi và sửa

5. **Gửi test notification:**
```bash
curl -X POST http://localhost:3001/api/notifications/webpush/test
```

## 📝 Logs mẫu khi thành công

```
✅ Subscription đã được tạo: { endpoint: 'https://...', keys: {...} }
📤 Đang gửi subscription lên backend: http://localhost:3001/api/notifications/webpush/subscribe
✅ Subscription đã được lưu trên backend: { success: true, totalSubscriptions: 1 }
```

## 📝 Logs mẫu khi lỗi

```
❌ Lỗi khi gửi subscription lên backend: TypeError: Failed to fetch
   → Kiểm tra backend có đang chạy không?
```

