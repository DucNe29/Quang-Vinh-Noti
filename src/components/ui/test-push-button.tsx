import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { triggerTestPush, subscribeUserToPush } from '@/service/push/pushService'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'

/**
 * Button đơn giản để test push notification
 * - Tự động subscribe nếu chưa có
 * - Gửi test push notification
 */
export function TestPushButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleTestPush = async () => {
    setIsLoading(true)
    try {
      // Kiểm tra xem đã subscribe chưa
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        // Nếu chưa subscribe thì subscribe trước
        if (!subscription) {
          toast.info('Đang đăng ký nhận thông báo...')
          await subscribeUserToPush()
          toast.success('Đã đăng ký nhận thông báo!')
        }
      }

      // Gửi test push
      await triggerTestPush()
      toast.success('Đã gửi thông báo thử! Kiểm tra notification trên thiết bị của bạn.')
    } catch (err: any) {
      console.error('Test push error:', err)
      toast.error(err?.message || 'Không thể gửi thông báo thử. Vui lòng kiểm tra lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTestPush}
      disabled={isLoading}
      variant="default"
      className="gap-2"
      size="sm"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? 'Đang gửi...' : 'Test Push Notification'}
    </Button>
  )
}

