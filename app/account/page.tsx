'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { User, Package, Settings, LogOut, ShoppingBag, Clock, MapPin, Mail, Phone } from 'lucide-react'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'settings'>('orders')

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const DEMO_STORE_ID = '000000000000000000000001'

  // Fetch user orders (this will need proper user ID from session)
  const { data: ordersData } = trpc.order.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const orders = ordersData?.orders || []

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Compte</h1>
        <p className="text-gray-600">Gérez vos informations et commandes</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-6">
            {/* User Info */}
            <div className="text-center mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">{session?.user?.name || 'Utilisateur'}</h3>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Package className="w-5 h-5" />
                Mes Commandes
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                Mon Profil
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Commandes</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucune commande
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Vous n'avez pas encore passé de commande
                    </p>
                    <Link href="/products">
                      <Button variant="primary">Découvrir nos produits</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} variant="default" className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Commande #{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                              </span>
                              <span>{order.items.length} article(s)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                                order.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.status === 'PENDING' && 'En attente'}
                              {order.status === 'PROCESSING' && 'En cours'}
                              {order.status === 'SHIPPED' && 'Expédiée'}
                              {order.status === 'COMPLETED' && 'Livrée'}
                              {order.status === 'CANCELLED' && 'Annulée'}
                            </span>
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">Adresse de livraison</p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <Link href={`/order-confirmation/${order.orderNumber}`}>
                            <Button variant="outline" size="sm">
                              Voir les détails
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h2>

              <form className="space-y-4">
                <Input
                  label="Nom complet"
                  defaultValue={session?.user?.name || ''}
                  placeholder="Jean Dupont"
                />

                <Input
                  label="Email"
                  type="email"
                  defaultValue={session?.user?.email || ''}
                  placeholder="votre@email.com"
                />

                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
                    rows={3}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>

                <div className="pt-4">
                  <Button variant="primary" size="lg">
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité</h2>

                <form className="space-y-4">
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    placeholder="••••••••"
                  />

                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    placeholder="••••••••"
                  />

                  <Input
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    placeholder="••••••••"
                  />

                  <div className="pt-4">
                    <Button variant="primary" size="lg">
                      Changer le mot de passe
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Préférences</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Newsletter</h3>
                      <p className="text-sm text-gray-600">
                        Recevoir les offres et nouveautés par email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications SMS</h3>
                      <p className="text-sm text-gray-600">
                        Recevoir des alertes par SMS pour vos commandes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
