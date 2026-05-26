'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Award,
  Loader2,
  Trash2,
  Edit,
  Package
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { storeId } = useStoreContext()
  const customerId = params?.id as string
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const { data: customer, isLoading } = trpc.customer.getById.useQuery(
    { id: customerId },
    { enabled: !!customerId }
  )

  const deleteCustomer = trpc.customer.delete.useMutation({
    onSuccess: () => {
      router.push(`${basePath}/customers`)
    },
    onError: (err) => {
      alert(`Erreur: ${err.message}`)
    },
  })

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      deleteCustomer.mutate({ id: customerId, storeId: storeId! })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Client introuvable</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Ce client n'existe pas ou a été supprimé.</p>
        <Link href={`${basePath}/customers`}>
          <AdminButton className="mt-4">
            Retour aux clients
          </AdminButton>
        </Link>
      </div>
    )
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Client'
  const totalOrders = customer.orders?.length || 0
  const totalSpent = customer.orders?.reduce((sum, order) => sum + order.total, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/customers`}>
            <AdminButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </AdminButton>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <p className="text-slate-500 dark:text-slate-400">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            icon={<Trash2 className="w-4 h-4" />}
          >
            Supprimer
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <AdminCard padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary-500/20 dark:from-blue-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Commandes</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{totalOrders}</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Dépensé</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(totalSpent)}</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-500/30 dark:to-purple-500/30 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Moyenne</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {totalOrders > 0 ? formatPrice(totalSpent / totalOrders) : '0 €'}
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Orders History */}
          <AdminCard padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Historique des commandes</h2>
            </div>
            {customer.orders && customer.orders.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`${basePath}/orders/${order.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">#{order.orderNumber}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                        order.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Aucune commande</p>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                  <p className="text-slate-900 dark:text-white">{customer.email}</p>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Téléphone</p>
                    <p className="text-slate-900 dark:text-white">{customer.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Client depuis</p>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(customer.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Address */}
          {customer.address && (
            <AdminCard padding="lg">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Adresse</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {typeof customer.address === 'string' ? (
                    <p>{customer.address}</p>
                  ) : (
                    <>
                      {(customer.address as any).street && <p>{(customer.address as any).street}</p>}
                      {(customer.address as any).city && (
                        <p>{(customer.address as any).postalCode} {(customer.address as any).city}</p>
                      )}
                      {(customer.address as any).country && <p>{(customer.address as any).country}</p>}
                    </>
                  )}
                </div>
              </div>
            </AdminCard>
          )}

          {/* Loyalty Info */}
          {customer.loyaltyPoints !== undefined && customer.loyaltyPoints > 0 && (
            <AdminCard padding="lg">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Programme de fidélité</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{customer.loyaltyPoints}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">points de fidélité</p>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  )
}
