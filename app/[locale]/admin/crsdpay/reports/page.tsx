'use client'

/**
 * Financial Reports Page - Rapports financiers avec export CSV/PDF
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Download, FileText, Filter } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  const [storeId, setStoreId] = useState<string>('')
  const { toast } = useToast()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    const mockStoreId = '507f1f77bcf86cd799439011'
    setStoreId(mockStoreId)

    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  const { data, isLoading, refetch } = trpc.crsdpay.listTransactions.useQuery(
    {
      storeId,
      status: status as any || undefined,
      limit: 1000, // Get all for export
    },
    { enabled: !!storeId }
  )

  // Filter transactions by date range
  const filteredTransactions =
    data?.data.filter((t: any) => {
      const tDate = new Date(t.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      if (start && tDate < start) return false
      if (end && tDate > end) return false

      return true
    }) || []

  // Calculate stats
  const stats = {
    totalTransactions: filteredTransactions.length,
    succeededTransactions: filteredTransactions.filter((t: any) => t.status === 'succeeded')
      .length,
    totalRevenue: filteredTransactions
      .filter((t: any) => t.status === 'succeeded')
      .reduce((sum: number, t: any) => sum + t.amountCaptured, 0),
    totalRefunded: filteredTransactions
      .filter((t: any) => t.status === 'succeeded')
      .reduce((sum: number, t: any) => sum + t.amountRefunded, 0),
  }

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Aucune transaction à exporter',
        variant: 'destructive',
      })
      return
    }

    // Create CSV content
    const headers = [
      'Transaction ID',
      'Date',
      'Client Email',
      'Montant',
      'Devise',
      'Status',
      'Méthode',
      'Capturé',
      'Remboursé',
    ]

    const rows = filteredTransactions.map((t: any) => [
      t.transactionId,
      new Date(t.createdAt).toLocaleString('fr-FR'),
      t.customer?.email || '',
      (t.amount / 100).toFixed(2),
      t.currency,
      t.status,
      t.paymentMethod,
      (t.amountCaptured / 100).toFixed(2),
      (t.amountRefunded / 100).toFixed(2),
    ])

    const csvContent =
      headers.join(',') +
      '\n' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `crsdpay-report-${startDate}-${endDate}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Export réussi',
      description: `${filteredTransactions.length} transactions exportées en CSV`,
    })
  }

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Aucune transaction à exporter',
        variant: 'destructive',
      })
      return
    }

    // Create a simple HTML report that can be printed as PDF
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport crsdpay - ${startDate} à ${endDate}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #6366f1;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .stat {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      flex: 1;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px;
      text-align: left;
      font-size: 12px;
    }
    th {
      background: #f9fafb;
      font-weight: bold;
    }
    .succeeded { color: #10b981; }
    .failed { color: #ef4444; }
    .pending { color: #f59e0b; }
  </style>
</head>
<body>
  <h1>Rapport Financier crsdpay</h1>
  <p><strong>Période:</strong> ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}</p>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">Total Transactions</div>
      <div class="stat-value">${stats.totalTransactions}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Transactions Réussies</div>
      <div class="stat-value">${stats.succeededTransactions}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Revenu Total</div>
      <div class="stat-value">${(stats.totalRevenue / 100).toFixed(2)}€</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total Remboursé</div>
      <div class="stat-value">${(stats.totalRefunded / 100).toFixed(2)}€</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Transaction ID</th>
        <th>Date</th>
        <th>Client</th>
        <th>Montant</th>
        <th>Status</th>
        <th>Méthode</th>
      </tr>
    </thead>
    <tbody>
      ${filteredTransactions
        .map(
          (t: any) => `
        <tr>
          <td><code>${t.transactionId.slice(0, 24)}...</code></td>
          <td>${new Date(t.createdAt).toLocaleString('fr-FR')}</td>
          <td>${t.customer?.email || '-'}</td>
          <td><strong>${(t.amount / 100).toFixed(2)} ${t.currency.toUpperCase()}</strong></td>
          <td class="${t.status}">${t.status}</td>
          <td>${t.paymentMethod}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <p style="margin-top: 40px; color: #9ca3af; font-size: 12px;">
    Généré le ${new Date().toLocaleString('fr-FR')} par crsdpay Payment Gateway
  </p>
</body>
</html>
    `

    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()

      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)

      toast({
        title: 'Rapport généré',
        description: 'Fenêtre d\'impression ouverte',
      })
    }
  }

  if (!storeId) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Rapports Financiers</h1>
        <p className="text-gray-600">Générez et exportez vos rapports de transactions</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Tous</option>
              <option value="succeeded">Réussi</option>
              <option value="failed">Échoué</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="canceled">Annulé</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={() => refetch()} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold">{stats.totalTransactions}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Transactions Réussies</p>
          <p className="text-2xl font-bold text-green-600">{stats.succeededTransactions}</p>
          <p className="text-xs text-gray-500">
            {stats.totalTransactions > 0
              ? ((stats.succeededTransactions / stats.totalTransactions) * 100).toFixed(1)
              : 0}
            % taux de succès
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Revenu Total</p>
          <p className="text-2xl font-bold">{(stats.totalRevenue / 100).toFixed(2)}€</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Remboursé</p>
          <p className="text-2xl font-bold text-red-600">
            {(stats.totalRefunded / 100).toFixed(2)}€
          </p>
          <p className="text-xs text-gray-500">
            {stats.totalRevenue > 0
              ? ((stats.totalRefunded / stats.totalRevenue) * 100).toFixed(1)
              : 0}
            % du revenu
          </p>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exporter
        </h2>

        <div className="flex gap-4">
          <Button onClick={handleExportCSV} disabled={filteredTransactions.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={filteredTransactions.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Générer PDF
          </Button>
        </div>

        {filteredTransactions.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Aucune transaction trouvée pour cette période
          </p>
        )}
      </Card>

      {/* Transactions Preview */}
      {filteredTransactions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Aperçu ({filteredTransactions.length} transactions)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Transaction ID</th>
                  <th className="pb-2 font-semibold">Client</th>
                  <th className="pb-2 font-semibold">Montant</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.slice(0, 10).map((t: any) => (
                  <tr key={t.id}>
                    <td className="py-2">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {t.transactionId.slice(0, 20)}...
                      </code>
                    </td>
                    <td className="py-2">{t.customer?.email || '-'}</td>
                    <td className="py-2 font-semibold">
                      {(t.amount / 100).toFixed(2)} {t.currency.toUpperCase()}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          t.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length > 10 && (
              <p className="text-sm text-gray-500 mt-4">
                Affichage de 10 sur {filteredTransactions.length} transactions. Exportez pour voir
                toutes les transactions.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
