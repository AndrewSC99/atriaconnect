import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  previousValue?: string | number
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  className,
  variant = 'default',
  previousValue
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-rose-600 dark:text-rose-400" />
      case 'stable':
        return <Minus className="h-3 w-3 text-zinc-500" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'down':
        return 'text-rose-600 dark:text-rose-400'
      case 'stable':
        return 'text-zinc-500'
      default:
        return 'text-zinc-500'
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50",
        className
      )}>
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />}
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {value}{unit}
          </span>
          {trend && (
            <div className="flex items-center">
              {getTrendIcon()}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(
        "p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm",
        className
      )}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {Icon && (
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
            )}
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
          </div>
          {trend && (
            <Badge variant="outline" className="flex items-center space-x-1">
              {getTrendIcon()}
              {trendValue && <span className={cn("text-xs", getTrendColor())}>{trendValue}</span>}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {value}{unit && <span className="text-lg text-zinc-500">{unit}</span>}
          </div>
          {previousValue && (
            <div className="text-xs text-zinc-500">
              Anterior: {previousValue}{unit}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      "text-center p-3 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70",
      className
    )}>
      <div className="flex items-center justify-center space-x-1 mb-1">
        {Icon && <Icon className="h-3 w-3 text-zinc-500" />}
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        {trend && getTrendIcon()}
      </div>
      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {value}{unit}
      </div>
      {trendValue && (
        <div className={cn("text-xs", getTrendColor())}>
          {trendValue}
        </div>
      )}
    </div>
  )
}