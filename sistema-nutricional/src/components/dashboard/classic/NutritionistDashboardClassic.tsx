'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  TrendingDown,
  Calculator
} from 'lucide-react'

export function NutritionistDashboardClassic() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral da sua prática nutricional
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Hoje, {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Média de Progresso</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Receitas Criadas</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financeiras */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  <p className="text-2xl font-bold">R$ 8.450</p>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Inadimplência</p>
                  <p className="text-2xl font-bold">8.5%</p>
                  <p className="text-xs text-red-600">-2% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Agenda de Hoje</span>
            </CardTitle>
            <CardDescription>
              Suas consultas programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">João Silva</p>
                <p className="text-sm text-muted-foreground">09:00 - Consulta de acompanhamento</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <div>
                <p className="font-medium">Maria Santos</p>
                <p className="text-sm text-muted-foreground">11:00 - Primeira consulta</p>
              </div>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Pedro Costa</p>
                <p className="text-sm text-muted-foreground">14:00 - Avaliação nutricional</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Ana Oliveira</p>
                <p className="text-sm text-muted-foreground">16:00 - Acompanhamento</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Carlos Pereira</p>
                <p className="text-sm text-muted-foreground">17:30 - Consulta de retorno</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Pacientes que Precisam de Atenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Atenção Necessária</span>
            </CardTitle>
            <CardDescription>
              Pacientes que precisam de acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Laura Silva</p>
                <p className="text-sm text-muted-foreground">Não registra refeições há 3 dias</p>
              </div>
              <Badge variant="secondary">Atenção</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Roberto Lima</p>
                <p className="text-sm text-muted-foreground">Meta de peso não atingida</p>
              </div>
              <Badge variant="destructive">Urgente</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium">Fernanda Costa</p>
                <p className="text-sm text-muted-foreground">Consulta em atraso</p>
              </div>
              <Badge variant="secondary">Reagendar</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Ricardo Santos</p>
                <p className="text-sm text-muted-foreground">Solicitou ajuste na dieta</p>
              </div>
              <Badge variant="outline">Revisar</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restante do dashboard... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Pagamentos Pendentes</span>
            </CardTitle>
            <CardDescription>
              Consultas aguardando pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">João Silva</p>
                <p className="text-sm text-muted-foreground">Consulta dia 10/11 - Vencido há 5 dias</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">R$ 200</p>
                <Badge variant="destructive">Vencido</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium">Maria Santos</p>
                <p className="text-sm text-muted-foreground">Consulta dia 12/11 - Vence hoje</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">R$ 180</p>
                <Badge variant="secondary">Vence hoje</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Resumo do Mês</span>
            </CardTitle>
            <CardDescription>
              Movimentação financeira de novembro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Receita Total</span>
              <span className="text-lg font-bold text-green-600">R$ 8.450</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Recebido</span>
              <span className="text-lg font-bold text-blue-600">R$ 7.250</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas da Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Semana</CardTitle>
          <CardDescription>
            Atividades e resultados dos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">23</p>
              <p className="text-sm text-muted-foreground">Consultas Realizadas</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">8</p>
              <p className="text-sm text-muted-foreground">Dietas Criadas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">92%</p>
              <p className="text-sm text-muted-foreground">Taxa de Adesão</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-sm text-muted-foreground">Novos Pacientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}