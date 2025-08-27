'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  CreditCard,
  TrendingDown,
  Calculator,
  Target,
  Zap,
  Settings
} from 'lucide-react'

// Componentes do dashboard
import { SparklineChart } from './beta/SparklineChart'
import { GoalProgress } from './beta/GoalProgress'
import { PeriodFilter, type PeriodOption } from './beta/PeriodFilter'
import { InsightsPanel } from './beta/InsightsPanel'
import { GoalsConfigModal } from './beta/GoalsConfigModal'
import { QuickActionsCard } from './QuickActionsCard'

interface DashboardData {
  activePatients: {
    current: number
    change: string
    isPositive: boolean
    sparklineData: number[]
  }
  consultationsToday: {
    current: number
    change: string
    isPositive: boolean
    sparklineData: number[]
  }
  averageProgress: {
    current: number
    change: string
    isPositive: boolean
    sparklineData: number[]
  }
  recipesCreated: {
    current: number
    change: string
    isPositive: boolean
    sparklineData: number[]
  }
  financial: {
    monthlyRevenue: {
      current: number
      change: string
      isPositive: boolean
      sparklineData: number[]
      goal: number
    }
    pendingPayments: {
      current: number
      count: number
      description: string
    }
    averageTicket: {
      current: number
      description: string
    }
    defaultRate: {
      current: number
      change: string
      isPositive: boolean
    }
  }
  weekSummary: {
    consultationsCompleted: {
      current: number
      change: string
      isPositive: boolean
    }
    dietsCreated: {
      current: number
      change: string
      isPositive: boolean
    }
    adherenceRate: {
      current: number
      change: string
      isPositive: boolean
    }
    newPatients: {
      current: number
      change: string
      isPositive: boolean
    }
  }
}

interface Insight {
  id: string
  type: 'success' | 'warning' | 'tip' | 'info'
  title: string
  description: string
  metric?: {
    value: string
    change: string
    isPositive: boolean
  }
  action?: {
    label: string
    endpoint: string
  }
  priority: 'high' | 'medium' | 'low' | 'urgent'
  category: string
}

