import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, User, TrendingUp, TrendingDown } from 'lucide-react'

interface TimelineItem {
  id: string
  date: string
  consultationNumber: number
  type: 'primeira' | 'retorno' | 'acompanhamento'
  status: 'completed' | 'scheduled' | 'cancelled'
  weight?: number
  previousWeight?: number
  notes?: string
  isActive?: boolean
}

interface ConsultationTimelineProps {
  items: TimelineItem[]
  className?: string
  orientation?: 'vertical' | 'horizontal'
  compact?: boolean
}

export function ConsultationTimeline({
  items,
  className,
  orientation = 'vertical',
  compact = false
}: ConsultationTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 border-emerald-200'
      case 'scheduled':
        return 'bg-sky-500 border-sky-200'
      case 'cancelled':
        return 'bg-rose-500 border-rose-200'
      default:
        return 'bg-zinc-400 border-zinc-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primeira':
        return 'Primeira Consulta'
      case 'retorno':
        return 'Retorno'
      case 'acompanhamento':
        return 'Acompanhamento'
      default:
        return type
    }
  }

  const getWeightTrend = (current: number, previous?: number) => {
    if (!previous) return null
    const diff = current - previous
    if (Math.abs(diff) < 0.1) return 'stable'
    return diff > 0 ? 'up' : 'down'
  }

  if (orientation === 'horizontal') {
    return (
      <div className={cn("flex items-center space-x-4 overflow-x-auto pb-2", className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-4 min-w-0">
            <div className="flex flex-col items-center space-y-2 min-w-fit">
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold",
                getStatusColor(item.status),
                item.isActive && "ring-2 ring-offset-2 ring-zinc-300 dark:ring-zinc-600"
              )}>
                {item.consultationNumber}
              </div>
              {!compact && (
                <div className="text-center">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {new Date(item.date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(item.type)}
                  </Badge>
                  {item.weight && (
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <span className="text-xs font-medium">{item.weight}kg</span>
                      {(() => {
                        const trend = getWeightTrend(item.weight, item.previousWeight)
                        if (trend === 'up') return <TrendingUp className="h-3 w-3 text-rose-500" />
                        if (trend === 'down') return <TrendingDown className="h-3 w-3 text-emerald-500" />
                        return null
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-8 h-0.5 bg-zinc-300 dark:bg-zinc-600" />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Vertical timeline
  return (
    <div className={cn("relative space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex items-start space-x-4">
          {/* Timeline line */}
          {index < items.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-full bg-zinc-200 dark:bg-zinc-700" />
          )}
          
          {/* Timeline dot */}
          <div className={cn(
            "relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shrink-0",
            getStatusColor(item.status),
            item.isActive && "ring-2 ring-offset-2 ring-zinc-300 dark:ring-zinc-600"
          )}>
            {item.consultationNumber}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Consulta {item.consultationNumber}
              </h4>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(item.type)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-2">
              <CalendarDays className="h-3 w-3" />
              <span>
                {new Date(item.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            {item.weight && (
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Peso: {item.weight}kg
                </span>
                {(() => {
                  const trend = getWeightTrend(item.weight, item.previousWeight)
                  if (trend === 'up') {
                    return (
                      <div className="flex items-center space-x-1 text-rose-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">
                          +{(item.weight - (item.previousWeight || 0)).toFixed(1)}kg
                        </span>
                      </div>
                    )
                  }
                  if (trend === 'down') {
                    return (
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-xs">
                          {(item.weight - (item.previousWeight || 0)).toFixed(1)}kg
                        </span>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )}
            
            {item.notes && !compact && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}