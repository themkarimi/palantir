'use client'

import { useToast } from '@/components/providers/ToastProvider'

export function useClipboard() {
  const { toast } = useToast()

  const copy = async (text: string, label = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text)
      toast(label, 'success')
    } catch {
      // Fallback for non-HTTPS environments
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      toast(label, 'success')
    }
  }

  return { copy }
}