export function NutritionistDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('thisMonth')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard/metrics?period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const text = await response.text()
      if (!text) {
        throw new Error('Empty response')
      }
      const result = JSON.parse(text)
      if (result.success) {
        setDashboardData(result.data)
      } else {
        throw new Error(result.error || 'API returned success: false')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      // Fallback com dados mock em caso de erro
      setDashboardData({
        activePatients: {
          current: 12,
          change: '+2 este mês',
          isPositive: true,
          sparklineData: [10, 11, 12, 11, 12, 12]
        },
        consultationsToday: {
          current: 5,
          change: 'Média: 4.2/dia',
          isPositive: true,
          sparklineData: [3, 5, 4, 6, 5, 5]
        },
        averageProgress: {
          current: 85,
          change: '+8% vs mês anterior',
          isPositive: true,
          sparklineData: [78, 80, 82, 84, 83, 85]
        },
        recipesCreated: {
          current: 28,
          change: '+6 esta semana',
          isPositive: true,
          sparklineData: [20, 22, 24, 26, 27, 28]
        },
        financial: {
          monthlyRevenue: {
            current: 8450,
            change: '+12%',
            isPositive: true,
            sparklineData: [6800, 7200, 7500, 8100, 7900, 8450],
            goal: 10000
          },
          pendingPayments: {
            current: 1200,
            count: 3,
            description: '3 consultas'
          },
          averageTicket: {
            current: 180,
            description: 'Por consulta'
          },
          defaultRate: {
            current: 8.5,
            change: '-2%',
            isPositive: true
          }
        },
        weekSummary: {
          consultationsCompleted: {
            current: 23,
            change: '+15%',
            isPositive: true
          },
          dietsCreated: {
            current: 8,
            change: '+33%',
            isPositive: true
          },
          adherenceRate: {
            current: 92,
            change: '+8%',
            isPositive: true
          },
          newPatients: {
            current: 5,
            change: '+25%',
            isPositive: true
          }
        }
      })
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/dashboard/insights')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const text = await response.text()
      if (!text) {
        throw new Error('Empty response')
      }
      const result = JSON.parse(text)
      if (result.success) {
        setInsights(result.data.insights)
      } else {
        throw new Error(result.error || 'API returned success: false')
      }
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
      // Fallback com insights mock
      setInsights([
        {
          id: '1',
          type: 'success',
          title: 'Receita cresceu 12% este mês',
          description: 'O aumento foi principalmente devido ao aumento de consultas às terças-feiras (+40%)',
          metric: {
            value: 'R$ 8.450',
            change: '+12%',
            isPositive: true
          },
          action: {
            label: 'Ver detalhes',
            endpoint: '/api/dashboard/revenue-details'
          },
          priority: 'high',
          category: 'financial'
        },
        {
          id: '2',
          type: 'warning',
          title: '3 pacientes em risco de abandono',
          description: 'Roberto, Laura e Fernanda não comparecem há mais de 30 dias',
          action: {
            label: 'Entrar em contato',
            endpoint: '/api/patients/contact-inactive'
          },
          priority: 'urgent',
          category: 'retention'
        }
      ])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchDashboardData(), fetchInsights()])
      setLoading(false)
    }
    
    loadData()
  }, [selectedPeriod])

  const handleConfigureGoals = () => {
    setIsGoalsModalOpen(true)
  }

  const handleSaveGoals = (goals: any[]) => {
    console.log('Metas salvas:', goals)
    localStorage.setItem('nutritionist-goals', JSON.stringify(goals))
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Erro ao carregar dados do dashboard.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão inteligente da sua prática nutricional
          </p>
        </div>
        
        <PeriodFilter 
          selected={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Quick Stats com Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                  <p className="text-2xl font-bold">{dashboardData.activePatients.current}</p>
                  <p className={`text-xs ${dashboardData.activePatients.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardData.activePatients.change}
                  </p>
                </div>
              </div>
              <SparklineChart 
                data={dashboardData.activePatients.sparklineData} 
                color="#3b82f6"
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                  <p className="text-2xl font-bold">{dashboardData.consultationsToday.current}</p>
                  <p className={`text-xs ${dashboardData.consultationsToday.isPositive ? 'text-blue-600' : 'text-red-600'}`}>
                    {dashboardData.consultationsToday.change}
                  </p>
                </div>
              </div>
              <SparklineChart 
                data={dashboardData.consultationsToday.sparklineData} 
                color="#10b981"
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Média de Progresso</p>
                  <p className="text-2xl font-bold">{dashboardData.averageProgress.current}%</p>
                  <p className={`text-xs ${dashboardData.averageProgress.isPositive ? 'text-purple-600' : 'text-red-600'}`}>
                    {dashboardData.averageProgress.change}
                  </p>
                </div>
              </div>
              <div className="ml-2">
                <div className="w-16 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-end pr-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Receitas Criadas</p>
                  <p className="text-2xl font-bold">{dashboardData.recipesCreated.current}</p>
                  <p className={`text-xs ${dashboardData.recipesCreated.isPositive ? 'text-orange-600' : 'text-red-600'}`}>
                    {dashboardData.recipesCreated.change}
                  </p>
                </div>
              </div>
              <SparklineChart 
                data={dashboardData.recipesCreated.sparklineData} 
                color="#ea580c"
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financeiras com Metas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Resumo Financeiro</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleConfigureGoals}
          >
            <Target className="w-4 h-4 mr-2" />
            Configurar Metas
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Mensal</p>
                    <p className="text-2xl font-bold">R$ {dashboardData.financial.monthlyRevenue.current.toLocaleString()}</p>
                    <p className={`text-xs ${dashboardData.financial.monthlyRevenue.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.financial.monthlyRevenue.change} vs mês anterior
                    </p>
                  </div>
                </div>
                <SparklineChart 
                  data={dashboardData.financial.monthlyRevenue.sparklineData} 
                  color="#10b981"
                  className="ml-2"
                />
              </div>
              
              <GoalProgress 
                title="Meta Mensal"
                current={dashboardData.financial.monthlyRevenue.current}
                target={dashboardData.financial.monthlyRevenue.goal}
                format="currency"
                className="mt-3 pt-3 border-t"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold">R$ {dashboardData.financial.pendingPayments.current.toLocaleString()}</p>
                  <p className="text-xs text-orange-600">{dashboardData.financial.pendingPayments.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold">R$ {dashboardData.financial.averageTicket.current}</p>
                  <p className="text-xs text-purple-600">{dashboardData.financial.averageTicket.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Inadimplência</p>
                  <p className="text-2xl font-bold">{dashboardData.financial.defaultRate.current}%</p>
                  <p className={`text-xs ${dashboardData.financial.defaultRate.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardData.financial.defaultRate.change} vs mês anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid principal com Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Panel - destaque */}
        <div className="lg:col-span-1">
          <InsightsPanel insights={insights} />
        </div>

        {/* Agenda de Hoje - melhorada */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agenda de Hoje</span>
              </div>
              <Badge variant="outline">5 consultas</Badge>
            </CardTitle>
            <CardDescription>
              Suas consultas programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="font-medium">João Silva</p>
                <p className="text-sm text-muted-foreground">09:00 - Consulta de acompanhamento</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div>
                <p className="font-medium">Maria Santos</p>
                <p className="text-sm text-muted-foreground">11:00 - Primeira consulta</p>
              </div>
              <Badge className="bg-blue-600">Próxima</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Pedro Costa</p>
                <p className="text-sm text-muted-foreground">14:00 - Avaliação nutricional</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <QuickActionsCard />
      </div>

      {/* Métricas Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Semana</CardTitle>
          <CardDescription>
            Atividades e resultados dos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{dashboardData.weekSummary.consultationsCompleted.current}</p>
              <p className="text-sm text-green-700 font-medium">Consultas Realizadas</p>
              <p className={`text-xs mt-1 ${dashboardData.weekSummary.consultationsCompleted.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.weekSummary.consultationsCompleted.change} vs semana anterior
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.weekSummary.dietsCreated.current}</p>
              <p className="text-sm text-blue-700 font-medium">Dietas Criadas</p>
              <p className={`text-xs mt-1 ${dashboardData.weekSummary.dietsCreated.isPositive ? 'text-blue-600' : 'text-red-600'}`}>
                {dashboardData.weekSummary.dietsCreated.change} vs semana anterior
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{dashboardData.weekSummary.adherenceRate.current}%</p>
              <p className="text-sm text-purple-700 font-medium">Taxa de Adesão</p>
              <p className={`text-xs mt-1 ${dashboardData.weekSummary.adherenceRate.isPositive ? 'text-purple-600' : 'text-red-600'}`}>
                {dashboardData.weekSummary.adherenceRate.change} vs semana anterior
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">{dashboardData.weekSummary.newPatients.current}</p>
              <p className="text-sm text-orange-700 font-medium">Novos Pacientes</p>
              <p className={`text-xs mt-1 ${dashboardData.weekSummary.newPatients.isPositive ? 'text-orange-600' : 'text-red-600'}`}>
                {dashboardData.weekSummary.newPatients.change} vs semana anterior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Configuração de Metas */}
      <GoalsConfigModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        onSave={handleSaveGoals}
      />
    </div>
  )
}