/**
 * Simple Line Chart Component - SVG-based
 */

interface DataPoint {
  date: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  label?: string
}

export function LineChart({
  data,
  width = 600,
  height = 200,
  color = '#6366f1',
  label = 'Value',
}: LineChartProps) {
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

  // Find min and max values
  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue || 1

  // Generate points
  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * chartWidth
      const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  // Generate area path (filled area under line)
  const areaPoints =
    points +
    ` ${padding + chartWidth},${padding + chartHeight} ${padding},${padding + chartHeight}`

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
                {((minValue + range * ratio) / 100).toFixed(0)}€
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill={color} fillOpacity="0.1" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1 || 1)) * chartWidth
          const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={color}>
              <title>
                {d.date}: {(d.value / 100).toFixed(2)}€
              </title>
            </circle>
          )
        })}

        {/* X-axis labels */}
        {data
          .filter((_, i) => i % Math.ceil(data.length / 7) === 0)
          .map((d, i) => {
            const dataIndex = data.indexOf(d)
            const x = padding + (dataIndex / (data.length - 1 || 1)) * chartWidth
            const dateLabel = new Date(d.date).toLocaleDateString('fr-FR', {
              month: 'short',
              day: 'numeric',
            })
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                fontSize="10"
                fill="#9ca3af"
                textAnchor="middle"
              >
                {dateLabel}
              </text>
            )
          })}
      </svg>
    </div>
  )
}
