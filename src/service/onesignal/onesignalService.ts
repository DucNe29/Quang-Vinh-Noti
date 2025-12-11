type OneSignalInitOptions = {
  appId: string
  allowLocalhostAsSecureOrigin?: boolean
  safariWebId?: string
  serviceWorker?: {
    path?: string
    scope?: string
    useExistingServiceWorker?: boolean
  }
}

type OneSignalSDK = {
  init(options: OneSignalInitOptions): Promise<void>
  Notifications: {
    permission: NotificationPermission | 'default'
    requestPermission(): Promise<NotificationPermission>
  }
  User: {
    PushSubscription: {
      id?: string | null
      token?: string | null
      optedIn?: boolean
      optIn(): Promise<void>
      optOut(): Promise<void>
    }
    addTag?(key: string, value: string): Promise<void>
  }
}

declare global {
  interface Window {
    OneSignal?: OneSignalSDK
    OneSignalDeferred?: Array<(sdk: OneSignalSDK) => void>
  }
}

let initPromise: Promise<OneSignalSDK> | null = null
let initialized = false

// Đợi SDK OneSignal sẵn sàng (được inject qua script trong index.html)
async function waitForOneSignal(): Promise<OneSignalSDK> {
  if (typeof window === 'undefined') {
    throw new Error('OneSignal chỉ khả dụng trên trình duyệt')
  }

  if (window.OneSignal) {
    return window.OneSignal
  }

  return new Promise<OneSignalSDK>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('OneSignal SDK chưa sẵn sàng. Kiểm tra script trên index.html'))
    }, 8000)

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push((sdk) => {
      clearTimeout(timeout)
      resolve(sdk)
    })
  })
}

/**
 * Khởi tạo OneSignal Web SDK
 */
export async function initOneSignal() {
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
    if (!appId) {
      throw new Error('Thiếu VITE_ONESIGNAL_APP_ID trong file env')
    }

    const OneSignal = await waitForOneSignal()

    if (!initialized) {
      await OneSignal.init({
        appId,
        safariWebId: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
        allowLocalhostAsSecureOrigin: Boolean(import.meta.env.DEV),
        serviceWorker: {
          path: '/sw.js',
          scope: '/',
          useExistingServiceWorker: true,
        },
      })
      initialized = true
    }

    return OneSignal
  })()

  return initPromise
}

/**
 * Hỏi quyền & đăng ký nhận push qua OneSignal
 * Trả về permission + subscriptionId hiện tại (nếu có)
 */
export async function promptOneSignalPush() {
  const OneSignal = await initOneSignal()

  const permission = await OneSignal.Notifications.requestPermission()

  if (permission === 'granted' && OneSignal.User?.PushSubscription?.optIn) {
    await OneSignal.User.PushSubscription.optIn()
  }

  return {
    permission,
    subscriptionId: OneSignal.User?.PushSubscription?.id || null,
    token: OneSignal.User?.PushSubscription?.token || null,
    optedIn: OneSignal.User?.PushSubscription?.optedIn ?? false,
  }
}

export type SendOneSignalPayload = {
  title: string
  body: string
  url?: string
  data?: Record<string, any>
  includeExternalUserIds?: string[]
  includeSubscriptionIds?: string[]
}

/**
 * Gửi push notification qua OneSignal REST API
 * Lưu ý: REST API key không nên để ở frontend cho môi trường production.
 */
export async function sendOneSignalNotification(payload: SendOneSignalPayload) {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  const restApiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY

  if (!appId) {
    throw new Error('Thiếu VITE_ONESIGNAL_APP_ID trong env')
  }

  if (!restApiKey) {
    throw new Error('Thiếu VITE_ONESIGNAL_REST_API_KEY (chỉ dùng cho môi trường dev)')
  }

  const response = await fetch(`https://api.onesignal.com/apps/${appId}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${restApiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      headings: { en: payload.title },
      contents: { en: payload.body },
      url: payload.url,
      data: payload.data,
      include_external_user_ids: payload.includeExternalUserIds,
      include_subscription_ids: payload.includeSubscriptionIds,
      channel_for_external_user_ids: 'push',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OneSignal API lỗi ${response.status}: ${errorText}`)
  }

  return response.json()
}
