import webpush from 'web-push'
import { PushSubscription, PushNotificationPayload } from '../types/push'

// Khởi tạo VAPID keys từ environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com'

if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error(
    'VAPID keys chưa được cấu hình. Vui lòng set VAPID_PUBLIC_KEY và VAPID_PRIVATE_KEY trong file .env'
  )
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

/**
 * Validate subscription keys
 */
function validateSubscriptionKeys(subscription: PushSubscription): void {
  // Validate p256dh key (should be 65 bytes = 88 chars in base64 URL-safe)
  if (!subscription.keys.p256dh) {
    throw new Error('Missing p256dh key')
  }

  // Convert base64 URL-safe to check byte length
  const p256dhBase64 = subscription.keys.p256dh.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (p256dhBase64.length % 4)) % 4)
  const p256dhDecoded = Buffer.from(p256dhBase64 + padding, 'base64')
  
  if (p256dhDecoded.length !== 65) {
    throw new Error(
      `The subscription p256dh value should be 65 bytes long. Got ${p256dhDecoded.length} bytes. Key length: ${subscription.keys.p256dh.length} chars.`
    )
  }

  // Validate auth key (should be 16 bytes = 24 chars in base64 URL-safe)
  if (!subscription.keys.auth) {
    throw new Error('Missing auth key')
  }

  const authBase64 = subscription.keys.auth.replace(/-/g, '+').replace(/_/g, '/')
  const authPadding = '='.repeat((4 - (authBase64.length % 4)) % 4)
  const authDecoded = Buffer.from(authBase64 + authPadding, 'base64')

  if (authDecoded.length !== 16) {
    throw new Error(
      `The subscription auth value should be 16 bytes long. Got ${authDecoded.length} bytes. Key length: ${subscription.keys.auth.length} chars.`
    )
  }
}

/**
 * Gửi push notification đến một subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    // Validate keys trước khi gửi
    validateSubscriptionKeys(subscription)

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: {
        ...payload.data,
        url: payload.url || '/',
      },
    })

    await webpush.sendNotification(subscription, notificationPayload)
    console.log('✅ Push notification đã được gửi thành công')
  } catch (error: any) {
    console.error('❌ Lỗi khi gửi push notification:', error)

    // Xử lý các lỗi phổ biến
    if (error.statusCode === 410) {
      // Subscription đã hết hạn hoặc không hợp lệ
      throw new Error('Subscription không còn hợp lệ (410)')
    } else if (error.statusCode === 429) {
      // Quá nhiều requests
      throw new Error('Quá nhiều requests, vui lòng thử lại sau (429)')
    } else {
      throw error
    }
  }
}

/**
 * Gửi push notification đến nhiều subscriptions
 */
export async function sendPushNotificationToMany(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  )

  const success = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return { success, failed }
}
