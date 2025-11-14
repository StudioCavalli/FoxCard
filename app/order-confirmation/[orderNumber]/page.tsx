'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Package, Mail, MapPin, Home, Loader2, Download, AlertCircle } from 'lucide-react'

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = use(params)
  const searchParams = useSearchParams()
  const [isCapturingPayment, setIsCapturingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [bankTransferDetails, setBankTransferDetails] = useState<any>(null)

  const { data: order, isLoading, refetch } = trpc.order.getByOrderNumber.useQuery({
    orderNumber,
  })

  const capturePayPalOrder = trpc.payment.capturePayPalOrder.useMutation()
  const generateBankTransferInstructions = trpc.payment.generateBankTransferInstructions.useMutation()

  // Handle PayPal return
  useEffect(() => {
    const isPayPalReturn = searchParams.get('paypal') === 'true'
    const paypalToken = searchParams.get('token')

    if (isPayPalReturn && paypalToken && order && order.paymentIntentId && order.paymentStatus !== 'PAID') {
      setIsCapturingPayment(true)

      capturePayPalOrder.mutate(
        {
          paypalOrderId: order.paymentIntentId,
          orderId: order.id,
        },
        {
          onSuccess: () => {
            setIsCapturingPayment(false)
            refetch()
          },
          onError: (error) => {
            setIsCapturingPayment(false)
            setPaymentError(error.message || 'Erreur lors de la capture du paiement PayPal')
          },
        }
      )
    }
  }, [order, searchParams, capturePayPalOrder, refetch])

  // Handle Bank Transfer return
  useEffect(() => {
    const isBankTransfer = searchParams.get('bank_transfer') === 'true'

    if (isBankTransfer && order && !bankTransferDetails) {
      generateBankTransferInstructions.mutate(
        {
          orderId: order.id,
          storeId: order.storeId,
        },
        {
          onSuccess: (details) => {
            setBankTransferDetails(details)
          },
          onError: (error) => {
            setPaymentError(error.message || 'Erreur lors de la génération des instructions de virement')
          },
        }
      )
    }
  }, [order, searchParams, bankTransferDetails, generateBankTransferInstructions])

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-theme-surface border border-theme-border rounded-2xl"></div>
              <div className="h-64 bg-theme-surface border border-theme-border rounded-2xl"></div>
              <div className="h-48 bg-theme-surface border border-theme-border rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl">
              <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-theme-primary" />
              </div>
              <h1
                className="text-3xl font-bold text-theme-text mb-4"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                Commande introuvable
              </h1>
              <p className="text-theme-text-secondary mb-8 text-lg">
                Cette commande n'existe pas ou le numéro de commande est incorrect.
              </p>
              <Link href="/products">
                <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
                  Retour aux produits
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const shippingAddress = order.shippingAddress as {
    firstName?: string
    lastName?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  } | null

  const shipping = order.subtotal > 50 ? 0 : 5.99
  const total = order.subtotal + shipping

  if (isCapturingPayment) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl">
              <Loader2 className="w-16 h-16 text-theme-primary animate-spin mx-auto mb-6" />
              <h1
                className="text-3xl font-bold text-theme-text mb-4"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                Finalisation du paiement...
              </h1>
              <p className="text-theme-text-secondary text-lg">
                Veuillez patienter pendant que nous confirmons votre paiement PayPal.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Payment Error */}
        {paymentError && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Success Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="p-8 bg-theme-surface border border-theme-border rounded-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                Commande confirmée !
              </h1>
              <p className="text-lg text-theme-text-secondary mb-6">
                Merci pour votre commande. Un email de confirmation a été envoyé à{' '}
                <span className="font-semibold text-theme-text">{order.customerEmail}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-theme-background border border-theme-border rounded-xl">
                <span className="text-sm text-theme-text-secondary">Numéro de commande:</span>
                <span
                  className="text-lg font-bold text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {order.orderNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Bank Transfer Instructions */}
          {bankTransferDetails && (
            <div className="p-6 bg-blue-500/10 border-2 border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Instructions de virement
                  </h2>
                  <p className="text-sm text-blue-800">Effectuez votre virement avec ces informations</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bénéficiaire</p>
                    <p className="text-base font-semibold text-gray-900">{bankTransferDetails.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Banque</p>
                    <p className="text-base font-semibold text-gray-900">{bankTransferDetails.bankName}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">IBAN</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{bankTransferDetails.iban}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">BIC / SWIFT</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{bankTransferDetails.bic}</p>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Montant</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(bankTransferDetails.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Référence (IMPORTANT)</p>
                    <p className="text-xl font-mono font-bold text-red-600">{bankTransferDetails.reference}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• N'oubliez pas d'indiquer la référence : <span className="font-bold">{bankTransferDetails.reference}</span></li>
                    <li>• Votre commande sera traitée dès réception du paiement (2-3 jours ouvrés)</li>
                    <li>• Conservez ces informations pour effectuer votre virement</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-theme-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-theme-primary" />
              </div>
              <h2
                className="text-2xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Articles commandés
              </h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-theme-border last:border-0">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-theme-background border border-theme-border rounded-xl overflow-hidden">
                    {item.product?.thumbnail && (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3
                      className="font-semibold text-theme-text mb-1"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-theme-text-secondary mb-1">{item.variantName}</p>
                    )}
                    <p className="text-sm text-theme-text-secondary">
                      Quantité: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-lg font-bold text-theme-text"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-theme-border space-y-2">
              <div className="flex justify-between text-theme-text-secondary">
                <span>Sous-total</span>
                <span className="font-semibold text-theme-text">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-theme-text-secondary">
                <span>Livraison</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold">Gratuite</span>
                  ) : (
                    <span className="text-theme-text">{formatPrice(shipping)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-theme-border">
                <span
                  className="text-xl font-bold text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Total
                </span>
                <span
                  className="text-3xl font-bold text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2
                  className="text-xl font-bold text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Adresse de livraison
                </h2>
              </div>
              <div className="text-theme-text-secondary space-y-1">
                {shippingAddress.firstName && shippingAddress.lastName && (
                  <p className="font-semibold text-theme-text">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                )}
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                {shippingAddress.city && shippingAddress.postalCode && (
                  <p>
                    {shippingAddress.postalCode} {shippingAddress.city}
                  </p>
                )}
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
                {shippingAddress.phone && (
                  <p className="text-theme-text-muted mt-2">Tél: {shippingAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Status */}
          <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-bold text-theme-text mb-2"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Prochaines étapes
                </h3>
                <div className="space-y-2 text-theme-text-secondary">
                  <p>
                    ✓ Vous recevrez un email de confirmation à{' '}
                    <span className="font-semibold text-theme-text">{order.customerEmail}</span>
                  </p>
                  <p>✓ Votre commande sera traitée sous 24-48 heures</p>
                  <p>✓ Vous recevrez un email avec le numéro de suivi dès l'expédition</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {order.paymentStatus === 'PAID' && (
              <a
                href={`/api/invoices/${order.orderNumber}`}
                download
                className="flex-1"
              >
                <button className="w-full px-6 py-3.5 bg-theme-surface hover:bg-theme-background border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Télécharger la facture
                </button>
              </a>
            )}

            <Link href="/products" className="flex-1">
              <button className="w-full px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Home className="w-5 h-5" />
                Continuer mes achats
              </button>
            </Link>
            <Link href="/account" className="flex-1">
              <button className="w-full px-6 py-3.5 bg-theme-surface hover:bg-theme-background border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                Voir mes commandes
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
