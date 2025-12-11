import { StrictMode } from 'react'
import App from './App.tsx'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SocketProvider } from './providers/SocketProvider.tsx'
import { Toaster } from 'sonner'
import { registerSW } from 'virtual:pwa-register'
import { useEffect } from 'react'

const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
    })
  }
}

function ServiceWorkerLogListener() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = async (event: MessageEvent) => {
      const data = event.data
      if (!data || data.source !== 'sw-log') return

      const message =
        typeof data.message === 'string'
          ? data.message
          : 'SW log message'

      // Hiển thị alert
      alert(message)

      // Copy log ra clipboard nếu được hỗ trợ
      if (navigator.clipboard?.writeText) {
        try {
          const payloadText =
            data.payload !== undefined ? ` ${JSON.stringify(data.payload)}` : ''
          await navigator.clipboard.writeText(`${message}${payloadText}`)
          console.log('[App] Copied SW log to clipboard')
        } catch (err) {
          console.warn('[App] Không thể copy SW log', err)
        }
      }
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
        <Toaster position="top-right" richColors />
        <ServiceWorkerLogListener />
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)

registerServiceWorker()
