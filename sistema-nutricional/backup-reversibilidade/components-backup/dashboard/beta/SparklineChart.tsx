'use client'

interface SparklineChartProps {
  data: number[]
  className?: string
  color?: string
  height?: number
}

export function SparklineChart({ 
  data, 
  className = '', 
  color = 'currentColor',
  height = 20 
}: SparklineChartProps) {
  if (!data || data.length < 2) {
    return <div className={`w-16 h-5 bg-muted/20 rounded ${className}`} />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  // Gerar pontos do SVG
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = ((max - value) / range) * 100
    return `${x},${y}`
  }).join(' ')

  // Criar área preenchida
  const areaPoints = `0,100 ${points} 100,100`

  return (
    <div className={`w-16 h-5 ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Área preenchida com gradiente */}
        <defs>
          <linearGradient id={`gradient-${Math.random()}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        
        <polygon
          points={areaPoints}
          fill={`url(#gradient-${Math.random()})`}
          className="opacity-50"
        />
        
        {/* Linha principal */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
        
        {/* Ponto final destacado */}
        {data.length > 0 && (
          <circle
            cx={(data.length - 1) / (data.length - 1) * 100}
            cy={((max - data[data.length - 1]) / range) * 100}
            r="1.5"
            fill={color}
            className="drop-shadow-sm"
          />
        )}
      </svg>
    </div>
  )
}