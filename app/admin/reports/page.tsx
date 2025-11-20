'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

type ReportType = 'sales' | 'customers' | 'products'

export default function ReportsPage() {
  const storeId = '000000000000000000000001' // TODO: Get from context

  const [reportType, setReportType] = useState<ReportType>('sales')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch report data
  const { data: salesReport, isLoading: salesLoading } = trpc.report.getSalesReport.useQuery(
    { storeId, startDate, endDate },
    { enabled: reportType === 'sales' }
  )

  const { data: customerReport, isLoading: customerLoading } = trpc.report.getCustomerReport.useQuery(
    { storeId, startDate, endDate },
    { enabled: reportType === 'customers' }
  )

  const { data: productReport, isLoading: productLoading } = trpc.report.getProductReport.useQuery(
    { storeId, startDate, endDate },
    { enabled: reportType === 'products' }
  )

  const isLoading = salesLoading || customerLoading || productLoading

  // Export to CSV (simple Excel-compatible format)
  const exportToCSV = () => {
    setIsGenerating(true)

    let csvContent = ''
    let filename = ''

    if (reportType === 'sales' && salesReport) {
      filename = `rapport-ventes-${startDate}-${endDate}.csv`

      // Summary
      csvContent += 'RAPPORT DE VENTES\n'
      csvContent += `Période,${startDate} au ${endDate}\n`
      csvContent += `Revenu total,${salesReport.summary.totalRevenue.toFixed(2)}\n`
      csvContent += `Commandes,${salesReport.summary.totalOrders}\n`
      csvContent += `Panier moyen,${salesReport.summary.averageOrderValue.toFixed(2)}\n\n`

      // By date
      csvContent += 'VENTES PAR DATE\n'
      csvContent += 'Date,Revenu,Commandes\n'
      salesReport.byDate.forEach((row) => {
        csvContent += `${row.date},${row.revenue.toFixed(2)},${row.orders}\n`
      })
      csvContent += '\n'

      // By product
      csvContent += 'VENTES PAR PRODUIT\n'
      csvContent += 'Produit,Revenu,Quantité\n'
      salesReport.byProduct.forEach((row) => {
        csvContent += `"${row.name}",${row.revenue.toFixed(2)},${row.quantity}\n`
      })
      csvContent += '\n'

      // By category
      csvContent += 'VENTES PAR CATÉGORIE\n'
      csvContent += 'Catégorie,Revenu,Quantité\n'
      salesReport.byCategory.forEach((row) => {
        csvContent += `"${row.name}",${row.revenue.toFixed(2)},${row.quantity}\n`
      })

    } else if (reportType === 'customers' && customerReport) {
      filename = `rapport-clients-${startDate}-${endDate}.csv`

      // Summary
      csvContent += 'RAPPORT CLIENTS\n'
      csvContent += `Période,${startDate} au ${endDate}\n`
      csvContent += `Total clients,${customerReport.summary.totalCustomers}\n`
      csvContent += `Nouveaux clients,${customerReport.summary.newCustomers}\n`
      csvContent += `Taux de rétention,${customerReport.summary.retentionRate.toFixed(1)}%\n`
      csvContent += `LTV moyen,${customerReport.summary.avgLTV.toFixed(2)}\n\n`

      // Segments
      csvContent += 'SEGMENTS\n'
      csvContent += `VIP (>500€),${customerReport.segments.vip}\n`
      csvContent += `Réguliers (100-500€),${customerReport.segments.regular}\n`
      csvContent += `Occasionnels (<100€),${customerReport.segments.occasional}\n`
      csvContent += `Inactifs,${customerReport.segments.inactive}\n\n`

      // Top customers
      csvContent += 'TOP CLIENTS\n'
      csvContent += 'Email,Nom,Total dépensé,Commandes,Panier moyen\n'
      customerReport.topCustomers.forEach((c) => {
        csvContent += `${c.email},"${c.name}",${c.totalSpent.toFixed(2)},${c.orderCount},${c.avgOrderValue.toFixed(2)}\n`
      })

    } else if (reportType === 'products' && productReport) {
      filename = `rapport-produits-${startDate}-${endDate}.csv`

      // Summary
      csvContent += 'RAPPORT PRODUITS\n'
      csvContent += `Période,${startDate} au ${endDate}\n`
      csvContent += `Total produits,${productReport.summary.totalProducts}\n`
      csvContent += `Produits actifs,${productReport.summary.activeProducts}\n`
      csvContent += `Revenu total,${productReport.summary.totalRevenue.toFixed(2)}\n`
      csvContent += `Quantité vendue,${productReport.summary.totalQuantitySold}\n\n`

      // All products
      csvContent += 'PERFORMANCES PRODUITS\n'
      csvContent += 'Nom,SKU,Catégorie,Prix,Coût,Revenu,Quantité,Marge %,Stock\n'
      productReport.products.forEach((p) => {
        csvContent += `"${p.name}",${p.sku},"${p.category}",${p.price.toFixed(2)},${p.cost?.toFixed(2) || ''},${p.revenue.toFixed(2)},${p.quantity},${p.margin?.toFixed(1) || ''},${p.stock}\n`
      })
    }

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    setIsGenerating(false)
  }

  // Export to PDF (using browser print)
  const exportToPDF = () => {
    setIsGenerating(true)

    // Create printable content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour générer le PDF')
      setIsGenerating(false)
      return
    }

    let content = `
      <html>
      <head>
        <title>Rapport ${reportType}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; margin-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
          .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .summary-item { display: flex; justify-content: space-between; padding: 5px 0; }
          .summary-label { color: #6b7280; }
          .summary-value { font-weight: bold; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .text-right { text-align: right; }
          .period { color: #6b7280; font-size: 14px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
    `

    if (reportType === 'sales' && salesReport) {
      content += `
        <h1>Rapport de Ventes</h1>
        <p class="period">${startDate} au ${endDate}</p>

        <div class="summary">
          <div class="summary-item">
            <span class="summary-label">Revenu total</span>
            <span class="summary-value">${formatPrice(salesReport.summary.totalRevenue)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Commandes</span>
            <span class="summary-value">${salesReport.summary.totalOrders}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Panier moyen</span>
            <span class="summary-value">${formatPrice(salesReport.summary.averageOrderValue)}</span>
          </div>
        </div>

        <h2>Top Produits</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th class="text-right">Revenu</th>
              <th class="text-right">Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.byProduct.slice(0, 10).map(p => `
              <tr>
                <td>${p.name}</td>
                <td class="text-right">${formatPrice(p.revenue)}</td>
                <td class="text-right">${p.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Ventes par Catégorie</h2>
        <table>
          <thead>
            <tr>
              <th>Catégorie</th>
              <th class="text-right">Revenu</th>
              <th class="text-right">Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.byCategory.map(c => `
              <tr>
                <td>${c.name}</td>
                <td class="text-right">${formatPrice(c.revenue)}</td>
                <td class="text-right">${c.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (reportType === 'customers' && customerReport) {
      content += `
        <h1>Rapport Clients</h1>
        <p class="period">${startDate} au ${endDate}</p>

        <div class="summary">
          <div class="summary-item">
            <span class="summary-label">Total clients</span>
            <span class="summary-value">${customerReport.summary.totalCustomers}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Nouveaux clients</span>
            <span class="summary-value">${customerReport.summary.newCustomers}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Taux de rétention</span>
            <span class="summary-value">${customerReport.summary.retentionRate.toFixed(1)}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">LTV moyen</span>
            <span class="summary-value">${formatPrice(customerReport.summary.avgLTV)}</span>
          </div>
        </div>

        <h2>Segments</h2>
        <table>
          <tbody>
            <tr><td>VIP (>500€)</td><td class="text-right">${customerReport.segments.vip}</td></tr>
            <tr><td>Réguliers (100-500€)</td><td class="text-right">${customerReport.segments.regular}</td></tr>
            <tr><td>Occasionnels (<100€)</td><td class="text-right">${customerReport.segments.occasional}</td></tr>
            <tr><td>Inactifs</td><td class="text-right">${customerReport.segments.inactive}</td></tr>
          </tbody>
        </table>

        <h2>Top Clients</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th class="text-right">Total dépensé</th>
              <th class="text-right">Commandes</th>
            </tr>
          </thead>
          <tbody>
            ${customerReport.topCustomers.slice(0, 10).map(c => `
              <tr>
                <td>${c.email}</td>
                <td class="text-right">${formatPrice(c.totalSpent)}</td>
                <td class="text-right">${c.orderCount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (reportType === 'products' && productReport) {
      content += `
        <h1>Rapport Produits</h1>
        <p class="period">${startDate} au ${endDate}</p>

        <div class="summary">
          <div class="summary-item">
            <span class="summary-label">Total produits</span>
            <span class="summary-value">${productReport.summary.totalProducts}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Produits actifs</span>
            <span class="summary-value">${productReport.summary.activeProducts}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Revenu total</span>
            <span class="summary-value">${formatPrice(productReport.summary.totalRevenue)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Quantité vendue</span>
            <span class="summary-value">${productReport.summary.totalQuantitySold}</span>
          </div>
        </div>

        <h2>Top Produits par Revenu</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th class="text-right">Revenu</th>
              <th class="text-right">Quantité</th>
              <th class="text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            ${productReport.topByRevenue.map(p => `
              <tr>
                <td>${p.name}</td>
                <td class="text-right">${formatPrice(p.revenue)}</td>
                <td class="text-right">${p.quantity}</td>
                <td class="text-right">${p.stock}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${productReport.lowStock.length > 0 ? `
          <h2>⚠️ Stock Faible</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th class="text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${productReport.lowStock.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-right">${p.stock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      `
    }

    content += `
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    { id: 'sales' as ReportType, name: 'Ventes', icon: DollarSign, color: 'text-green-600' },
    { id: 'customers' as ReportType, name: 'Clients', icon: Users, color: 'text-blue-600' },
    { id: 'products' as ReportType, name: 'Produits', icon: Package, color: 'text-purple-600' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Générez et exportez vos rapports détaillés</p>
        </div>
      </div>

      {/* Report type and date selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de rapport
            </label>
            <div className="flex gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reportType === type.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Période
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-500">à</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
          <Button
            variant="primary"
            onClick={exportToPDF}
            disabled={isLoading || isGenerating}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
          <Button
            variant="secondary"
            onClick={exportToCSV}
            disabled={isLoading || isGenerating}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exporter Excel (CSV)
          </Button>
        </div>
      </Card>

      {/* Report preview */}
      {isLoading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Génération du rapport...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Sales Report */}
          {reportType === 'sales' && salesReport && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenu total</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(salesReport.summary.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commandes</p>
                      <p className="text-xl font-bold text-gray-900">
                        {salesReport.summary.totalOrders}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Panier moyen</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(salesReport.summary.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top products */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenu</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.byProduct.slice(0, 10).map((product) => (
                        <tr key={product.productId} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{product.name}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {formatPrice(product.revenue)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {product.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Customer Report */}
          {reportType === 'customers' && customerReport && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Total clients</p>
                  <p className="text-xl font-bold text-gray-900">{customerReport.summary.totalCustomers}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Nouveaux clients</p>
                  <p className="text-xl font-bold text-gray-900">{customerReport.summary.newCustomers}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Taux de rétention</p>
                  <p className="text-xl font-bold text-gray-900">{customerReport.summary.retentionRate.toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">LTV moyen</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(customerReport.summary.avgLTV)}</p>
                </Card>
              </div>

              {/* Segments */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments Clients</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">VIP (>500€)</p>
                    <p className="text-2xl font-bold text-yellow-900">{customerReport.segments.vip}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Réguliers</p>
                    <p className="text-2xl font-bold text-green-900">{customerReport.segments.regular}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Occasionnels</p>
                    <p className="text-2xl font-bold text-blue-900">{customerReport.segments.occasional}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">Inactifs</p>
                    <p className="text-2xl font-bold text-gray-900">{customerReport.segments.inactive}</p>
                  </div>
                </div>
              </Card>

              {/* Top customers */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total dépensé</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Commandes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerReport.topCustomers.slice(0, 10).map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{customer.email}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {formatPrice(customer.totalSpent)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {customer.orderCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Product Report */}
          {reportType === 'products' && productReport && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Total produits</p>
                  <p className="text-xl font-bold text-gray-900">{productReport.summary.totalProducts}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Produits actifs</p>
                  <p className="text-xl font-bold text-gray-900">{productReport.summary.activeProducts}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Revenu total</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(productReport.summary.totalRevenue)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Quantité vendue</p>
                  <p className="text-xl font-bold text-gray-900">{productReport.summary.totalQuantitySold}</p>
                </Card>
              </div>

              {/* Low stock alert */}
              {productReport.lowStock.length > 0 && (
                <Card className="p-6 bg-yellow-50 border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Stock Faible ({productReport.lowStock.length} produits)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productReport.lowStock.map((product) => (
                      <span
                        key={product.id}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {product.name} ({product.stock})
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Top products */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performances Produits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégorie</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenu</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantité</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productReport.products.slice(0, 15).map((product) => (
                        <tr key={product.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{product.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900">
                            {formatPrice(product.revenue)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {product.quantity}
                          </td>
                          <td className={`py-3 px-4 text-sm text-right ${product.stock <= 10 ? 'text-yellow-600 font-medium' : 'text-gray-600'}`}>
                            {product.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
