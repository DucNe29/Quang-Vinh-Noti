import { Router, Request, Response } from 'express'
import { sendPushNotification, sendPushNotificationToMany } from '../services/pushService'
import { PushSubscription, PushNotificationPayload } from '../types/push'

const router = Router()

// Lưu trữ subscriptions trong memory (trong production nên dùng database)
const subscriptions: PushSubscription[] = []

/**
 * POST /api/notifications/webpush/subscribe
 * Lưu subscription từ client
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscription: PushSubscription = req.body

    console.log('📥 Nhận subscription từ client:', {
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      hasKeys: !!subscription.keys,
    })

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Subscription không hợp lệ. Cần có endpoint và keys',
      })
    }

    // Kiểm tra xem subscription đã tồn tại chưa
    const existingIndex = subscriptions.findIndex((sub) => sub.endpoint === subscription.endpoint)

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscription
      console.log('✅ Subscription đã được cập nhật (index:', existingIndex, ')')
    } else {
      subscriptions.push(subscription)
      console.log('✅ Subscription mới đã được lưu (tổng:', subscriptions.length, ')')
    }

    res.json({
      success: true,
      message: 'Subscription đã được lưu thành công',
      totalSubscriptions: subscriptions.length,
      subscriptionIndex: existingIndex >= 0 ? existingIndex : subscriptions.length - 1,
    })
  } catch (error: any) {
    console.error('❌ Lỗi khi lưu subscription:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi server',
    })
  }
})

/**
 * POST /api/notifications/webpush/test
 * Gửi test notification đến subscription cuối cùng
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không có subscription nào được đăng ký. Hãy subscribe từ frontend trước.',
      })
    }

    const payload: PushNotificationPayload = {
      title: 'Test Notification 🎉',
      body: 'Đây là thông báo test từ server! Nếu bạn thấy notification này, hệ thống đang hoạt động tốt.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: '/',
    }

    // Gửi đến subscription cuối cùng (thường là subscription hiện tại)
    const lastSubscription = subscriptions[subscriptions.length - 1]

    console.log('📤 Đang gửi test notification đến subscription:', {
      index: subscriptions.length - 1,
      endpoint: lastSubscription.endpoint.substring(0, 50) + '...',
    })

    await sendPushNotification(lastSubscription, payload)

    res.json({
      success: true,
      message: 'Test notification đã được gửi thành công',
      sentTo: {
        index: subscriptions.length - 1,
        endpoint: lastSubscription.endpoint.substring(0, 50) + '...',
      },
      totalSubscriptions: subscriptions.length,
    })
  } catch (error: any) {
    console.error('❌ Lỗi khi gửi test notification:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi gửi notification',
    })
  }
})

/**
 * POST /api/notifications/webpush/send
 * Gửi custom notification
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const {
      subscription,
      payload,
      sendToAll,
    }: {
      subscription?: PushSubscription
      payload: PushNotificationPayload
      sendToAll?: boolean
    } = req.body

    if (!payload || !payload.title || !payload.body) {
      return res.status(400).json({
        success: false,
        error: 'Payload không hợp lệ. Cần có title và body',
      })
    }

    // Nếu có subscription cụ thể, gửi đến subscription đó
    if (subscription && !sendToAll) {
      console.log('📤 Gửi notification đến subscription cụ thể')
      await sendPushNotification(subscription, payload)
      res.json({
        success: true,
        message: 'Notification đã được gửi',
      })
      return
    }

    // Nếu không có subscription hoặc sendToAll = true, gửi đến tất cả
    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không có subscription nào',
      })
    }

    console.log(`📤 Gửi notification đến ${subscriptions.length} subscription(s)`)
    const results = await sendPushNotificationToMany(subscriptions, payload)

    res.json({
      success: true,
      message: `Đã gửi đến ${results.success} subscription(s), ${results.failed} lỗi`,
      successCount: results.success,
      failedCount: results.failed,
      totalSubscriptions: subscriptions.length,
    })
  } catch (error: any) {
    console.error('❌ Lỗi khi gửi notification:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi server',
    })
  }
})

/**
 * GET /api/notifications/webpush/subscriptions
 * Lấy danh sách subscriptions (để debug)
 */
router.get('/subscriptions', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: subscriptions.length,
    subscriptions: subscriptions.map((sub, index) => ({
      index,
      endpoint: sub.endpoint.substring(0, 60) + '...',
      keys: {
        p256dh: sub.keys.p256dh.substring(0, 20) + '...',
        auth: sub.keys.auth.substring(0, 10) + '...',
      },
    })),
  })
})

/**
 * GET /api/notifications/webpush/subscriptions/:index
 * Lấy thông tin subscription cụ thể
 */
router.get('/subscriptions/:index', (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10)

  if (isNaN(index) || index < 0 || index >= subscriptions.length) {
    return res.status(404).json({
      success: false,
      error: 'Subscription không tồn tại',
    })
  }

  const subscription = subscriptions[index]
  res.json({
    success: true,
    index,
    subscription: {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
  })
})

/**
 * POST /api/notifications/webpush/send-to/:index
 * Gửi notification đến subscription cụ thể theo index
 */
router.post('/send-to/:index', async (req: Request, res: Response) => {
  try {
    const index = parseInt(req.params.index, 10)
    const payload: PushNotificationPayload = req.body.payload || {
      title: req.body.title || 'Notification',
      body: req.body.body || 'Nội dung thông báo',
      icon: req.body.icon,
      badge: req.body.badge,
      url: req.body.url,
      data: req.body.data,
    }

    if (isNaN(index) || index < 0 || index >= subscriptions.length) {
      return res.status(404).json({
        success: false,
        error: 'Subscription không tồn tại',
      })
    }

    if (!payload.title || !payload.body) {
      return res.status(400).json({
        success: false,
        error: 'Payload không hợp lệ. Cần có title và body',
      })
    }

    const subscription = subscriptions[index]
    console.log(`📤 Gửi notification đến subscription index ${index}`)

    await sendPushNotification(subscription, payload)

    res.json({
      success: true,
      message: 'Notification đã được gửi',
      sentTo: {
        index,
        endpoint: subscription.endpoint.substring(0, 50) + '...',
      },
    })
  } catch (error: any) {
    console.error('❌ Lỗi khi gửi notification:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi server',
    })
  }
})

/**
 * DELETE /api/notifications/webpush/subscribe
 * Xóa subscription
 */
router.delete('/subscribe', (req: Request, res: Response) => {
  const { endpoint } = req.body

  if (!endpoint) {
    return res.status(400).json({
      success: false,
      error: 'Thiếu endpoint',
    })
  }

  const index = subscriptions.findIndex((sub) => sub.endpoint === endpoint)
  if (index >= 0) {
    subscriptions.splice(index, 1)
    console.log(`🗑️  Đã xóa subscription tại index ${index}`)
    res.json({
      success: true,
      message: 'Subscription đã được xóa',
      remainingCount: subscriptions.length,
    })
  } else {
    res.status(404).json({
      success: false,
      error: 'Không tìm thấy subscription',
    })
  }
})

/**
 * DELETE /api/notifications/webpush/subscriptions/:index
 * Xóa subscription theo index
 */
router.delete('/subscriptions/:index', (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10)

  if (isNaN(index) || index < 0 || index >= subscriptions.length) {
    return res.status(404).json({
      success: false,
      error: 'Subscription không tồn tại',
    })
  }

  subscriptions.splice(index, 1)
  console.log(`🗑️  Đã xóa subscription tại index ${index}`)
  res.json({
    success: true,
    message: 'Subscription đã được xóa',
    remainingCount: subscriptions.length,
  })
})

export default router
