'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { User, Package, Settings, LogOut, ShoppingBag, Clock, MapPin, Mail, Phone, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePublicStore } from '@/lib/context/public-store-context'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations()
  const { selectedStore, stores } = usePublicStore()
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'settings'>('orders')

  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
  })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Get user profile
  const { data: userProfile, isLoading: profileLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
  })

  // Update profile when data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
      })
    }
  }, [userProfile])

  // Profile update mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setProfileSuccess(true)
      setProfileError('')
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (error) => {
      setProfileError(error.message)
      setProfileSuccess(false)
    },
  })

  // Password change mutation
  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError('')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (error) => {
      setPasswordError(error.message)
      setPasswordSuccess(false)
    },
  })

  // Use selected store or first available store
  const currentStoreId = selectedStore !== 'all' ? selectedStore : stores[0]?.id

  // Fetch user orders - MUST be before any conditional returns
  const { data: ordersData } = trpc.order.getAll.useQuery(
    {
      storeId: currentStoreId,
    },
    {
      enabled: status === 'authenticated' && !!currentStoreId,
    }
  )

  // Handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)

    if (!profileData.name || profileData.name.length < 2) {
      setProfileError(t('account.nameMinLength'))
      return
    }

    updateProfileMutation.mutate({
      name: profileData.name,
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordData.currentPassword) {
      setPasswordError(t('account.enterCurrentPassword'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('account.newPasswordMinLength'))
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('account.passwordsMismatch'))
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
  }

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-theme-text-secondary text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const orders = ordersData?.orders || []

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
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
            {t('account.title')}
          </h1>
          <p className="text-xl text-theme-text-secondary">
            {t('account.dashboard')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-theme-border">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full blur-xl opacity-30" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-theme-background" />
                  </div>
                </div>
                <h3
                  className="font-bold text-theme-text text-lg mb-1"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {userProfile?.name || session?.user?.name || t('account.user')}
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  {userProfile?.email || session?.user?.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-theme-primary/10 text-theme-primary font-semibold shadow-lg shadow-theme-primary/10'
                      : 'hover:bg-theme-background text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  {t('account.orders')}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-theme-primary/10 text-theme-primary font-semibold shadow-lg shadow-theme-primary/10'
                      : 'hover:bg-theme-background text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <User className="w-5 h-5" />
                  {t('account.profile')}
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-theme-primary/10 text-theme-primary font-semibold shadow-lg shadow-theme-primary/10'
                      : 'hover:bg-theme-background text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  {t('account.settings')}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  {t('common.logout')}
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
                  <h2
                    className="text-3xl font-bold text-theme-text mb-6"
                    style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                  >
                    {t('account.orders')}
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-theme-primary" />
                      </div>
                      <h3
                        className="text-2xl font-bold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {t('account.noOrders')}
                      </h3>
                      <p className="text-theme-text-secondary mb-8 text-lg">
                        {t('cart.continueShopping')}
                      </p>
                      <Link href="/products">
                        <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
                          {t('common.products')}
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="group p-6 bg-theme-background border border-theme-border rounded-2xl hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3
                                className="font-bold text-theme-text text-lg"
                                style={{ fontFamily: 'var(--theme-font-heading)' }}
                              >
                                Commande #{order.orderNumber}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-theme-text-secondary mt-2">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span>{order.items.length} article(s)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-3xl font-bold text-theme-text"
                                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                              >
                                {formatPrice(order.total)}
                              </p>
                              <span
                                className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mt-2 ${
                                  order.status === 'COMPLETED'
                                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                    : order.status === 'PROCESSING'
                                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                    : order.status === 'CANCELLED'
                                    ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                                }`}
                              >
                                {order.status === 'PENDING' && t('status.pending')}
                                {order.status === 'PROCESSING' && t('status.processing')}
                                {order.status === 'COMPLETED' && t('status.delivered')}
                                {order.status === 'CANCELLED' && t('status.cancelled')}
                                {order.status === 'REFUNDED' && t('status.refunded')}
                              </span>
                            </div>
                          </div>

                          {order.shippingAddress && (() => {
                            const address = order.shippingAddress as { address?: string; postalCode?: string; city?: string }
                            return (
                              <div className="flex items-start gap-3 text-sm text-theme-text-secondary border-t border-theme-border pt-4">
                                <MapPin className="w-5 h-5 mt-0.5 text-theme-primary" />
                                <div>
                                  <p className="font-semibold text-theme-text mb-1">{t('account.shippingAddress')}</p>
                                  <p>{address.address}</p>
                                  <p>{address.postalCode} {address.city}</p>
                                </div>
                              </div>
                            )
                          })()}

                          <div className="mt-4 flex justify-end">
                            <Link href={`/order-confirmation/${order.orderNumber}`}>
                              <button className="px-6 py-2.5 bg-theme-surface hover:bg-theme-background border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200">
                                {t('account.viewDetails')}
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
                <h2
                  className="text-3xl font-bold text-theme-text mb-6"
                  style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                >
                  Mon Profil
                </h2>

                {profileSuccess && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      Profil mis à jour avec succès !
                    </p>
                  </div>
                )}

                {profileError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{profileError}</p>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                      placeholder="Jean Dupont"
                      disabled={profileLoading}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-theme-text mb-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={userProfile?.email || ''}
                      className="w-full px-4 py-3.5 rounded-xl bg-theme-surface border border-theme-border text-theme-text-muted placeholder:text-theme-text-muted outline-none cursor-not-allowed"
                      placeholder="votre@email.com"
                      disabled
                    />
                    <p className="text-xs text-theme-text-muted mt-1.5">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending || profileLoading}
                      className="px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-primary/50 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enregistrement...
                        </>
                      ) : (
                        t('account.saveChanges')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
                  <h2
                    className="text-3xl font-bold text-theme-text mb-6"
                    style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                  >
                    Sécurité
                  </h2>

                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        {t('account.passwordSuccess')}
                      </p>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {t('account.currentPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {t('account.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <p className="text-xs text-theme-text-muted mt-1.5">
                        {t('account.minChars', { count: 6 })}
                      </p>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold text-theme-text mb-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {t('account.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-primary/50 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t('account.changingPassword')}
                          </>
                        ) : (
                          t('account.changePassword')
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl">
                  <h2
                    className="text-3xl font-bold text-theme-text mb-6"
                    style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                  >
                    {t('account.preferences')}
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-theme-background border border-theme-border rounded-xl hover:border-theme-border-light transition-all duration-200">
                      <div>
                        <h3
                          className="font-bold text-theme-text mb-1"
                          style={{ fontFamily: 'var(--theme-font-heading)' }}
                        >
                          Newsletter
                        </h3>
                        <p className="text-sm text-theme-text-secondary">
                          {t('account.receiveEmailOffers')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-theme-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-theme-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-theme-background border border-theme-border rounded-xl hover:border-theme-border-light transition-all duration-200">
                      <div>
                        <h3
                          className="font-bold text-theme-text mb-1"
                          style={{ fontFamily: 'var(--theme-font-heading)' }}
                        >
                          Notifications SMS
                        </h3>
                        <p className="text-sm text-theme-text-secondary">
                          {t('account.receiveSmsAlerts')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-theme-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-theme-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
