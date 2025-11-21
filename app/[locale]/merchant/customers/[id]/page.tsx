'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
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
      deleteCustomer.mutate({ id: customerId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Client introuvable</h2>
        <p className="text-gray-500 mt-2">Ce client n'existe pas ou a été supprimé.</p>
        <Link href={`${basePath}/customers`}>
          <Button variant="primary" className="mt-4">
            Retour aux clients
          </Button>
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
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-500">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commandes</p>
                  <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dépensé</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(totalSpent)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moyenne</p>
                  <p className="text-xl font-bold text-gray-900">
                    {totalOrders > 0 ? formatPrice(totalSpent / totalOrders) : '0 €'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Historique des commandes</h2>
            </div>
            {customer.orders && customer.orders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`${basePath}/orders/${order.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Client depuis</p>
                  <p className="text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          {customer.address && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Adresse</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>{customer.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Info */}
          {customer.loyaltyPoints !== undefined && customer.loyaltyPoints > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Programme de fidélité</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</p>
                  <p className="text-sm text-gray-500">points de fidélité</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
