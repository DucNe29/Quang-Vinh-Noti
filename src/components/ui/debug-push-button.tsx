import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUserToPush, checkSubscription } from '@/service/push/pushService'
import { toast } from 'sonner'
import { Bug } from 'lucide-react'

/**
 * Button để debug push notifications
 * - Kiểm tra subscription
 * - Kiểm tra service worker
 * - Kiểm tra VAPID key
 * - Thử subscribe
 */
export function DebugPushButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const handleDebug = async () => {
    setIsLoading(true)
    const info: string[] = []

    try {
      // 1. Kiểm tra Service Worker
      info.push('🔍 Kiểm tra Service Worker...')
      if ('serviceWorker' in navigator) {
        info.push('✅ Trình duyệt hỗ trợ Service Worker')
        
        const registration = await navigator.serviceWorker.ready
        info.push(`✅ Service Worker đã ready: ${registration.scope}`)
        
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          info.push(`✅ Có subscription: ${subscription.endpoint.substring(0, 50)}...`)
        } else {
          info.push('ℹ️  Chưa có subscription')
        }
      } else {
        info.push('❌ Trình duyệt không hỗ trợ Service Worker')
      }

      // 2. Kiểm tra Notification Permission
      info.push('\n🔔 Kiểm tra Notification Permission...')
      if ('Notification' in window) {
        const permission = Notification.permission
        info.push(`Permission: ${permission}`)
        if (permission === 'granted') {
          info.push('✅ Đã cho phép notifications')
        } else if (permission === 'denied') {
          info.push('❌ Đã từ chối notifications')
        } else {
          info.push('⚠️  Chưa cho phép notifications')
        }
      } else {
        info.push('❌ Trình duyệt không hỗ trợ Notification API')
      }

      // 3. Kiểm tra VAPID Key
      info.push('\n🔑 Kiểm tra VAPID Key...')
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      if (publicKey) {
        info.push(`✅ VAPID Public Key: ${publicKey.substring(0, 30)}...`)
      } else {
        info.push('❌ Thiếu VITE_VAPID_PUBLIC_KEY trong env')
      }

      // 4. Kiểm tra Backend URL
      info.push('\n🌐 Kiểm tra Backend URL...')
      const backendUrl = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:3001'
      info.push(`Backend URL: ${backendUrl}`)

      // 5. Test kết nối backend
      info.push('\n📡 Test kết nối backend...')
      try {
        const healthResponse = await fetch(`${backendUrl}/health`)
        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          info.push(`✅ Backend đang chạy: ${healthData.message}`)
        } else {
          info.push(`⚠️  Backend trả về status: ${healthResponse.status}`)
        }
      } catch (error: any) {
        info.push(`❌ Không thể kết nối backend: ${error.message}`)
        info.push('   Đảm bảo backend đang chạy: cd backend && npm run dev')
      }

      // 6. Kiểm tra subscriptions trên backend
      info.push('\n📋 Kiểm tra subscriptions trên backend...')
      try {
        const subsResponse = await fetch(`${backendUrl}/api/notifications/webpush/subscriptions`)
        if (subsResponse.ok) {
          const subsData = await subsResponse.json()
          info.push(`✅ Backend có ${subsData.count} subscription(s)`)
        } else {
          info.push(`⚠️  Không thể lấy subscriptions: ${subsResponse.status}`)
        }
      } catch (error: any) {
        info.push(`❌ Lỗi khi lấy subscriptions: ${error.message}`)
      }

      // 7. Thử subscribe
      info.push('\n🔄 Thử subscribe...')
      try {
        const subscription = await checkSubscription()
        if (!subscription) {
          info.push('Đang tạo subscription mới...')
          await subscribeUserToPush()
          info.push('✅ Subscribe thành công!')
        } else {
          info.push('✅ Đã có subscription, đang cập nhật lên backend...')
          await subscribeUserToPush()
          info.push('✅ Cập nhật thành công!')
        }
      } catch (error: any) {
        info.push(`❌ Lỗi khi subscribe: ${error.message}`)
      }

      setDebugInfo(info.join('\n'))
      toast.success('Debug hoàn tất! Xem console hoặc thông tin bên dưới')
    } catch (error: any) {
      info.push(`\n❌ Lỗi: ${error.message}`)
      setDebugInfo(info.join('\n'))
      toast.error('Có lỗi xảy ra khi debug')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDebug}
        disabled={isLoading}
        variant="outline"
        className="gap-2"
        size="sm"
      >
        <Bug className="h-4 w-4" />
        {isLoading ? 'Đang debug...' : 'Debug Push Notifications'}
      </Button>
      {debugInfo && (
        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-96">
          {debugInfo}
        </pre>
      )}
    </div>
  )
}

