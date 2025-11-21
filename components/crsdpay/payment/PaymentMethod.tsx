'use client'

/**
 * Payment Method Component - Composant principal de sélection de méthode de paiement
 * Gère le flux complet de paiement avec crsdpay
 */

import { useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardForm } from './CardForm'
import { SavedCards } from './SavedCards'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethodProps {
  storeId: string
  customerId?: string
  amount: number
  currency: string
  orderId?: string
  onPaymentSuccess?: (transactionId: string) => void
  onPaymentError?: (error: string) => void
}

export function PaymentMethod({
  storeId,
  customerId,
  amount,
  currency,
  orderId,
  onPaymentSuccess,
  onPaymentError,
}: PaymentMethodProps) {
  const [showNewCardForm, setShowNewCardForm] = useState(false)
  const [selectedCardToken, setSelectedCardToken] = useState<string | undefined>()
  const [saveCard, setSaveCard] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  // Requêtes tRPC
  const { data: savedCards, refetch: refetchCards } = trpc.crsdpay.listCards.useQuery(
    { customerId: customerId || '' },
    { enabled: !!customerId }
  )

  const tokenizeCardMutation = trpc.crsdpay.tokenizeCard.useMutation()
  const createPaymentMutation = trpc.crsdpay.createPayment.useMutation()
  const confirmPaymentMutation = trpc.crsdpay.confirmPayment.useMutation()
  const deleteCardMutation = trpc.crsdpay.deleteCard.useMutation()

  const handleNewCardSubmit = async (cardData: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
    holderName?: string
  }) => {
    if (!customerId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour payer',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)

    try {
      // 1. Tokenizer la carte
      let cardToken: string

      if (saveCard) {
        const tokenizeResult = await tokenizeCardMutation.mutateAsync({
          storeId,
          customerId,
          cardData,
          isDefault: !savedCards || savedCards.length === 0,
        })

        if (!tokenizeResult.success || !tokenizeResult.data) {
          throw new Error('Échec de la tokenization de la carte')
        }

        cardToken = tokenizeResult.data.token
        await refetchCards()
      } else {
        // Pour un paiement one-time, on tokenise temporairement
        const tokenizeResult = await tokenizeCardMutation.mutateAsync({
          storeId,
          customerId,
          cardData,
          isDefault: false,
        })

        if (!tokenizeResult.success || !tokenizeResult.data) {
          throw new Error('Échec de la tokenization de la carte')
        }

        cardToken = tokenizeResult.data.token
      }

      // 2. Créer le paiement
      await processPayment(cardToken)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive',
      })
      onPaymentError?.(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleSavedCardPay = async () => {
    if (!selectedCardToken) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une carte',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)

    try {
      await processPayment(selectedCardToken)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive',
      })
      onPaymentError?.(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const processPayment = async (cardToken: string) => {
    // 1. Créer le payment intent
    const paymentResult = await createPaymentMutation.mutateAsync({
      storeId,
      amount,
      currency,
      paymentMethod: 'card',
      cardToken,
      customerId,
      orderId,
      captureMethod: 'automatic',
    })

    if (!paymentResult.success || !paymentResult.data) {
      throw new Error('Échec de la création du paiement')
    }

    const transactionId = paymentResult.data.clientSecret.replace('crsd_secret_', '')

    // 2. Confirmer le paiement
    const confirmResult = await confirmPaymentMutation.mutateAsync({
      transactionId,
      cardToken,
    })

    if (!confirmResult.success || !confirmResult.data) {
      throw new Error('Échec de la confirmation du paiement')
    }

    // 3. Vérifier le status
    if (confirmResult.data.status === 'succeeded') {
      toast({
        title: 'Paiement réussi',
        description: 'Votre paiement a été traité avec succès',
      })
      onPaymentSuccess?.(transactionId)
    } else if (confirmResult.data.status === 'processing') {
      toast({
        title: 'Authentification requise',
        description: 'Veuillez compléter l\'authentification 3D Secure',
      })
      // En production, rediriger vers la page 3DS
    } else {
      throw new Error('Le paiement a échoué')
    }
  }

  const handleDeleteCard = async (token: string) => {
    if (!customerId) return

    try {
      await deleteCardMutation.mutateAsync({
        token,
        customerId,
      })

      toast({
        title: 'Carte supprimée',
        description: 'La carte a été supprimée avec succès',
      })

      await refetchCards()

      if (selectedCardToken === token) {
        setSelectedCardToken(undefined)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la carte',
        variant: 'destructive',
      })
    }
  }

  const hasSavedCards = savedCards && savedCards.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement par carte
        </h3>
        <div className="text-lg font-bold">
          {(amount / 100).toFixed(2)} {currency}
        </div>
      </div>

      {/* Cartes sauvegardées */}
      {hasSavedCards && !showNewCardForm && (
        <div className="space-y-4">
          <SavedCards
            cards={savedCards}
            selectedToken={selectedCardToken}
            onSelect={setSelectedCardToken}
            onDelete={handleDeleteCard}
            loading={processing}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSavedCardPay}
              disabled={!selectedCardToken || processing}
              className="flex-1"
            >
              {processing ? 'Traitement...' : 'Payer'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowNewCardForm(true)}
              disabled={processing}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle carte
            </Button>
          </div>
        </div>
      )}

      {/* Formulaire nouvelle carte */}
      {(!hasSavedCards || showNewCardForm) && (
        <div className="space-y-4">
          {showNewCardForm && hasSavedCards && (
            <Button
              variant="ghost"
              onClick={() => setShowNewCardForm(false)}
              disabled={processing}
            >
              ← Utiliser une carte enregistrée
            </Button>
          )}

          <CardForm
            onSubmit={handleNewCardSubmit}
            loading={processing}
            showSaveCard={!!customerId}
            onSaveCardChange={setSaveCard}
          />
        </div>
      )}
    </div>
  )
}
