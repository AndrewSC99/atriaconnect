'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'

interface GoalProgressProps {
  title: string
  current: number
  target: number
  format?: 'currency' | 'number' | 'percentage'
  period?: string
  className?: string
}

export function GoalProgress({ 
  title, 
  current, 
  target, 
  format = 'currency',
  period = 'mensal',
  className = '' 
}: GoalProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const remaining = Math.max(target - current, 0)
  const isCompleted = current >= target
  const isOverAchieved = current > target

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR')}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500'
    if (percentage > 75) return 'bg-blue-500'
    if (percentage > 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusBadge = () => {
    if (isOverAchieved) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Meta superada!
        </Badge>
      )
    }
    
    if (isCompleted) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Target className="w-3 h-3 mr-1" />
          Meta atingida!
        </Badge>
      )
    }

    if (percentage > 75) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Quase lá!
        </Badge>
      )
    }

    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <TrendingDown className="w-3 h-3 mr-1" />
        Precisa de foco
      </Badge>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">Meta {period}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{formatValue(current)}</span>
          <span className="text-muted-foreground">de {formatValue(target)}</span>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-2"
          // Usar classe CSS customizada para cor
          style={{
            '--progress-background': 
              isCompleted ? '#10b981' : 
              percentage > 75 ? '#3b82f6' : 
              percentage > 50 ? '#eab308' : '#ef4444'
          } as React.CSSProperties}
        />

        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            {percentage.toFixed(1)}% atingido
          </span>
          {!isCompleted && (
            <span className="font-medium text-foreground">
              Faltam {formatValue(remaining)}
            </span>
          )}
          {isOverAchieved && (
            <span className="font-medium text-green-600">
              +{formatValue(current - target)} acima da meta
            </span>
          )}
        </div>
      </div>
    </div>
  )
}