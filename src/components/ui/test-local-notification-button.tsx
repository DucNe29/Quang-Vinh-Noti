import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Button để test notification trực tiếp từ frontend (không cần backend)
 * Sử dụng Web Notification API để hiển thị notification ngay lập tức
 * Hoạt động trên iOS Safari PWA và Android Chrome
 */
export function TestLocalNotificationButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Trình duyệt không hỗ trợ Notification API')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        toast.success('Đã cho phép thông báo!')
      } else if (result === 'denied') {
        toast.error('Bạn đã từ chối thông báo. Vui lòng bật lại trong cài đặt trình duyệt.')
      }
    } catch (err) {
      console.error('Request permission error:', err)
      toast.error('Không thể xin quyền thông báo')
    }
  }

  const showTestNotification = async () => {
    setIsLoading(true)
    try {
      console.log('23123', 231)
      if (!('Notification' in window)) {
        toast.error('Trình duyệt không hỗ trợ Notification API')
        return
      }

      // Kiểm tra permission
      if (Notification.permission === 'default') {
        await requestPermission()
        setIsLoading(false)
        return
      }

      if (Notification.permission !== 'granted') {
        toast.error('Bạn chưa cho phép thông báo. Vui lòng bật lại trong cài đặt.')
        setIsLoading(false)
        return
      }

      // Hiển thị notification
      const notification = new Notification('🔔 Thông báo thử nghiệm', {
        body: 'Đây là thông báo test từ frontend! Bạn đã nhận được notification thành công.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/dashboard',
          timestamp: Date.now(),
        },
      })

      // Khi click vào notification
      notification.onclick = () => {
        window.focus()
        notification.close()
        toast.info('Bạn đã click vào notification!')
      }

      // Tự động đóng sau 5 giây
      setTimeout(() => {
        notification.close()
      }, 5000)

      toast.success('Đã gửi notification test!')
    } catch (err: any) {
      console.error('Show notification error:', err)
      toast.error(err?.message || 'Không thể hiển thị notification')
    } finally {
      setIsLoading(false)
    }
  }

  // Nếu chưa có permission, hiển thị button xin quyền
  if (permission === 'default') {
    return (
      <Button onClick={requestPermission} variant="outline" className="gap-2" size="sm">
        <Bell className="h-4 w-4" />
        Cho phép thông báo
      </Button>
    )
  }

  // Nếu đã từ chối
  if (permission === 'denied') {
    return (
      <Button
        onClick={requestPermission}
        variant="outline"
        className="gap-2 text-red-500"
        size="sm"
        disabled
      >
        <Bell className="h-4 w-4" />
        Đã từ chối thông báo
      </Button>
    )
  }

  // Nếu đã cho phép, hiển thị button test
  return (
    <Button
      onClick={showTestNotification}
      disabled={isLoading}
      variant="default"
      className="gap-2 bg-blue-500 hover:bg-blue-600"
      size="sm"
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Đang gửi...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          Test Notification (Frontend)
        </>
      )}
    </Button>
  )
}
