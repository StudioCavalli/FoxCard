'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'

interface PaymentFormProps {
  storeId: string
  customerId?: string
  amount: number
  currency?: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export default function PaymentForm({
  storeId,
  customerId,
  amount,
  currency = 'EUR',
  onSuccess,
  onError
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get saved cards if customer is logged in
  const { data: savedCards } = trpc.paymentGateway.getCustomerCards.useQuery(
    { storeId, customerId: customerId! },
    { enabled: !!customerId }
  )

  const tokenizeMutation = trpc.paymentGateway.tokenizeCard.useMutation()
  const createTransactionMutation = trpc.paymentGateway.createTransaction.useMutation()
  const authorizeMutation = trpc.paymentGateway.authorizeTransaction.useMutation()
  const captureMutation = trpc.paymentGateway.captureTransaction.useMutation()

  // Detect card brand from number
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    if (cleanNumber.length >= 2) {
      if (/^4/.test(cleanNumber)) setCardBrand('VISA')
      else if (/^5[1-5]|^2[2-7]/.test(cleanNumber)) setCardBrand('MASTERCARD')
      else if (/^3[47]/.test(cleanNumber)) setCardBrand('AMEX')
      else if (/^6(?:011|5)/.test(cleanNumber)) setCardBrand('DISCOVER')
      else setCardBrand(null)
    } else {
      setCardBrand(null)
    }
  }, [cardNumber])

  // Format card number with spaces
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 16)
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    setCardNumber(formatted)
    setErrors({ ...errors, cardNumber: '' })
  }

  // Format expiry date
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 4)
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.substring(0, 2)}/${cleaned.substring(2)}`)
    } else {
      setExpiryDate(cleaned)
    }
    setErrors({ ...errors, expiryDate: '' })
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedCardId) {
      const cleanNumber = cardNumber.replace(/\s/g, '')

      if (!cleanNumber || cleanNumber.length < 13) {
        newErrors.cardNumber = 'Numéro de carte invalide'
      } else if (!luhnCheck(cleanNumber)) {
        newErrors.cardNumber = 'Numéro de carte invalide'
      }

      if (!expiryDate || expiryDate.length !== 5) {
        newErrors.expiryDate = 'Date d\'expiration invalide'
      } else {
        const [month, year] = expiryDate.split('/')
        const expMonth = parseInt(month)
        const expYear = parseInt('20' + year)
        const now = new Date()

        if (expMonth < 1 || expMonth > 12) {
          newErrors.expiryDate = 'Mois invalide'
        } else if (expYear < now.getFullYear() ||
                   (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
          newErrors.expiryDate = 'Carte expirée'
        }
      }

      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'CVV invalide'
      }

      if (!cardholderName.trim()) {
        newErrors.cardholderName = 'Nom du titulaire requis'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Luhn algorithm for card validation
  const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0
    let isEven = false

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setProcessing(true)

    try {
      let cardTokenId = selectedCardId

      // Tokenize card if new
      if (!selectedCardId && customerId && saveCard) {
        const [month, year] = expiryDate.split('/')
        const token = await tokenizeMutation.mutateAsync({
          storeId,
          customerId,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryMonth: parseInt(month),
          expiryYear: parseInt('20' + year),
          cvv,
          cardholderName
        })
        cardTokenId = token.tokenId
      }

      // Create transaction
      const transaction = await createTransactionMutation.mutateAsync({
        storeId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        paymentMethod: 'CARD',
        cardTokenId: cardTokenId || undefined,
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent
      })

      // Handle 3DS if required
      if (transaction.threeDSRequired) {
        // In production, this would redirect to 3DS authentication
        // For demo, we'll simulate successful authentication
        await authorizeMutation.mutateAsync({
          transactionId: transaction.id,
          threeDSResult: {
            status: 'AUTHENTICATED',
            version: '2.0'
          }
        })
      } else {
        // Authorize without 3DS
        await authorizeMutation.mutateAsync({
          transactionId: transaction.id
        })
      }

      // Capture the transaction
      await captureMutation.mutateAsync({
        transactionId: transaction.id
      })

      onSuccess(transaction.transactionId)
    } catch (error: any) {
      onError(error.message || 'Erreur de paiement')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Amount display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-500">Montant à payer</p>
        <p className="text-3xl font-bold text-gray-900">
          {amount.toFixed(2)} {currency}
        </p>
      </div>

      {/* Saved cards */}
      {savedCards && savedCards.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Cartes enregistrées</p>
          <div className="space-y-2">
            {savedCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                className={`
                  w-full p-3 border rounded-lg flex items-center gap-3 transition-all
                  ${selectedCardId === card.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <CardBrandIcon brand={card.brand} />
                <span className="font-mono">•••• {card.last4}</span>
                <span className="text-sm text-gray-500">
                  {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}
                </span>
                {selectedCardId === card.id && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New card form */}
      {!selectedCardId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de carte
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`
                  w-full px-3 py-2 border rounded-lg pr-12
                  ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                `}
              />
              {cardBrand && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CardBrandIcon brand={cardBrand} />
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                className={`
                  w-full px-3 py-2 border rounded-lg
                  ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                `}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
                  setErrors({ ...errors, cvv: '' })
                }}
                placeholder="123"
                className={`
                  w-full px-3 py-2 border rounded-lg
                  ${errors.cvv ? 'border-red-500' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                `}
              />
              {errors.cvv && (
                <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Cardholder name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du titulaire
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value.toUpperCase())
                setErrors({ ...errors, cardholderName: '' })
              }}
              placeholder="JOHN DOE"
              className={`
                w-full px-3 py-2 border rounded-lg
                ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'}
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              `}
            />
            {errors.cardholderName && (
              <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
            )}
          </div>

          {/* Save card checkbox */}
          {customerId && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Enregistrer cette carte pour mes prochains achats
              </span>
            </label>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={processing}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              ${processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors
            `}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Traitement en cours...
              </span>
            ) : (
              `Payer ${amount.toFixed(2)} ${currency}`
            )}
          </button>
        </form>
      )}

      {/* Pay with selected card */}
      {selectedCardId && (
        <button
          onClick={handleSubmit}
          disabled={processing}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white
            ${processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}
            transition-colors
          `}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Traitement en cours...
            </span>
          ) : (
            `Payer ${amount.toFixed(2)} ${currency}`
          )}
        </button>
      )}

      {/* Security badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          SSL sécurisé
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          3D Secure
        </span>
      </div>
    </div>
  )
}

// Card brand icon component
function CardBrandIcon({ brand }: { brand: string }) {
  const icons: Record<string, string> = {
    VISA: '💳',
    MASTERCARD: '💳',
    AMEX: '💳',
    DISCOVER: '💳'
  }

  return (
    <span className="text-lg" title={brand}>
      {icons[brand] || '💳'}
    </span>
  )
}
