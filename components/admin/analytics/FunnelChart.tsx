'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface FunnelStage {
  stage: string
  count: number
  conversionRate: number
}

interface FunnelChartProps {
  data: FunnelStage[]
  height?: number
}

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF']

export function FunnelChart({ data, height = 300 }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
        <XAxis
          type="number"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          dataKey="stage"
          type="category"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number, name: string, props: any) => {
            const rate = props.payload.conversionRate
            return [
              <span key="value">
                {value.toLocaleString()} ({rate.toFixed(1)}%)
              </span>,
              'Visiteurs',
            ]
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
