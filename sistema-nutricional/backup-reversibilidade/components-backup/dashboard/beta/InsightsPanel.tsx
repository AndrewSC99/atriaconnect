'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

interface InsightAction {
  label: string
  endpoint: string
}

interface InsightMetric {
  value: string
  change: string
  isPositive: boolean
}

interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'tip'
  title: string
  description: string
  action?: InsightAction
  metric?: InsightMetric
  priority: 'high' | 'medium' | 'low' | 'urgent'
  category: string
}

interface InsightsPanelProps {
  insights?: Insight[]
}

const getInsightIcon = (type: Insight['type'], category: string) => {
  if (category === 'financial') return <DollarSign className="h-4 w-4" />
  if (category === 'retention') return <Users className="h-4 w-4" />
  if (category === 'optimization') return <Calendar className="h-4 w-4" />
  if (category === 'productivity') return <Clock className="h-4 w-4" />
  if (category === 'adherence') return <CheckCircle className="h-4 w-4" />

  switch (type) {
    case 'success':
      return <TrendingUp className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'tip':
      return <Lightbulb className="h-4 w-4" />
    case 'info':
      return <Clock className="h-4 w-4" />
    default:
      return <Brain className="h-4 w-4" />
  }
}

export function InsightsPanel({ insights = [] }: InsightsPanelProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50/50'
      case 'warning':
        return 'border-amber-200 bg-amber-50/50'
      case 'info':
        return 'border-blue-200 bg-blue-50/50'
      case 'tip':
        return 'border-purple-200 bg-purple-50/50'
      default:
        return 'border-zinc-200 bg-zinc-50/50'
    }
  }

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-amber-600'
      case 'info':
        return 'text-blue-600'
      case 'tip':
        return 'text-purple-600'
      default:
        return 'text-zinc-600'
    }
  }

  const getBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'warning':
        return 'destructive'
      case 'info':
        return 'secondary'
      case 'tip':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>Insights Inteligentes</span>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${getInsightStyles(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-white shadow-sm ${getIconColor(insight.type)}`}>
                {getInsightIcon(insight.type, insight.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-foreground">
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <div className="text-right">
                      <p className="font-semibold text-sm">{insight.metric.value}</p>
                      <p className={`text-xs ${
                        insight.metric.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.metric.change}
                      </p>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {insight.description}
                </p>
                
                {insight.action && (
                  <Button
                    onClick={() => {
                      console.log(`Ação para insight ${insight.id}: ${insight.action?.endpoint}`)
                      // TODO: Implementar navegação ou ação baseada no endpoint
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs"
                  >
                    {insight.action.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Resumo de insights */}
        <div className="pt-3 border-t border-zinc-200">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <CheckCircle className="w-3 h-3 inline mr-1" />
              {insights.length} insights gerados hoje
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Ver todos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}