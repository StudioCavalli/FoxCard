'use client'

import { useState } from 'react'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
  FileText,
  Download,
} from 'lucide-react'

export default function InventoryReportsPage() {
  const { storeId } = useStoreContext()
  const [activeReport, setActiveReport] = useState<'value' | 'turnover' | 'obsolete' | 'abc'>('value')
  const [period, setPeriod] = useState(90)

  // Queries
  const { data: stockValue, isLoading: loadingValue } = trpc.inventoryReport.getStockValue.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId && activeReport === 'value' }
  )

  const { data: turnover, isLoading: loadingTurnover } = trpc.inventoryReport.getTurnoverRate.useQuery(
    { storeId: storeId || '', days: period },
    { enabled: !!storeId && activeReport === 'turnover' }
  )

  const { data: obsolete, isLoading: loadingObsolete } = trpc.inventoryReport.getObsoleteProducts.useQuery(
    { storeId: storeId || '', days: period },
    { enabled: !!storeId && activeReport === 'obsolete' }
  )

  const { data: abc, isLoading: loadingABC } = trpc.inventoryReport.getABCAnalysis.useQuery(
    { storeId: storeId || '', days: period },
    { enabled: !!storeId && activeReport === 'abc' }
  )

  const { data: recommendations } = trpc.inventoryReport.getRecommendations.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId }
  )

  const isLoading = loadingValue || loadingTurnover || loadingObsolete || loadingABC

  const exportReport = () => {
    let data: any[] = []
    let filename = ''

    switch (activeReport) {
      case 'value':
        if (stockValue) {
          data = [
            ...stockValue.byWarehouse.map((w) => ({
              Type: 'Entrepôt',
              Nom: w.warehouseName,
              Quantité: w.totalQuantity,
              'Valeur coût': w.totalCost,
              'Valeur vente': w.totalRetail,
            })),
            ...stockValue.byCategory.map((c) => ({
              Type: 'Catégorie',
              Nom: c.categoryName,
              Quantité: c.totalQuantity,
              'Valeur coût': c.totalCost,
              'Valeur vente': c.totalRetail,
            })),
          ]
          filename = 'rapport-valeur-stock'
        }
        break
      case 'turnover':
        if (turnover) {
          data = turnover.products.map((p) => ({
            Produit: p.productName,
            SKU: p.sku,
            Stock: p.currentStock,
            Ventes: p.salesQty,
            'Taux rotation': p.turnoverRate,
            'Jours stock': p.daysOfInventory,
            Statut: p.status,
          }))
          filename = 'rapport-rotation-stock'
        }
        break
      case 'obsolete':
        if (obsolete) {
          data = obsolete.products.map((p) => ({
            Produit: p.productName,
            SKU: p.sku,
            Entrepôt: p.warehouseName,
            Quantité: p.quantity,
            Valeur: p.stockValue,
            'Dernière vente': p.lastSaleDate
              ? new Date(p.lastSaleDate).toLocaleDateString('fr-FR')
              : 'Jamais',
            'Jours sans vente': p.daysSinceLastSale || 'N/A',
          }))
          filename = 'rapport-produits-obsoletes'
        }
        break
      case 'abc':
        if (abc) {
          data = abc.products.map((p) => ({
            Produit: p.productName,
            SKU: p.sku,
            CA: p.revenue,
            '% CA': p.revenuePercent,
            '% cumulé': p.cumulativePercent,
            Catégorie: p.category,
          }))
          filename = 'rapport-analyse-abc'
        }
        break
    }

    if (data.length === 0) return

    // Generate CSV
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!storeId) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Veuillez sélectionner une boutique</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports d'inventaire</h1>
          <p className="text-gray-500">Analysez votre stock pour optimiser vos coûts</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Recommandations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  rec.priority === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : rec.priority === 'high'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{rec.title}</span>
                    <p className="text-sm text-gray-600">{rec.message}</p>
                  </div>
                  {rec.action && (
                    <span className="text-xs text-gray-500">{rec.action}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'value', label: 'Valeur du stock', icon: DollarSign },
              { id: 'turnover', label: 'Rotation', icon: TrendingUp },
              { id: 'obsolete', label: 'Obsolètes', icon: Clock },
              { id: 'abc', label: 'Analyse ABC', icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as typeof activeReport)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeReport === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period selector for relevant reports */}
        {['turnover', 'obsolete', 'abc'].includes(activeReport) && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Période:</span>
              {[30, 60, 90, 180].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    period === days
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {days}j
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Chargement...</div>
          ) : activeReport === 'value' && stockValue ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Stock total</p>
                  <p className="text-2xl font-bold">{stockValue.summary.totalQuantity}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Valeur coût</p>
                  <p className="text-2xl font-bold">{formatPrice(stockValue.summary.totalCost)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Valeur vente</p>
                  <p className="text-2xl font-bold">{formatPrice(stockValue.summary.totalRetail)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Marge potentielle</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stockValue.summary.margin.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* By Warehouse */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Par entrepôt</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Entrepôt</th>
                        <th className="text-right p-2">Quantité</th>
                        <th className="text-right p-2">Valeur coût</th>
                        <th className="text-right p-2">Valeur vente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stockValue.byWarehouse.map((w) => (
                        <tr key={w.warehouseId}>
                          <td className="p-2 font-medium">{w.warehouseName}</td>
                          <td className="p-2 text-right">{w.totalQuantity}</td>
                          <td className="p-2 text-right">{formatPrice(w.totalCost)}</td>
                          <td className="p-2 text-right">{formatPrice(w.totalRetail)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By Category */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Par catégorie</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Catégorie</th>
                        <th className="text-right p-2">Produits</th>
                        <th className="text-right p-2">Quantité</th>
                        <th className="text-right p-2">Valeur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stockValue.byCategory.map((c) => (
                        <tr key={c.categoryId}>
                          <td className="p-2 font-medium">{c.categoryName}</td>
                          <td className="p-2 text-right">{c.productCount}</td>
                          <td className="p-2 text-right">{c.totalQuantity}</td>
                          <td className="p-2 text-right">{formatPrice(c.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeReport === 'turnover' && turnover ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Rotation moyenne</p>
                  <p className="text-2xl font-bold">{turnover.summary.avgTurnover}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Rapide</p>
                  <p className="text-2xl font-bold text-green-700">{turnover.summary.fastMoving}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Normal</p>
                  <p className="text-2xl font-bold text-blue-700">{turnover.summary.normalMoving}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">Lent</p>
                  <p className="text-2xl font-bold text-yellow-700">{turnover.summary.slowMoving}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Sans vente</p>
                  <p className="text-2xl font-bold text-red-700">{turnover.summary.deadStock}</p>
                </div>
              </div>

              {/* Products table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Produit</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-right p-2">Ventes</th>
                      <th className="text-right p-2">Rotation</th>
                      <th className="text-right p-2">Jours stock</th>
                      <th className="text-center p-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {turnover.products.slice(0, 50).map((p) => (
                      <tr key={p.productId}>
                        <td className="p-2">
                          <div className="font-medium">{p.productName}</div>
                          {p.sku && <div className="text-xs text-gray-500">{p.sku}</div>}
                        </td>
                        <td className="p-2 text-right">{p.currentStock}</td>
                        <td className="p-2 text-right">{p.salesQty}</td>
                        <td className="p-2 text-right font-medium">{p.turnoverRate}</td>
                        <td className="p-2 text-right">{p.daysOfInventory ?? '∞'}</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              p.status === 'fast'
                                ? 'bg-green-100 text-green-800'
                                : p.status === 'normal'
                                ? 'bg-blue-100 text-blue-800'
                                : p.status === 'slow'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeReport === 'obsolete' && obsolete ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Produits obsolètes</p>
                  <p className="text-2xl font-bold">{obsolete.summary.productCount}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Quantité totale</p>
                  <p className="text-2xl font-bold">{obsolete.summary.totalQuantity}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Valeur immobilisée</p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatPrice(obsolete.summary.totalValue)}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {obsolete.recommendations.length > 0 && (
                <div className="space-y-2">
                  {obsolete.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm text-yellow-800">{rec.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Produit</th>
                      <th className="text-left p-2">Entrepôt</th>
                      <th className="text-right p-2">Quantité</th>
                      <th className="text-right p-2">Valeur</th>
                      <th className="text-right p-2">Jours sans vente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {obsolete.products.map((p, i) => (
                      <tr key={i}>
                        <td className="p-2">
                          <div className="font-medium">{p.productName}</div>
                          {p.sku && <div className="text-xs text-gray-500">{p.sku}</div>}
                        </td>
                        <td className="p-2">{p.warehouseName}</td>
                        <td className="p-2 text-right">{p.quantity}</td>
                        <td className="p-2 text-right">{formatPrice(p.stockValue)}</td>
                        <td className="p-2 text-right text-red-600">
                          {p.daysSinceLastSale ?? 'Jamais vendu'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeReport === 'abc' && abc ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Catégorie A</p>
                      <p className="text-2xl font-bold text-green-700">{abc.summary.aCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">~80% CA</p>
                      <p className="font-medium">{formatPrice(abc.summary.aRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Catégorie B</p>
                      <p className="text-2xl font-bold text-blue-700">{abc.summary.bCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">~15% CA</p>
                      <p className="font-medium">{formatPrice(abc.summary.bRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Catégorie C</p>
                      <p className="text-2xl font-bold text-gray-700">{abc.summary.cCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">~5% CA</p>
                      <p className="font-medium">{formatPrice(abc.summary.cRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {abc.recommendations && abc.recommendations.length > 0 && (
                <div className="space-y-2">
                  {abc.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm text-blue-800">{rec.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Produit</th>
                      <th className="text-right p-2">CA</th>
                      <th className="text-right p-2">% CA</th>
                      <th className="text-right p-2">% cumulé</th>
                      <th className="text-center p-2">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {abc.products.slice(0, 50).map((p) => (
                      <tr key={p.productId}>
                        <td className="p-2">
                          <div className="font-medium">{p.productName}</div>
                          {p.sku && <div className="text-xs text-gray-500">{p.sku}</div>}
                        </td>
                        <td className="p-2 text-right">{formatPrice(p.revenue)}</td>
                        <td className="p-2 text-right">{p.revenuePercent}%</td>
                        <td className="p-2 text-right">{p.cumulativePercent}%</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              p.category === 'A'
                                ? 'bg-green-100 text-green-800'
                                : p.category === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {p.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Sélectionnez un rapport</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
