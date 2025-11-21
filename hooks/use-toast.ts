/**
 * Simple toast hook for notifications
 */

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 3000 } = options

    // Simple console log for now - can be enhanced with a toast UI later
    if (variant === 'destructive') {
      console.error(`[Toast] ${title || ''}`, description || '')
    } else {
      console.log(`[Toast] ${title || ''}`, description || '')
    }

    // Future: integrate with a toast notification library or create custom toast UI
  }

  return { toast }
}
