'use client'

import { useState } from 'react'
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
  Zap
} from 'lucide-react'

// Componentes beta
import { SparklineChart } from './SparklineChart'
import { GoalProgress } from './GoalProgress'
import { PeriodFilter, type PeriodOption } from './PeriodFilter'
import { InsightsPanel } from './InsightsPanel'

export function NutritionistDashboardBeta() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('thisMonth')

  // Dados mock para sparklines
  const revenueData = [6800, 7200, 7500, 8100, 7900, 8450]
  const patientsData = [10, 11, 12, 11, 12, 12]
  const consultationsData = [3, 5, 4, 6, 5, 5]
  const recipesData = [20, 22, 24, 26, 27, 28]

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Dashboard
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Zap className="w-3 h-3 mr-1" />
              Beta
            </Badge>
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
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-green-600">+2 este mês</p>
                </div>
              </div>
              <SparklineChart 
                data={patientsData} 
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
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-blue-600">Média: 4.2/dia</p>
                </div>
              </div>
              <SparklineChart 
                data={consultationsData} 
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
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-xs text-purple-600">+8% vs mês anterior</p>
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
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-xs text-orange-600">+6 esta semana</p>
                </div>
              </div>
              <SparklineChart 
                data={recipesData} 
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
          <Button variant="outline" size="sm">
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
                    <p className="text-2xl font-bold">R$ 8.450</p>
                    <p className="text-xs text-green-600">+12% vs mês anterior</p>
                  </div>
                </div>
                <SparklineChart 
                  data={revenueData} 
                  color="#10b981"
                  className="ml-2"
                />
              </div>
              
              <GoalProgress 
                title="Meta Mensal"
                current={8450}
                target={10000}
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
                  <p className="text-2xl font-bold">R$ 1.200</p>
                  <p className="text-xs text-orange-600">3 consultas</p>
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
                  <p className="text-2xl font-bold">R$ 180</p>
                  <p className="text-xs text-purple-600">Por consulta</p>
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
                  <p className="text-2xl font-bold">8.5%</p>
                  <p className="text-xs text-green-600">-2% vs mês anterior</p>
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
          <InsightsPanel />
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription>
              Tarefas sugeridas baseadas em IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => console.log('Enviar lembretes')}
            >
              <Users className="w-4 h-4 mr-2" />
              Enviar lembretes para 3 pacientes
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => console.log('Otimizar agenda')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Otimizar agenda da próxima semana
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => console.log('Gerar relatório')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Gerar relatório mensal
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => console.log('Campanhas')}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Criar campanha para horários vazios
            </Button>
          </CardContent>
        </Card>
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
              <p className="text-2xl font-bold text-green-600">23</p>
              <p className="text-sm text-green-700 font-medium">Consultas Realizadas</p>
              <p className="text-xs text-green-600 mt-1">+15% vs semana anterior</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">8</p>
              <p className="text-sm text-blue-700 font-medium">Dietas Criadas</p>
              <p className="text-xs text-blue-600 mt-1">+33% vs semana anterior</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">92%</p>
              <p className="text-sm text-purple-700 font-medium">Taxa de Adesão</p>
              <p className="text-xs text-purple-600 mt-1">+8% vs semana anterior</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-sm text-orange-700 font-medium">Novos Pacientes</p>
              <p className="text-xs text-orange-600 mt-1">+25% vs semana anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}