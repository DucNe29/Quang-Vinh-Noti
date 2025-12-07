import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import notificationRoutes from './routes/notifications'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Push Notification Server đang chạy',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/notifications/webpush', notificationRoutes)

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Push Notification Server đang chạy')
  console.log('='.repeat(50))
  console.log(`📍 Server: http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🔔 API Base: http://localhost:${PORT}/api/notifications/webpush`)
  console.log('\n📋 Available Endpoints:')
  console.log('   POST   /api/notifications/webpush/subscribe      - Lưu subscription')
  console.log('   GET    /api/notifications/webpush/subscriptions - Xem danh sách subscriptions')
  console.log('   GET    /api/notifications/webpush/subscriptions/:index - Xem subscription cụ thể')
  console.log('   POST   /api/notifications/webpush/test           - Gửi test notification')
  console.log('   POST   /api/notifications/webpush/send          - Gửi custom notification')
  console.log('   POST   /api/notifications/webpush/send-to/:index - Gửi đến subscription cụ thể')
  console.log('   DELETE /api/notifications/webpush/subscribe    - Xóa subscription')
  console.log(
    '   DELETE /api/notifications/webpush/subscriptions/:index - Xóa subscription theo index'
  )
  console.log('='.repeat(50))

  // Kiểm tra VAPID keys
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    console.log('✅ VAPID keys đã được cấu hình')
  } else {
    console.warn('⚠️  VAPID keys chưa được cấu hình!')
    console.warn('   Vui lòng set VAPID_PUBLIC_KEY và VAPID_PRIVATE_KEY trong file .env')
  }
  console.log('')
})
