import { API_ENDPOINT } from '@/common/apiEndpoint'

// Helper: convert Base64 URL-safe string to Uint8Array (for VAPID public key)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Trình duyệt không hỗ trợ Notification API')
  }

  const current = Notification.permission
  if (current !== 'default') return current

  return await Notification.requestPermission()
}

/**
 * Đăng ký push subscription với service worker hiện tại
 * - Trả về object subscription để gửi lên backend
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Trình duyệt không hỗ trợ Service Worker')
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    throw new Error('Người dùng chưa cho phép thông báo')
  }

  const registration = await navigator.serviceWorker.ready

  // Tránh subscribe trùng
  const existingSubscription = await registration.pushManager.getSubscription()
  if (existingSubscription) {
    console.log('ℹ️  Đã có subscription, đang gửi lại lên backend...')

    // Vẫn gửi lại lên backend để đảm bảo backend có subscription mới nhất
    const backendUrl = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:3001'
    const subscribeUrl = `${backendUrl}${API_ENDPOINT.NOTIFICATION_SUBSCRIBE}`

    try {
      const response = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingSubscription),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Subscription đã được cập nhật trên backend:', result)
      }
    } catch (error) {
      console.warn('⚠️  Không thể cập nhật subscription lên backend:', error)
    }

    return existingSubscription
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('Thiếu VITE_VAPID_PUBLIC_KEY trong env')
  }

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  console.log('✅ Subscription đã được tạo:', {
    endpoint: newSubscription.endpoint.substring(0, 50) + '...',
    keys: {
      p256dh: newSubscription.getKey('p256dh') ? 'Có' : 'Không',
      auth: newSubscription.getKey('auth') ? 'Có' : 'Không',
    },
  })

  // Xác định URL backend - ưu tiên localhost:3001 cho development
  const backendUrl = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:3001'
  const subscribeUrl = `${backendUrl}${API_ENDPOINT.NOTIFICATION_SUBSCRIBE}`

  console.log('📤 Đang gửi subscription lên backend:', subscribeUrl)

  try {
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscription),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(
        `Backend error: ${response.status} - ${errorData.error || response.statusText}`
      )
    }

    const result = await response.json()
    console.log('✅ Subscription đã được lưu trên backend:', result)
  } catch (error: any) {
    console.error('❌ Lỗi khi gửi subscription lên backend:', error)
    // Vẫn trả về subscription ngay cả khi gửi lên backend thất bại
    // Vì subscription đã được tạo thành công ở local
    throw new Error(
      `Không thể gửi subscription lên backend: ${error.message}. Kiểm tra backend có đang chạy không?`
    )
  }

  return newSubscription
}

/**
 * Gửi yêu cầu backend bắn thử 1 push đến subscription hiện tại (tuỳ backend implement)
 */
export async function triggerTestPush() {
  const backendUrl = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:3001'
  const testUrl = `${backendUrl}${API_ENDPOINT.NOTIFICATION_TEST_PUSH}`

  console.log('📤 Đang gửi yêu cầu test push:', testUrl)

  const response = await fetch(testUrl, {
    method: 'POST',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Backend error: ${response.status} - ${errorData.error || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Test push response:', result)
  return result
}

/**
 * Kiểm tra subscription hiện tại và log thông tin
 */
export async function checkSubscription() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️  Trình duyệt không hỗ trợ Service Worker')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      console.log('✅ Có subscription:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        expirationTime: subscription.expirationTime,
      })
      return subscription
    } else {
      console.log('ℹ️  Chưa có subscription')
      return null
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra subscription:', error)
    return null
  }
}
