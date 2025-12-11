import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  promptOneSignalPush,
  sendOneSignalNotification,
} from '@/service/onesignal/onesignalService'

/**
 * Nút test gửi push notification qua OneSignal.
 * - Hỏi quyền, opt-in
 * - Lấy subscriptionId hiện tại
 * - Gửi 1 notification tới chính subscription đó
 */
export function OneSignalTestButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const { permission, subscriptionId } = await promptOneSignalPush()

      if (permission !== 'granted') {
        toast.error('Người dùng chưa cho phép nhận thông báo')
        return
      }

      if (!subscriptionId) {
        throw new Error('Không lấy được subscriptionId từ OneSignal')
      }

      await sendOneSignalNotification({
        title: 'OneSignal Test',
        body: 'Thông báo thử được gửi từ nút test',
        includeSubscriptionIds: [subscriptionId],
      })

      toast.success('Đã gửi thông báo OneSignal!')
    } catch (error: any) {
      console.error('OneSignal test error:', error)
      toast.error(error?.message || 'Không thể gửi thông báo OneSignal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSend}
      disabled={isLoading}
      variant="default"
      className="gap-2"
      size="sm"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? 'Đang gửi...' : 'Test OneSignal Push'}
    </Button>
  )
}
