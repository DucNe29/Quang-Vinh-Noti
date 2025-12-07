import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { triggerTestPush, subscribeUserToPush } from '@/service/push/pushService'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Check } from 'lucide-react'

/**
 * Button đơn giản để test push notification
 * - Tự động subscribe nếu chưa có
 * - Gửi test push notification
 */
export function TestPushButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(subscriptionId)
      setCopied(true)
      toast.success('Đã copy Subscription ID!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Không thể copy')
    }
  }

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
          const newSubscription = await subscribeUserToPush()
          toast.success('Đã đăng ký nhận thông báo!')
          // Hiển thị subscriptionId
          setSubscriptionId(newSubscription.endpoint)
          setShowDialog(true)
        } else {
          // Nếu đã có subscription, vẫn hiển thị ID
          setSubscriptionId(subscription.endpoint)
          setShowDialog(true)
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
    <>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription ID</DialogTitle>
            <DialogDescription>
              Subscription ID của bạn. Bạn có thể copy để sử dụng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3 pr-10">
                <code className="flex-1 break-all text-sm">{subscriptionId}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} variant="outline">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
