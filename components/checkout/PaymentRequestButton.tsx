'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface PaymentRequestButtonProps {
  amount: number
  currency?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * Payment Request Button Component
 * Displays Apple Pay / Google Pay / Microsoft Pay buttons when available
 * Uses Stripe's Payment Request Button API
 */
export function PaymentRequestButton({
  amount,
  currency = 'eur',
  onSuccess,
  onError,
}: PaymentRequestButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setupPaymentRequest = async () => {
      // Check if Stripe is configured
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      if (!publishableKey) {
        setIsLoading(false)
        return
      }

      try {
        const stripe = await loadStripe(publishableKey)

        if (!stripe) {
          setIsLoading(false)
          return
        }

        // Create payment request
        const paymentRequest = stripe.paymentRequest({
          country: 'FR',
          currency: currency.toLowerCase(),
          total: {
            label: 'Total',
            amount: Math.round(amount * 100), // Convert to cents
          },
          requestPayerName: true,
          requestPayerEmail: true,
        })

        // Check if payment request is available (Apple Pay, Google Pay, etc.)
        const result = await paymentRequest.canMakePayment()

        if (result) {
          setIsAvailable(true)

          // Handle payment method received
          paymentRequest.on('paymentmethod', async (ev) => {
            try {
              // TODO: Create payment intent and confirm
              // This requires backend integration
              ev.complete('success')
              onSuccess?.()
            } catch (error: any) {
              ev.complete('fail')
              onError?.(error.message || 'Payment failed')
            }
          })
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error setting up payment request:', error)
        setIsLoading(false)
      }
    }

    setupPaymentRequest()
  }, [amount, currency, onSuccess, onError])

  if (isLoading || !isAvailable) {
    return null
  }

  return (
    <div className="my-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Paiement express</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {/* Apple Pay Icon */}
        <div className="px-6 py-3 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-900 transition-colors flex items-center gap-2">
          <svg className="w-12 h-6" viewBox="0 0 48 20" fill="currentColor">
            <path d="M8.8 4.4c-.5.6-1.3 1-2.1 1-.1-.8.3-1.6.8-2.1.5-.6 1.4-1 2.1-1 .1.8-.2 1.6-.8 2.1zm.8 1.2c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.7-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.8 2.2-1.7.7-1 1-2 1-2 0 0-1.9-.8-2-3-.1-1.8 1.5-2.7 1.6-2.7-.9-1.3-2.2-1.4-2.6-1.4v.2z"/>
            <path d="M18.9 2.4c1.8 0 3 1.2 3 3.1s-1.2 3.1-3 3.1h-1.7v3.1h-1.4V2.4h3.1zm-1.7 5.1h1.4c1.2 0 1.9-.7 1.9-2s-.7-2-1.9-2h-1.4v4z"/>
            <path d="M27.7 11.7c-.1 1-.9 1.6-2 1.6-1.4 0-2.3-.9-2.3-2.4v-4h1.3v3.9c0 .9.4 1.4 1.2 1.4.8 0 1.3-.5 1.3-1.4v-3.9h1.3v5.6h-1.2l-.2-1.2.4.4zM35.3 6.9l-2.1 5.6h-.8l-1.7-4.5-1.7 4.5h-.8l-2.1-5.6h1.4l1.4 4.5 1.7-4.5h.7l1.7 4.5 1.4-4.5h1.3z"/>
          </svg>
        </div>

        {/* Google Pay Icon */}
        <div className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg className="w-12 h-6" viewBox="0 0 48 20" fill="none">
            <path d="M23.7 10.2v3.6h-.9v-8.4h2.4c.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5s-.2 1.1-.6 1.5c-.4.4-.9.6-1.5.6h-1.5v-.4zm0-3.9v3h1.5c.4 0 .7-.1 1-.4.3-.3.4-.6.4-1s-.1-.7-.4-1c-.3-.3-.6-.4-1-.4h-1.5z" fill="#5F6368"/>
            <path d="M30 13.9c-.6 0-1.1-.2-1.5-.6-.4-.4-.6-.9-.6-1.5v-.2c0-.6.2-1.1.6-1.5.4-.4.9-.6 1.5-.6s1.1.2 1.5.6c.4.4.6.9.6 1.5v.2c0 .6-.2 1.1-.6 1.5-.4.4-.9.6-1.5.6v0zm0-.8c.3 0 .6-.1.8-.3.2-.2.4-.5.4-.9v-.2c0-.4-.1-.7-.4-.9-.2-.2-.5-.3-.8-.3s-.6.1-.8.3c-.2.2-.4.5-.4.9v.2c0 .4.1.7.4.9.2.2.5.3.8.3z" fill="#5F6368"/>
            <path d="M35 13.8v-.7c-.3.5-.8.8-1.4.8-.4 0-.8-.1-1.1-.4-.3-.3-.4-.6-.4-1.1 0-.5.2-.9.5-1.1.3-.3.8-.4 1.4-.4h1v-.3c0-.3-.1-.5-.3-.7-.2-.2-.4-.2-.7-.2-.3 0-.5.1-.7.2-.2.1-.3.3-.3.5h-.9c0-.3.1-.6.4-.8.3-.2.6-.4 1.1-.4s.8.1 1.1.4c.3.3.4.6.4 1.1v2.6c0 .3 0 .6.1.8v.1H35zm-1.3-.6c.3 0 .6-.1.8-.3.2-.2.4-.4.4-.7v-.7h-.9c-.7 0-1.1.2-1.2.7v.1c0 .2.1.4.3.5.2.2.4.3.7.3-.1 0-.1 0-.1 0z" fill="#5F6368"/>
            <path d="M38.9 15.4c-.3 0-.6 0-.8-.1v-.8h.5c.2 0 .4-.1.5-.2.1-.1.2-.3.3-.5l.1-.2-1.8-4.6h.9l1.3 3.7 1.3-3.7h.9l-1.9 5c-.2.5-.4.9-.6 1.1-.2.3-.5.4-1 .4h.3z" fill="#5F6368"/>
          </svg>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">ou</span>
        </div>
      </div>
    </div>
  )
}
