'use client'

/**
 * Card Form Component - Formulaire de saisie de carte bancaire
 * PCI DSS Compliant - Les données ne sont jamais stockées côté serveur
 */

import { useState } from 'react'
import { CreditCard, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'

interface CardFormProps {
  onSubmit: (cardData: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
    holderName?: string
  }) => void
  loading?: boolean
  showSaveCard?: boolean
  onSaveCardChange?: (save: boolean) => void
}

export function CardForm({
  onSubmit,
  loading = false,
  showSaveCard = true,
  onSaveCardChange,
}: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [holderName, setHolderName] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Formate le numéro de carte (ajoute des espaces tous les 4 chiffres)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{1,4}/g)
    return matches ? matches.join(' ') : ''
  }

  // Formate la date d'expiration (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 19) {
      setCardNumber(formatted)
      if (errors.cardNumber) {
        setErrors((prev) => ({ ...prev, cardNumber: '' }))
      }
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    if (formatted.replace('/', '').length <= 4) {
      setExpiry(formatted)
      if (errors.expiry) {
        setErrors((prev) => ({ ...prev, expiry: '' }))
      }
    }
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '')
    if (value.length <= 4) {
      setCvc(value)
      if (errors.cvc) {
        setErrors((prev) => ({ ...prev, cvc: '' }))
      }
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Valider le numéro de carte
    const cleanNumber = cardNumber.replace(/\s/g, '')
    if (!cleanNumber) {
      newErrors.cardNumber = 'Le numéro de carte est requis'
    } else if (cleanNumber.length < 12 || cleanNumber.length > 19) {
      newErrors.cardNumber = 'Numéro de carte invalide'
    }

    // Valider l'expiration
    if (!expiry) {
      newErrors.expiry = "La date d'expiration est requise"
    } else {
      const [month, year] = expiry.split('/').map((v) => parseInt(v, 10))
      if (!month || !year || month < 1 || month > 12) {
        newErrors.expiry = 'Date invalide'
      } else {
        const now = new Date()
        const currentYear = now.getFullYear() % 100
        const currentMonth = now.getMonth() + 1
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.expiry = 'Carte expirée'
        }
      }
    }

    // Valider le CVC
    if (!cvc) {
      newErrors.cvc = 'Le CVC est requis'
    } else if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = 'CVC invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const [month, year] = expiry.split('/').map((v) => parseInt(v, 10))
    const fullYear = 2000 + year

    onSubmit({
      number: cardNumber.replace(/\s/g, ''),
      expMonth: month,
      expYear: fullYear,
      cvc,
      holderName: holderName || undefined,
    })
  }

  const handleSaveCardChange = (checked: boolean) => {
    setSaveCard(checked)
    onSaveCardChange?.(checked)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Numéro de carte */}
      <div>
        <Label htmlFor="cardNumber">Numéro de carte</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            disabled={loading}
            className={errors.cardNumber ? 'border-red-500' : ''}
          />
          <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        {errors.cardNumber && (
          <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Nom du titulaire */}
      <div>
        <Label htmlFor="holderName">Nom du titulaire (optionnel)</Label>
        <Input
          id="holderName"
          type="text"
          placeholder="JEAN DUPONT"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value.toUpperCase())}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date d'expiration */}
        <div>
          <Label htmlFor="expiry">Expiration</Label>
          <Input
            id="expiry"
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={handleExpiryChange}
            disabled={loading}
            className={errors.expiry ? 'border-red-500' : ''}
          />
          {errors.expiry && (
            <p className="text-sm text-red-500 mt-1">{errors.expiry}</p>
          )}
        </div>

        {/* CVC */}
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            type="text"
            placeholder="123"
            value={cvc}
            onChange={handleCvcChange}
            disabled={loading}
            className={errors.cvc ? 'border-red-500' : ''}
          />
          {errors.cvc && <p className="text-sm text-red-500 mt-1">{errors.cvc}</p>}
        </div>
      </div>

      {/* Option de sauvegarde */}
      {showSaveCard && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveCard"
            checked={saveCard}
            onChange={(e) => handleSaveCardChange(e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300"
          />
          <Label htmlFor="saveCard" className="text-sm font-normal">
            Sauvegarder cette carte pour les prochains achats
          </Label>
        </div>
      )}

      {/* Message de sécurité */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Lock className="h-4 w-4" />
        <span>Paiement sécurisé - Vos données sont protégées</span>
      </div>

      {/* Bouton de soumission */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Traitement en cours...' : 'Payer'}
      </Button>
    </form>
  )
}
