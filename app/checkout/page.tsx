'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import Image from 'next/image'
import { ShoppingBag, CreditCard, Truck, MapPin, Mail, User, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (order) => {
      clearCart()
      router.push(`/order-confirmation/${order.orderNumber}`)
    },
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la création de la commande')
      setIsProcessing(false)
    },
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    try {
      await createOrder.mutateAsync({
        storeId: '000000000000000000000001',
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        items: items.map((item) => ({
          productId: item.productId,
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
    } catch (err) {
      console.error('Order creation failed:', err)
    }
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card variant="default" className="p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">
              Ajoutez des produits à votre panier avant de passer commande.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Découvrir nos produits
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Commande</h1>
        <p className="text-gray-600">Complétez vos informations pour finaliser votre achat</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informations de contact</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                helperText="Nous vous enverrons une confirmation de commande"
              />

              <Input
                label="Téléphone (optionnel)"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </form>
          </Card>

          {/* Shipping Address */}
          <Card variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Adresse de livraison</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jean"
                />
                <Input
                  label="Nom"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Dupont"
                />
              </div>

              <Input
                label="Adresse"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de la Paix"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ville"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
                <Input
                  label="Code postal"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                />
              </div>

              <Input
                label="Pays"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="France"
              />
            </div>
          </Card>

          {/* Payment Method */}
          <Card variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Mode de paiement</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Carte bancaire</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#003087">
                      <path d="M8.32 21.97a.546.546 0 01-.5-.33L4.88 12.15a.577.577 0 01.5-.71h4.76l2.3-7.69C12.6 3.11 13.18 2 14.48 2h4.85c2.89 0 5.45 1.64 5.45 4.98 0 3.34-2.69 6.34-6.34 6.34H15.7l-.61 2.04-1.31 4.38a2.14 2.14 0 01-2.02 1.49H8.78c-.23 0-.46-.16-.46-.26z"/>
                    </svg>
                    <span className="font-medium text-gray-900">PayPal</span>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Paiement 100% sécurisé</p>
                <p className="text-blue-700">
                  Vos informations de paiement sont cryptées et sécurisées
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isProcessing}
            onClick={handleSubmit}
          >
            Passer la commande
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-contain" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-xs text-gray-600">{item.variantName}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      Qté: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Gratuite</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal > 0 && subtotal < 50 && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Plus que {formatPrice(50 - subtotal)} pour la livraison gratuite !
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
