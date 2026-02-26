'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/cn'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 3000)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'animate-toast-in px-4 py-3 rounded-lg text-sm font-sans shadow-card',
              'border backdrop-blur-sm flex items-center gap-2 pointer-events-auto',
              t.type === 'success' &&
                'bg-green-900/80 border-green-500/30 text-green-200',
              t.type === 'error' &&
                'bg-red-900/80 border-red-500/30 text-red-200',
              t.type === 'info' &&
                'bg-surface border-border text-white/80'
            )}
          >
            {t.type === 'success' && <span className="text-green-400">✓</span>}
            {t.type === 'error' && <span className="text-red-400">✗</span>}
            {t.type === 'info' && (
              <span className="text-accent">ℹ</span>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
