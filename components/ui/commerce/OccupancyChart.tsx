'use client'

import { cn } from '@/lib/utils'

interface OccupancyData {
  label: string
  value: number
  maxValue: number
  color?: string
}

interface OccupancyChartProps {
  data: OccupancyData[]
  title?: string
  showPercentage?: boolean
  showValues?: boolean
  variant?: 'bar' | 'horizontal' | 'circle'
  height?: number
  className?: string
}

export function OccupancyChart({
  data,
  title,
  showPercentage = true,
  showValues = false,
  variant = 'bar',
  height = 120,
  className,
}: OccupancyChartProps) {
  const maxVal = Math.max(...data.map(d => d.maxValue))

  if (variant === 'circle') {
    const item = data[0]
    if (!item) return null

    const percentage = Math.round((item.value / item.maxValue) * 100)
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={cn('text-center', className)}>
        {title && <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>}
        <div className="relative inline-flex items-center justify-center">
          <svg className="transform -rotate-90" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke={item.color || '#3b82f6'}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{percentage}%</span>
            {showValues && (
              <span className="text-xs text-gray-500">
                {item.value}/{item.maxValue}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{item.label}</p>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('space-y-3', className)}>
        {title && <h4 className="text-sm font-medium text-gray-700">{title}</h4>}
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / item.maxValue) * 100)
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">
                  {showPercentage && `${percentage}%`}
                  {showValues && showPercentage && ' '}
                  {showValues && `(${item.value}/${item.maxValue})`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#3b82f6',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Bar chart (default)
  return (
    <div className={cn('', className)}>
      {title && <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / item.maxValue) * 100)
          const barHeight = (item.value / maxVal) * 100

          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full relative flex flex-col items-center" style={{ height: height - 24 }}>
                {showPercentage && (
                  <span className="text-xs font-medium text-gray-700 mb-1">
                    {percentage}%
                  </span>
                )}
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: item.color || '#3b82f6',
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
