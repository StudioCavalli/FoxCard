'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
  averageOrderValue: number
}

interface SalesChartProps {
  data: SalesDataPoint[]
  showOrders?: boolean
  height?: number
}

export function SalesChart({ data, showOrders = true, height = 300 }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => formatPrice(value)}
        />
        {showOrders && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'revenue' || name === 'averageOrderValue') {
              return [formatPrice(value), name === 'revenue' ? 'Revenu' : 'Panier moyen']
            }
            return [value, 'Commandes']
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === 'revenue') return 'Revenu'
            if (value === 'orders') return 'Commandes'
            if (value === 'averageOrderValue') return 'Panier moyen'
            return value
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
        {showOrders && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
