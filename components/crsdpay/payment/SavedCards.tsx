'use client'

/**
 * Saved Cards Component - Liste des cartes sauvegardées
 */

import { useState } from 'react'
import { CreditCard, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface SavedCard {
  token: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  holderName?: string
}

interface SavedCardsProps {
  cards: SavedCard[]
  selectedToken?: string
  onSelect: (token: string) => void
  onDelete?: (token: string) => void
  loading?: boolean
}

const brandLogos: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
  diners: '💳',
  jcb: '💳',
  unionpay: '💳',
}

export function SavedCards({
  cards,
  selectedToken,
  onSelect,
  onDelete,
  loading = false,
}: SavedCardsProps) {
  const [deletingToken, setDeletingToken] = useState<string | null>(null)

  const handleDelete = async (token: string) => {
    if (!onDelete) return

    setDeletingToken(token)
    await onDelete(token)
    setDeletingToken(null)
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucune carte enregistrée</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const isSelected = selectedToken === card.token
        const isExpired = new Date(card.expYear, card.expMonth - 1) < new Date()

        return (
          <div
            key={card.token}
            className={cn(
              'relative border rounded-lg p-4 cursor-pointer transition-all',
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300',
              isExpired && 'opacity-50'
            )}
            onClick={() => !loading && !isExpired && onSelect(card.token)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {brandLogos[card.brand.toLowerCase()] || '💳'}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium capitalize">{card.brand}</span>
                    <span className="text-gray-600">•••• {card.last4}</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {card.holderName && <span>{card.holderName} • </span>}
                    Exp. {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                    {isExpired && <span className="text-red-500 ml-2">(Expirée)</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isSelected && (
                  <div className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(card.token)
                    }}
                    disabled={deletingToken === card.token}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
