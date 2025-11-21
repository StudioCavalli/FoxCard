'use client'

/**
 * Crypto Payment Component - Interface de paiement cryptocurrency
 * Affiche l'adresse, le QR code et le montant à payer
 */

import { useState, useEffect } from 'react'
import { Bitcoin, QrCode, Copy, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface CryptoPaymentProps {
  storeId: string
  amount: number
  currency: string
  orderId?: string
  customerId?: string
  onPaymentSuccess?: (paymentId: string) => void
  onPaymentError?: (error: string) => void
}

type Cryptocurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC' | 'BCH'

const cryptoInfo: Record<
  Cryptocurrency,
  { name: string; symbol: string; icon: string; network: string }
> = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', icon: '₿', network: 'bitcoin' },
  ETH: { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', network: 'ethereum' },
  USDT: { name: 'Tether', symbol: 'USDT', icon: '₮', network: 'ethereum' },
  USDC: { name: 'USD Coin', symbol: 'USDC', icon: '$', network: 'ethereum' },
  LTC: { name: 'Litecoin', symbol: 'LTC', icon: 'Ł', network: 'bitcoin' },
  BCH: { name: 'Bitcoin Cash', symbol: 'BCH', icon: '₿', network: 'bitcoin' },
}

export function CryptoPayment({
  storeId,
  amount,
  currency,
  orderId,
  customerId,
  onPaymentSuccess,
  onPaymentError,
}: CryptoPaymentProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency>('BTC')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  // Mutations et queries
  const createPaymentMutation = trpc.crsdpay.createCryptoPayment.useMutation()
  const { data: conversion } = trpc.crsdpay.convertFiatToCrypto.useQuery({
    fiatAmount: amount / 100,
    fiatCurrency: currency,
    cryptocurrency: selectedCrypto,
  })

  const { data: payment, refetch: refetchPayment } = trpc.crsdpay.getCryptoPayment.useQuery(
    { paymentId: paymentId || '' },
    { enabled: !!paymentId }
  )

  const checkPaymentMutation = trpc.crsdpay.checkCryptoPayment.useMutation()

  // Créer le paiement automatiquement au chargement
  useEffect(() => {
    handleCreatePayment()
  }, [selectedCrypto])

  const handleCreatePayment = async () => {
    try {
      const result = await createPaymentMutation.mutateAsync({
        storeId,
        cryptocurrency: selectedCrypto,
        network: cryptoInfo[selectedCrypto].network as any,
        amountFiat: amount,
        currency,
        orderId,
        customerId,
      })

      if (result.success && result.data) {
        setPaymentId(result.data.paymentId)
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
      onPaymentError?.(error.message)
    }
  }

  const handleCopyAddress = async () => {
    if (!payment) return

    await navigator.clipboard.writeText(payment.address)
    setCopied(true)

    toast({
      title: 'Adresse copiée',
      description: 'L\'adresse a été copiée dans le presse-papier',
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckPayment = async () => {
    if (!paymentId) return

    setIsChecking(true)

    try {
      const result = await checkPaymentMutation.mutateAsync({ paymentId })

      if (result.success && result.data) {
        await refetchPayment()

        if (result.data.status === 'confirmed') {
          toast({
            title: 'Paiement confirmé !',
            description: 'Votre paiement a été reçu et confirmé',
          })
          onPaymentSuccess?.(paymentId)
        } else if (result.data.status === 'confirming') {
          toast({
            title: 'Paiement en cours de confirmation',
            description: `${result.data.confirmations} confirmations reçues`,
          })
        } else {
          toast({
            title: 'Paiement non trouvé',
            description: 'Nous n\'avons pas encore reçu votre paiement',
          })
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Auto-check toutes les 30 secondes
  useEffect(() => {
    if (!paymentId || payment?.status === 'confirmed') return

    const interval = setInterval(() => {
      handleCheckPayment()
    }, 30000)

    return () => clearInterval(interval)
  }, [paymentId, payment?.status])

  const cryptoOptions: Cryptocurrency[] = ['BTC', 'ETH', 'USDT', 'USDC']

  return (
    <div className="space-y-6">
      {/* Sélection de crypto */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Choisissez votre cryptomonnaie</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cryptoOptions.map((crypto) => {
            const info = cryptoInfo[crypto]
            const isSelected = selectedCrypto === crypto

            return (
              <button
                key={crypto}
                onClick={() => setSelectedCrypto(crypto)}
                disabled={createPaymentMutation.isPending}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-3xl mb-2">{info.icon}</div>
                <div className="font-semibold">{info.symbol}</div>
                <div className="text-xs text-gray-500">{info.name}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Montant à payer */}
      {conversion && (
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Montant à payer</p>
            <p className="text-4xl font-bold mb-1">
              {conversion.cryptoAmount.toFixed(8)} {selectedCrypto}
            </p>
            <p className="text-gray-500">
              ≈ {(amount / 100).toFixed(2)} {currency}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Taux: 1 {selectedCrypto} = {conversion.exchangeRate.toLocaleString()} {currency}
            </p>
          </div>
        </Card>
      )}

      {/* Adresse de paiement et QR code */}
      {payment && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* QR Code */}
            {payment.qrCodeUrl && (
              <div className="flex justify-center">
                <div className="border-4 border-gray-200 rounded-lg p-2">
                  <Image
                    src={payment.qrCodeUrl}
                    alt="QR Code"
                    width={250}
                    height={250}
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* Adresse */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Adresse de paiement {cryptoInfo[selectedCrypto].name}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={payment.address}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm"
                />
                <Button onClick={handleCopyAddress} variant="outline">
                  {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {payment.status === 'confirmed' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-600">Confirmé</span>
                  </>
                ) : payment.status === 'confirming' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                    <span className="font-semibold text-yellow-600">En confirmation...</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="font-semibold text-gray-600">En attente du paiement</span>
                  </>
                )}
              </div>

              <Button onClick={handleCheckPayment} disabled={isChecking} variant="outline" size="sm">
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Vérifier
              </Button>
            </div>

            {/* Expiration */}
            <div className="text-center text-sm text-gray-500">
              <Clock className="inline h-4 w-4 mr-1" />
              Expire le {new Date(payment.expiresAt).toLocaleString('fr-FR')}
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Instructions
        </h4>
        <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
          <li>Scannez le QR code ou copiez l'adresse</li>
          <li>Envoyez exactement le montant indiqué depuis votre wallet</li>
          <li>Attendez la confirmation sur la blockchain</li>
          <li>Votre commande sera validée automatiquement</li>
        </ol>
      </Card>
    </div>
  )
}
