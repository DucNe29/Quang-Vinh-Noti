import { Router, Request, Response } from 'express'
import { sendPushNotification } from '../services/pushService'
import { PushSubscription, PushNotificationPayload } from '../types/push'

const router = Router()

// Lưu trữ subscriptions (trong production nên dùng database)
const subscriptions: PushSubscription[] = []

/**
 * POST /api/notifications/webpush/subscribe
 * Lưu subscription từ client
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscription: PushSubscription = req.body

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Subscription không hợp lệ',
      })
    }

    // Kiểm tra xem subscription đã tồn tại chưa
    const existingIndex = subscriptions.findIndex(
      (sub) => sub.endpoint === subscription.endpoint
    )

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscription
      console.log('✅ Subscription đã được cập nhật')
    } else {
      subscriptions.push(subscription)
      console.log('✅ Subscription mới đã được lưu')
    }

    res.json({
      success: true,
      message: 'Subscription đã được lưu thành công',
      totalSubscriptions: subscriptions.length,
    })
  } catch (error: any) {
    console.error('Lỗi khi lưu subscription:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi server',
    })
  }
})

/**
 * POST /api/notifications/webpush/test
 * Gửi test notification đến tất cả subscriptions
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không có subscription nào được đăng ký',
      })
    }

    const payload: PushNotificationPayload = {
      title: 'Test Notification',
      body: 'Đây là thông báo test từ server! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: '/',
    }

    // Gửi đến subscription cuối cùng (thường là subscription hiện tại)
    const lastSubscription = subscriptions[subscriptions.length - 1]
    
    await sendPushNotification(lastSubscription, payload)

    res.json({
      success: true,
      message: 'Test notification đã được gửi',
      sentTo: lastSubscription.endpoint.substring(0, 50) + '...',
    })
  } catch (error: any) {
    console.error('Lỗi khi gửi test notification:', error)
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
    const { subscription, payload }: { subscription?: PushSubscription; payload: PushNotificationPayload } = req.body

    if (!payload || !payload.title || !payload.body) {
      return res.status(400).json({
        success: false,
        error: 'Payload không hợp lệ. Cần có title và body',
      })
    }

    // Nếu có subscription cụ thể, gửi đến subscription đó
    // Nếu không, gửi đến tất cả
    if (subscription) {
      await sendPushNotification(subscription, payload)
      res.json({
        success: true,
        message: 'Notification đã được gửi',
      })
    } else {
      if (subscriptions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Không có subscription nào',
        })
      }

      const results = await Promise.allSettled(
        subscriptions.map((sub) => sendPushNotification(sub, payload))
      )

      const success = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      res.json({
        success: true,
        message: `Đã gửi đến ${success} subscription(s), ${failed} lỗi`,
        successCount: success,
        failedCount: failed,
      })
    }
  } catch (error: any) {
    console.error('Lỗi khi gửi notification:', error)
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
    subscriptions: subscriptions.map((sub) => ({
      endpoint: sub.endpoint.substring(0, 50) + '...',
      keys: {
        p256dh: sub.keys.p256dh.substring(0, 20) + '...',
        auth: sub.keys.auth.substring(0, 10) + '...',
      },
    })),
  })
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
    res.json({
      success: true,
      message: 'Subscription đã được xóa',
    })
  } else {
    res.status(404).json({
      success: false,
      error: 'Không tìm thấy subscription',
    })
  }
})

export default router

