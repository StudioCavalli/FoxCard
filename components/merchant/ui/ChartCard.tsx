'use client'

import { ReactNode, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { MerchantCard, MerchantCardHeader } from './MerchantCard'
import { LucideIcon } from 'lucide-react'

interface ChartCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  icon,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <MerchantCard className={cn('', className)}>
      <MerchantCardHeader
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
      <div className="mt-4">{children}</div>
    </MerchantCard>
  )
}

interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  horizontal?: boolean
  className?: string
}

export function SimpleBarChart({
  data,
  height = 200,
  showValues = true,
  horizontal = false,
  className,
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  if (horizontal) {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{item.label}</span>
              {showValues && (
                <span className="text-white font-medium">
                  {item.value.toLocaleString()}
                </span>
              )}
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#6366f1',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-end gap-2', className)} style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex justify-center">
            <div
              className="w-full max-w-[40px] rounded-t-md transition-all duration-500"
              style={{
                height: `${(item.value / maxValue) * (height - 40)}px`,
                backgroundColor: item.color || '#6366f1',
              }}
            />
          </div>
          <span className="text-xs text-slate-400 truncate w-full text-center">
            {item.label}
          </span>
          {showValues && (
            <span className="text-xs text-white font-medium">
              {item.value.toLocaleString()}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

interface SimpleLineChartProps {
  data: { label: string; value: number }[]
  height?: number
  color?: string
  showGrid?: boolean
  showLabels?: boolean
  className?: string
}

export function SimpleLineChart({
  data,
  height = 200,
  color = '#6366f1',
  showGrid = true,
  showLabels = true,
  className,
}: SimpleLineChartProps) {
  const { pathD, areaD, points, gridLines } = useMemo(() => {
    if (!data.length) return { pathD: '', areaD: '', points: [], gridLines: [] }

    const max = Math.max(...data.map((d) => d.value))
    const min = Math.min(...data.map((d) => d.value))
    const range = max - min || 1

    const width = 100
    const chartHeight = 100
    const padding = { top: 10, bottom: 20, left: 5, right: 5 }

    const pts = data.map((item, index) => {
      const x =
        padding.left +
        (index / (data.length - 1)) * (width - padding.left - padding.right)
      const y =
        padding.top +
        (1 - (item.value - min) / range) * (chartHeight - padding.top - padding.bottom)
      return { x, y, value: item.value, label: item.label }
    })

    const pathPoints = pts.map((p) => `${p.x},${p.y}`).join(' L ')
    const path = `M ${pathPoints}`
    const area = `${path} L ${pts[pts.length - 1].x},${chartHeight - padding.bottom} L ${padding.left},${chartHeight - padding.bottom} Z`

    const grid = [0.25, 0.5, 0.75].map((ratio) => ({
      y: padding.top + ratio * (chartHeight - padding.top - padding.bottom),
      value: max - ratio * range,
    }))

    return { pathD: path, areaD: area, points: pts, gridLines: grid }
  }, [data])

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid &&
          gridLines.map((line, i) => (
            <line
              key={i}
              x1="5"
              y1={line.y}
              x2="95"
              y2={line.y}
              stroke="#334155"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

        <path d={areaD} fill="url(#line-gradient)" />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#1e293b"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {showLabels && (
        <div className="flex justify-between mt-2 px-1">
          {data
            .filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2))
            .map((item, i) => (
              <span key={i} className="text-xs text-slate-500">
                {item.label}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  showLegend?: boolean
  className?: string
}

export function DonutChart({
  data,
  size = 120,
  thickness = 20,
  showLegend = true,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total
            const strokeLength = percentage * circumference
            const offset = currentOffset
            currentOffset += strokeLength

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{total.toLocaleString()}</span>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className="text-sm text-white font-medium ml-auto">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
