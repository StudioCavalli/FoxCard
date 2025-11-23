'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  FileText,
  Download,
  Send,
  Eye,
  Loader2,
  Search,
  Filter,
  Calendar,
  User,
  Plane,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Printer
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  USED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  CONFIRMED: 'Confirmé',
  USED: 'Utilisé',
  CANCELLED: 'Annulé',
  EXPIRED: 'Expiré',
}

interface Voucher {
  id: string
  voucherNumber: string
  bookingId: string
  customerName: string
  customerEmail: string
  packageName: string
  departureDate: string
  returnDate: string
  passengers: number
  totalAmount: number
  status: string
  createdAt: string
  sentAt?: string
  confirmedAt?: string
}

export default function VouchersPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Get bookings with travel packages to generate vouchers
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.booking.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    { enabled: !!storeId }
  )

  // Get travel packages
  const { data: packages } = trpc.travel.getPackages.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Transform bookings to voucher format
  const vouchers: Voucher[] = bookingsData?.bookings?.map((booking: any) => {
    const pkg = packages?.find((p: any) => p.id === booking.productId)
    return {
      id: booking.id,
      voucherNumber: `VCH-${booking.bookingNumber}`,
      bookingId: booking.bookingNumber,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      packageName: pkg?.name || 'Voyage',
      departureDate: booking.date,
      returnDate: booking.options?.endDate || booking.date,
      passengers: booking.guestCount,
      totalAmount: booking.totalPrice,
      status: booking.status === 'CONFIRMED' ? 'CONFIRMED' :
              booking.status === 'COMPLETED' ? 'USED' :
              booking.status === 'CANCELLED' ? 'CANCELLED' : 'DRAFT',
      createdAt: booking.createdAt,
      sentAt: booking.confirmedAt,
      confirmedAt: booking.confirmedAt,
    }
  }) || []

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.packageName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats
  const totalVouchers = vouchers.length
  const confirmedVouchers = vouchers.filter(v => v.status === 'CONFIRMED').length
  const pendingVouchers = vouchers.filter(v => v.status === 'DRAFT' || v.status === 'SENT').length
  const totalRevenue = vouchers
    .filter(v => v.status === 'CONFIRMED' || v.status === 'USED')
    .reduce((sum, v) => sum + v.totalAmount, 0)

  const handleDownloadPDF = async (voucher: Voucher) => {
    // TODO: Implement PDF generation
    console.log('Download PDF for voucher:', voucher.voucherNumber)
  }

  const handleSendEmail = async (voucher: Voucher) => {
    // TODO: Implement email sending
    console.log('Send email for voucher:', voucher.voucherNumber)
  }

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bons de Voyage</h1>
          <p className="text-gray-600">Gérez et envoyez les bons de voyage aux clients</p>
        </div>
        <AdminButton>
          <Plus className="w-4 h-4 mr-2" />
          Créer un bon manuel
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalVouchers}</p>
              <p className="text-sm text-gray-500">Total bons</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{confirmedVouchers}</p>
              <p className="text-sm text-gray-500">Confirmés</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingVouchers}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()}€</p>
              <p className="text-sm text-gray-500">Revenus confirmés</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro, client, voyage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Vouchers list */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">N° Bon</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Voyage</th>
                <th className="pb-3 font-medium">Départ</th>
                <th className="pb-3 font-medium">Passagers</th>
                <th className="pb-3 font-medium">Montant</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="text-sm">
                  <td className="py-3">
                    <span className="font-mono font-medium text-blue-600">
                      {voucher.voucherNumber}
                    </span>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900">{voucher.customerName}</p>
                      <p className="text-gray-500 text-xs">{voucher.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-gray-400" />
                      <span>{voucher.packageName}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    {new Date(voucher.departureDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{voucher.passengers}</span>
                    </div>
                  </td>
                  <td className="py-3 font-medium">{voucher.totalAmount.toLocaleString()}€</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[voucher.status]}`}>
                      {STATUS_LABELS[voucher.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher)
                          setShowPreview(true)
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Aperçu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(voucher)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(voucher)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Envoyer par email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                        title="Imprimer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVouchers.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucun bon trouvé avec ces critères.'
                : 'Aucun bon de voyage. Les bons sont générés automatiquement lors des réservations.'}
            </p>
          )}
        </div>
      </AdminCard>

      {/* Preview Modal */}
      {showPreview && selectedVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Voucher Preview */}
            <div className="p-8">
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg">
                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">BON DE VOYAGE</h2>
                  <p className="text-gray-500">{selectedVoucher.voucherNumber}</p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Voyageur</p>
                      <p className="font-medium">{selectedVoucher.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedVoucher.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Date d'émission</p>
                      <p className="font-medium">
                        {new Date(selectedVoucher.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">{selectedVoucher.packageName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Départ</p>
                        <p className="font-medium">
                          {new Date(selectedVoucher.departureDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Retour</p>
                        <p className="font-medium">
                          {new Date(selectedVoucher.returnDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre de passagers</p>
                      <p className="font-medium">{selectedVoucher.passengers} personne(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Montant total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedVoucher.totalAmount.toLocaleString()}€
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                  <p>Ce bon est valide uniquement pour le voyage indiqué.</p>
                  <p>Présentez ce document lors de l'enregistrement.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => setShowPreview(false)}>
                Fermer
              </AdminButton>
              <AdminButton onClick={() => handleDownloadPDF(selectedVoucher)}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </AdminButton>
              <AdminButton onClick={() => handleSendEmail(selectedVoucher)}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer par email
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
