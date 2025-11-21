'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import Image from 'next/image'
import { ShoppingBag, CreditCard, Truck, MapPin, Mail, User, Lock, CheckCircle, Percent, X, ArrowLeft, ArrowRight, AlertCircle, Check, Star, Gift } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  { id: 1, name: 'Contact', icon: Mail },
  { id: 2, name: 'Livraison', icon: MapPin },
  { id: 3, name: 'Paiement', icon: CreditCard },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, getItemsByStore, getStoreSubtotal, getUniqueStoresCount } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank_transfer'>('card')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string
    code: string
    type: string
    value: number
    discountAmount: number
  } | null>(null)
  const [discountError, setDiscountError] = useState('')

  // Loyalty points
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0)
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState('')
  const [loyaltyError, setLoyaltyError] = useState('')

  // TODO: Get actual customer ID from session
  const DEMO_CUSTOMER_ID = '000000000000000000000001'

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
  })

  // Load saved checkout data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('foxcard-checkout')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed.formData || formData)
        setCurrentStep(parsed.currentStep || 1)
        setPaymentMethod(parsed.paymentMethod || 'card')
      } catch (e) {
        console.error('Failed to load saved checkout data:', e)
      }
    }
  }, [])

  // Auto-save checkout data to localStorage
  useEffect(() => {
    const saveData = {
      formData,
      currentStep,
      paymentMethod,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('foxcard-checkout', JSON.stringify(saveData))
  }, [formData, currentStep, paymentMethod])

  const createOrder = trpc.order.createFromCart.useMutation({
    onSuccess: async (result) => {
      try {
        const { orders } = result

        // For multi-store orders, use first order for payment redirect
        const primaryOrder = orders[0]

        if (paymentMethod === 'bank_transfer') {
          // Generate bank transfer for each store
          await Promise.all(
            orders.map(order =>
              generateBankTransferInstructions.mutateAsync({
                orderId: order.id,
                storeId: order.storeId,
              })
            )
          )
          // Redirect to first order confirmation (will show all orders)
          router.push(`/order-confirmation/${primaryOrder.orderNumber}?bank_transfer=true&multi_store=true`)
        } else if (paymentMethod === 'paypal') {
          const paypalOrder = await createPayPalOrder.mutateAsync({
            orderId: primaryOrder.id,
            returnUrl: `${window.location.origin}/order-confirmation/${primaryOrder.orderNumber}?paypal=true&token={TOKEN}&multi_store=true`,
            cancelUrl: `${window.location.origin}/checkout?canceled=true`,
          })
          if (paypalOrder.approvalUrl) {
            window.location.href = paypalOrder.approvalUrl
          }
        } else {
          const session = await createCheckoutSession.mutateAsync({
            orderId: primaryOrder.id,
            successUrl: `${window.location.origin}/order-confirmation/${primaryOrder.orderNumber}?session_id={CHECKOUT_SESSION_ID}&multi_store=true`,
            cancelUrl: `${window.location.origin}/checkout?canceled=true`,
          })
          if (session.url) {
            window.location.href = session.url
          }
        }
        // Clear saved checkout data on success
        localStorage.removeItem('foxcard-checkout')
      } catch (err) {
        console.error('Failed to create payment session:', err)
        setError('Erreur lors de la creation de la session de paiement')
        setIsProcessing(false)
      }
    },
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la creation de la commande')
      setIsProcessing(false)
    },
  })

  const createCheckoutSession = trpc.payment.createCheckoutSession.useMutation()
  const createPayPalOrder = trpc.payment.createPayPalOrder.useMutation()
  const generateBankTransferInstructions = trpc.payment.generateBankTransferInstructions.useMutation()

  const validateDiscount = trpc.discount.validateCode.useQuery(
    {
      storeId: '000000000000000000000001',
      code: discountCode,
      orderAmount: getTotalPrice(),
    },
    {
      enabled: false,
    }
  )

  const incrementUsage = trpc.discount.incrementUsage.useMutation()
  const trackAbandonedCart = trpc.abandonedCart.track.useMutation()

  // Loyalty queries
  const { data: loyaltyData } = trpc.loyalty.getBalance.useQuery(
    { customerId: DEMO_CUSTOMER_ID },
    { enabled: !!formData.email } // Only fetch if user has entered email
  )
  const redeemPoints = trpc.loyalty.redeemPoints.useMutation()

  // Track abandoned cart when user enters email and has items
  useEffect(() => {
    if (formData.email && formData.email.includes('@') && items.length > 0) {
      const timer = setTimeout(() => {
        // Track after 5 minutes of inactivity on checkout page
        trackAbandonedCart.mutate({
          storeId: '000000000000000000000001',
          email: formData.email,
          customerName: formData.firstName && formData.lastName
            ? `${formData.firstName} ${formData.lastName}`
            : undefined,
          phone: formData.phone || undefined,
          cartData: { items },
        })
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [formData.email, formData.firstName, formData.lastName, formData.phone, items])

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Veuillez entrer un code promo')
      return
    }

    setDiscountError('')

    try {
      const result = await validateDiscount.refetch()
      if (result.data) {
        setAppliedDiscount(result.data)
        setDiscountCode('')
      }
    } catch (err: any) {
      setDiscountError(err.message || 'Code promo invalide')
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountError('')
  }

  const handleApplyLoyaltyPoints = () => {
    const pointsToUse = parseInt(loyaltyPointsInput)

    if (!pointsToUse || pointsToUse <= 0) {
      setLoyaltyError('Veuillez entrer un nombre de points valide')
      return
    }

    if (!loyaltyData || pointsToUse > loyaltyData.points) {
      setLoyaltyError(`Vous n'avez que ${loyaltyData?.points || 0} points disponibles`)
      return
    }

    // Calculate max points that can be used (can't exceed order total)
    const maxPointsUsable = Math.floor(subtotal + shipping - discount)
    if (pointsToUse > maxPointsUsable) {
      setLoyaltyError(`Vous ne pouvez utiliser que ${maxPointsUsable} points maximum pour cette commande`)
      return
    }

    setLoyaltyPointsUsed(pointsToUse)
    setLoyaltyPointsInput('')
    setLoyaltyError('')
  }

  const handleRemoveLoyaltyPoints = () => {
    setLoyaltyPointsUsed(0)
    setLoyaltyError('')
  }

  const handleSubmit = async () => {
    setError('')
    setIsProcessing(true)

    try {
      const result = await createOrder.mutateAsync({
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        items: items.map((item) => ({
          productId: item.productId,
          storeId: item.storeId, // Multi-store support
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
      })

      if (appliedDiscount) {
        incrementUsage.mutate({ id: appliedDiscount.id })
      }

      // Redeem loyalty points if used (apply to first order only)
      if (loyaltyPointsUsed > 0 && result.orders[0]) {
        try {
          await redeemPoints.mutateAsync({
            customerId: DEMO_CUSTOMER_ID,
            points: loyaltyPointsUsed,
            orderId: result.orders[0].id,
          })
        } catch (loyaltyErr) {
          console.error('Failed to redeem loyalty points:', loyaltyErr)
          // Don't fail the order if loyalty redemption fails
        }
      }
    } catch (err) {
      console.error('Order creation failed:', err)
    }
  }

  const validateStep = (step: number) => {
    if (step === 1) {
      return formData.email.trim() !== '' && formData.email.includes('@')
    }
    if (step === 2) {
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.address.trim() !== '' &&
        formData.city.trim() !== '' &&
        formData.postalCode.trim() !== '' &&
        formData.country.trim() !== ''
      )
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setError('')
    } else {
      setError('Veuillez remplir tous les champs requis')
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const subtotal = getTotalPrice()

  // Multi-store: shipping and tax calculated per store in backend (createFromCart)
  // Display estimated total only
  const shipping = subtotal > 50 ? 0 : 5.99 // Estimated shipping
  const discount = appliedDiscount?.discountAmount || 0
  const loyaltyDiscount = loyaltyPointsUsed // 1 point = 1€

  const total = Math.max(0, subtotal + shipping - discount - loyaltyDiscount)

  if (items.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl">
              <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-theme-primary" />
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold text-theme-text mb-4"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                Votre panier est vide
              </h1>
              <p className="text-theme-text-secondary mb-8 text-lg">
                Ajoutez des produits à votre panier avant de passer commande.
              </p>
              <Link href="/products">
                <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            Commande
          </h1>
          <p className="text-xl text-theme-text-secondary">
            Complétez vos informations pour finaliser votre achat
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : isCurrent
                          ? 'bg-theme-primary text-theme-background shadow-lg shadow-theme-primary/30'
                          : 'bg-theme-surface border-2 border-theme-border text-theme-text-muted'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" strokeWidth={3} />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-semibold ${
                        isCurrent ? 'text-theme-primary' : isCompleted ? 'text-green-600' : 'text-theme-text-muted'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-theme-border'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-theme-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-theme-primary" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Informations de contact
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                      placeholder="votre@email.com"
                    />
                    <p className="text-xs text-theme-text-muted mt-1.5">
                      Nous vous enverrons une confirmation de commande
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Téléphone (optionnel)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Adresse de livraison
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Adresse *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                      placeholder="123 Rue de la Paix"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        Ville *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        Code postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="75001"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Pays *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Mode de paiement
                  </h2>
                </div>

                {/* Payment Methods Accepted */}
                <div className="mb-6 p-4 bg-theme-background border border-theme-border rounded-xl">
                  <p className="text-sm text-theme-text mb-3 font-semibold">
                    Moyens de paiement acceptés :
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-2 bg-theme-surface rounded-lg border border-theme-border flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-theme-text-secondary" />
                      <span className="text-xs font-medium text-theme-text">Carte</span>
                    </div>
                    <div className="px-3 py-2 bg-black text-white rounded-lg flex items-center gap-1">
                      <svg className="w-8 h-4" viewBox="0 0 32 14" fill="currentColor">
                        <path d="M6.8 3.4c-.4.5-1 .8-1.6.8-.1-.6.2-1.2.6-1.6.4-.5 1.1-.8 1.6-.8.1.6-.2 1.2-.6 1.6zm.6.9c-.9-.1-1.7.5-2.1.5-.5 0-1.1-.5-1.8-.5-.9 0-1.8.5-2.2 1.3-.9 1.6-.2 4.1.7 5.4.5.7 1 1.4 1.7 1.4.7 0 .9-.5 1.8-.5s1.1.5 1.8.5c.8 0 1.2-.6 1.7-1.3.5-.8.8-1.5.8-1.5 0 0-1.5-.6-1.5-2.3-.1-1.4 1.2-2.1 1.2-2.1-.7-1-1.7-1.1-2-.1v.1z"/>
                      </svg>
                      <span className="text-xs font-medium">Pay</span>
                    </div>
                    <div className="px-3 py-2 bg-theme-surface rounded-lg border border-theme-border flex items-center gap-1">
                      <svg className="w-8 h-4" viewBox="0 0 32 14" fill="none">
                        <path d="M15.7 7.2v2.7h-.7v-6.4h1.8c.5 0 .8.2 1.1.5.3.3.5.7.5 1.1s-.2.8-.5 1.1c-.3.3-.7.5-1.1.5h-1.1v-.5zm0-3v2.3h1.1c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.8s-.1-.5-.3-.8c-.2-.2-.4-.3-.7-.3h-1.1z" fill="#5F6368"/>
                      </svg>
                      <span className="text-xs font-medium text-theme-text">Pay</span>
                    </div>
                    <div className="px-3 py-2 bg-theme-surface rounded-lg border border-theme-border flex items-center gap-1">
                      <svg className="w-5 h-4" viewBox="0 0 24 24" fill="#003087">
                        <path d="M8.32 21.97a.546.546 0 01-.5-.33L4.88 12.15a.577.577 0 01.5-.71h4.76l2.3-7.69C12.6 3.11 13.18 2 14.48 2h4.85c2.89 0 5.45 1.64 5.45 4.98 0 3.34-2.69 6.34-6.34 6.34H15.7l-.61 2.04-1.31 4.38a2.14 2.14 0 01-2.02 1.49H8.78c-.23 0-.46-.16-.46-.26z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'card'
                        ? 'border-theme-primary bg-theme-primary/5 shadow-lg shadow-theme-primary/10'
                        : 'border-theme-border hover:border-theme-border-light hover:bg-theme-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-theme-text-secondary" />
                        <span className="font-semibold text-theme-text">Carte bancaire</span>
                      </div>
                      {paymentMethod === 'card' && (
                        <CheckCircle className="w-5 h-5 text-theme-primary" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('paypal')}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'paypal'
                        ? 'border-theme-primary bg-theme-primary/5 shadow-lg shadow-theme-primary/10'
                        : 'border-theme-border hover:border-theme-border-light hover:bg-theme-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#003087">
                          <path d="M8.32 21.97a.546.546 0 01-.5-.33L4.88 12.15a.577.577 0 01.5-.71h4.76l2.3-7.69C12.6 3.11 13.18 2 14.48 2h4.85c2.89 0 5.45 1.64 5.45 4.98 0 3.34-2.69 6.34-6.34 6.34H15.7l-.61 2.04-1.31 4.38a2.14 2.14 0 01-2.02 1.49H8.78c-.23 0-.46-.16-.46-.26z"/>
                        </svg>
                        <span className="font-semibold text-theme-text">PayPal</span>
                      </div>
                      {paymentMethod === 'paypal' && (
                        <CheckCircle className="w-5 h-5 text-theme-primary" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-theme-primary bg-theme-primary/5 shadow-lg shadow-theme-primary/10'
                        : 'border-theme-border hover:border-theme-border-light hover:bg-theme-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <span className="font-semibold text-theme-text block">Virement bancaire</span>
                          <span className="text-xs text-theme-text-muted">Paiement sous 2-3 jours</span>
                        </div>
                      </div>
                      {paymentMethod === 'bank_transfer' && (
                        <CheckCircle className="w-5 h-5 text-theme-primary" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Paiement 100% sécurisé</p>
                    <p className="text-blue-700">
                      Vos informations de paiement sont cryptées et sécurisées
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-theme-background hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
              ) : (
                <Link href="/cart">
                  <button className="px-6 py-3 bg-theme-background hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Panier
                  </button>
                </Link>
              )}

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 ml-auto"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-primary/50 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 ml-auto"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Traitement...
                    </>
                  ) : (
                    <>
                      Passer commande
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl sticky top-24">
              <h2
                className="text-2xl font-bold text-theme-text mb-6"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Récapitulatif
              </h2>

              <div className="space-y-6 mb-6">
                {Object.entries(getItemsByStore()).map(([storeId, storeItems]) => (
                  <div key={storeId} className="space-y-3">
                    {/* Store Header (only if multiple stores) */}
                    {getUniqueStoresCount() > 1 && (
                      <div className="pb-2 border-b border-theme-border">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-theme-text uppercase tracking-wide">
                            {storeItems[0]?.storeName || 'Boutique'}
                          </h4>
                          <span className="text-xs font-medium text-theme-text-muted">
                            {formatPrice(getStoreSubtotal(storeId))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Store Items */}
                    {storeItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-theme-background border border-theme-border rounded-xl overflow-hidden">
                          {item.image && (
                            <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="64px" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-theme-text text-sm line-clamp-2">{item.name}</h3>
                          {item.variantName && (
                            <p className="text-xs text-theme-text-muted mt-0.5">{item.variantName}</p>
                          )}
                          <p className="text-sm text-theme-text-secondary mt-1">
                            Qté: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="border-t border-theme-border pt-4 space-y-4">
                {/* Discount Code Input */}
                {!appliedDiscount && (
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-semibold text-theme-text"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Code promo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase())
                          setDiscountError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyDiscount()
                          }
                        }}
                        placeholder="PROMO2024"
                        className="flex-1 px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!discountCode.trim() || validateDiscount.isFetching}
                        className="px-4 py-2.5 bg-theme-background hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-lg font-semibold text-sm transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {validateDiscount.isFetching ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          'Appliquer'
                        )}
                      </button>
                    </div>
                    {discountError && (
                      <p className="text-xs text-red-600 font-medium">{discountError}</p>
                    )}
                  </div>
                )}

                {/* Applied Discount */}
                {appliedDiscount && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-bold text-green-900">
                            {appliedDiscount.code}
                          </p>
                          <p className="text-xs text-green-700">
                            {appliedDiscount.type === 'PERCENTAGE'
                              ? `${appliedDiscount.value}% de réduction`
                              : `${formatPrice(appliedDiscount.value)} de réduction`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Loyalty Points */}
                {loyaltyData && loyaltyData.points > 0 && !loyaltyPointsUsed && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className="block text-sm font-semibold text-theme-text"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        Points de fidélité
                      </label>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full">
                        <Star className="w-3.5 h-3.5" fill="currentColor" />
                        <span className="text-xs font-bold">{loyaltyData.points} pts</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={Math.min(loyaltyData.points, Math.floor(subtotal + shipping - discount))}
                        value={loyaltyPointsInput}
                        onChange={(e) => {
                          setLoyaltyPointsInput(e.target.value)
                          setLoyaltyError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyLoyaltyPoints()
                          }
                        }}
                        placeholder={`Max: ${Math.min(loyaltyData.points, Math.floor(subtotal + shipping - discount))}`}
                        className="flex-1 px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLoyaltyPoints}
                        disabled={!loyaltyPointsInput || parseInt(loyaltyPointsInput) <= 0}
                        className="px-4 py-2.5 bg-theme-background hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-lg font-semibold text-sm transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Utiliser
                      </button>
                    </div>
                    {loyaltyError && (
                      <p className="text-xs text-red-600 font-medium">{loyaltyError}</p>
                    )}
                    <p className="text-xs text-theme-text-muted">
                      1 point = 1€ de réduction • Niveau {loyaltyData.tier}
                    </p>
                  </div>
                )}

                {/* Applied Loyalty Points */}
                {loyaltyPointsUsed > 0 && (
                  <div className="p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-bold text-orange-900">
                            {loyaltyPointsUsed} points utilisés
                          </p>
                          <p className="text-xs text-orange-700">
                            -{formatPrice(loyaltyPointsUsed)} de réduction
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLoyaltyPoints}
                        className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-500/20 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-theme-text-secondary">
                    <span>Sous-total</span>
                    <span className="font-semibold text-theme-text">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-theme-text-secondary">
                    <div className="flex flex-col">
                      <span>Livraison</span>
                      <span className="text-xs text-theme-text-muted">
                        Calculée par boutique
                      </span>
                    </div>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-bold">Gratuite</span>
                      ) : (
                        <span className="text-theme-text">{formatPrice(shipping)} <span className="text-xs text-theme-text-muted">est.</span></span>
                      )}
                    </span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Réduction</span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {loyaltyPointsUsed > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span className="font-medium">Points de fidélité</span>
                      <span className="font-bold">-{formatPrice(loyaltyDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-theme-border">
                    <span className="text-lg font-bold text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
