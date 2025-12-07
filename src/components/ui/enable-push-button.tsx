import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUserToPush, triggerTestPush } from '@/service/push/pushService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function EnablePushButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleEnablePush = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const subscription = await subscribeUserToPush()
      setIsEnabled(true)
      // Hiển thị subscriptionId (endpoint)
      setSubscriptionId(subscription.endpoint)
      setShowDialog(true)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Không thể bật thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPush = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await triggerTestPush()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Không thể gửi thông báo thử')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button onClick={handleEnablePush} disabled={isLoading || isEnabled} variant="outline">
          {isEnabled
            ? 'Đã bật thông báo hệ thống'
            : isLoading
              ? 'Đang xử lý...'
              : 'Bật thông báo hệ thống'}
        </Button>
        <Button onClick={handleTestPush} disabled={!isEnabled || isLoading} variant="secondary">
          Gửi thông báo thử
        </Button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription ID</DialogTitle>
            <DialogDescription>
              Subscription ID của bạn đã được tạo thành công. Bạn có thể copy để sử dụng.
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
