'use client'

import { formatPrice } from '@/lib/utils'

interface ProductStats {
  productId: string
  name: string
  revenue: number
  quantity: number
  views: number
}

interface TopProductsTableProps {
  products: ProductStats[]
  sortBy: 'revenue' | 'quantity' | 'views'
}

export function TopProductsTable({ products, sortBy }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
            <th className={`text-right py-3 px-4 text-sm font-semibold ${sortBy === 'revenue' ? 'text-primary-600' : 'text-gray-700'}`}>
              Revenu
            </th>
            <th className={`text-right py-3 px-4 text-sm font-semibold ${sortBy === 'quantity' ? 'text-primary-600' : 'text-gray-700'}`}>
              Vendus
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                {product.name}
              </td>
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
  )
}
