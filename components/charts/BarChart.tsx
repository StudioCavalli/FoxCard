/**
 * Simple Bar Chart Component - SVG-based
 */

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  defaultColor?: string
}

export function BarChart({
  data,
  width = 600,
  height = 200,
  defaultColor = '#6366f1',
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-gray-500">Aucune donnée</p>
      </div>
    )
  }

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Find max value
  const maxValue = Math.max(...data.map((d) => d.value))

  // Calculate bar width
  const barWidth = chartWidth / data.length
  const barSpacing = barWidth * 0.2
  const actualBarWidth = barWidth - barSpacing

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight * (1 - ratio)
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text x={5} y={y + 4} fontSize="10" fill="#9ca3af">
                {((maxValue * ratio) / 100).toFixed(0)}€
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding + i * barWidth + barSpacing / 2
          const barHeight = (d.value / maxValue) * chartHeight
          const y = padding + chartHeight - barHeight

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={actualBarWidth}
                height={barHeight}
                fill={d.color || defaultColor}
                rx="4"
              >
                <title>
                  {d.label}: {(d.value / 100).toFixed(2)}€
                </title>
              </rect>

              {/* Value label on top */}
              <text
                x={x + actualBarWidth / 2}
                y={y - 5}
                fontSize="10"
                fill="#374151"
                textAnchor="middle"
                fontWeight="600"
              >
                {(d.value / 100).toFixed(0)}€
              </text>

              {/* X-axis label */}
              <text
                x={x + actualBarWidth / 2}
                y={height - 15}
                fontSize="10"
                fill="#9ca3af"
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
