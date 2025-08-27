'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  BarChart3, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react'
import { MLEngine } from '@/lib/ml-engine'
import { FeedbackSystem } from '@/lib/feedback-system'
import { WorkflowAutomation } from '@/lib/workflow-automation'
import { EstadoSistemaML, ModeloML, PredicaoIA, InsightAvancado, WorkflowInteligente } from '@/types/ml-types'

interface AIAnalyticsDashboardProps {
  className?: string
}

export default function AIAnalyticsDashboard({ className }: AIAnalyticsDashboardProps) {
  const [estadoSistema, setEstadoSistema] = useState<EstadoSistemaML | null>(null)
  const [modelos, setModelos] = useState<ModeloML[]>([])
  const [predicoes, setPredicoes] = useState<PredicaoIA[]>([])
  const [insights, setInsights] = useState<InsightAvancado[]>([])
  const [workflows, setWorkflows] = useState<WorkflowInteligente[]>([])
  const [loading, setLoading] = useState(true)

  const mlEngine = new MLEngine()
  const feedbackSystem = new FeedbackSystem()
  const workflowSystem = new WorkflowAutomation()

  useEffect(() => {
    carregarDadosAnalytics()
  }, [])

  const carregarDadosAnalytics = async () => {
    setLoading(true)
    try {
      // Carregar estado do sistema ML
      const estado = await mlEngine.obterEstadoSistema()
      setEstadoSistema(estado)

      // Carregar modelos ML
      const modelosData = await mlEngine.listarModelos()
      setModelos(modelosData)

      // Carregar predições recentes
      const predicoesRecentes = await mlEngine.obterPredicoesRecentes(50)
      setPredicoes(predicoesRecentes)

      // Carregar insights avançados
      const insightsData = await mlEngine.obterInsightsRecentes(20)
      setInsights(insightsData)

      // Carregar workflows ativos
      const workflowsData = await workflowSystem.listarWorkflows()
      setWorkflows(workflowsData)

    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'ativo': 'bg-green-500',
      'treinando': 'bg-yellow-500',
      'erro': 'bg-red-500',
      'inicializando': 'bg-blue-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600'
    if (accuracy >= 80) return 'text-yellow-600'
    if (accuracy >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Carregando Analytics de IA...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Status Geral */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IA Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do sistema de Machine Learning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(estadoSistema?.status || 'erro')}`} />
            <span className="text-sm font-medium capitalize">{estadoSistema?.status || 'Carregando'}</span>
          </div>
          <Button onClick={carregarDadosAnalytics} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predições Hoje</p>
                <p className="text-2xl font-bold">{estadoSistema?.estatisticas.totalPredicoes || 0}</p>
                <p className="text-xs text-green-600">+12% vs ontem</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acurácia Geral</p>
                <p className="text-2xl font-bold">{((estadoSistema?.estatisticas.acuraciaGeral || 0) * 100).toFixed(1)}%</p>
                <p className="text-xs text-green-600">+2.1% este mês</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Padrões Ativos</p>
                <p className="text-2xl font-bold">{estadoSistema?.estatisticas.padrzoesDetectados || 0}</p>
                <p className="text-xs text-blue-600">3 novos detectados</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workflows Ativos</p>
                <p className="text-2xl font-bold">{estadoSistema?.estatisticas.workflowsAtivos || 0}</p>
                <p className="text-xs text-yellow-600">2 executando agora</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análises Detalhadas */}
      <Tabs defaultValue="modelos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modelos">Modelos ML</TabsTrigger>
          <TabsTrigger value="predicoes">Predições</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="workflows">Automações</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Tab Modelos ML */}
        <TabsContent value="modelos" className="space-y-4">
          <div className="grid gap-4">
            {modelos.map((modelo) => (
              <Card key={modelo.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{modelo.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{modelo.objetivo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={modelo.treinamento.status === 'treinado' ? 'default' : 'secondary'}>
                        {modelo.treinamento.status}
                      </Badge>
                      <Badge variant="outline">
                        {modelo.tipo}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Acurácia</p>
                      <p className={`text-xl font-bold ${getPerformanceColor(modelo.performance.acuracia)}`}>
                        {(modelo.performance.acuracia * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">F1 Score</p>
                      <p className="text-xl font-bold">{modelo.performance.f1Score.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Predições</p>
                      <p className="text-xl font-bold">{modelo.performance.predicoesTotais}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Último Treino</p>
                      <p className="text-sm text-muted-foreground">
                        {modelo.treinamento.dataUltimoTreino?.toLocaleDateString() || 'Nunca'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progresso do Treinamento</span>
                      <span>{((modelo.treinamento.acuracia || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(modelo.treinamento.acuracia || 0) * 100} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Predições */}
        <TabsContent value="predicoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predições Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predicoes.slice(0, 10).map((predicao) => (
                  <div key={predicao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{predicao.modelo}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {predicao.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium mt-1">
                        Probabilidade: {(predicao.predicao.probabilidade * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confiança: {(predicao.predicao.confianca * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {predicao.predicao.probabilidade > 0.8 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : predicao.predicao.probabilidade > 0.6 ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium">
                          {predicao.predicao.categoria}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{insight.insight.titulo}</CardTitle>
                      <Badge variant={
                        insight.insight.urgencia === 'critica' ? 'destructive' :
                        insight.insight.urgencia === 'alta' ? 'default' :
                        insight.insight.urgencia === 'media' ? 'secondary' : 'outline'
                      }>
                        {insight.insight.urgencia}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confiança: {(insight.insight.confianca * 100).toFixed(1)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{insight.insight.descricao}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recomendações:</h4>
                    {insight.recomendacoes.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>{rec.acao}</span>
                        <Badge variant="outline" className="ml-auto">
                          Impact: {rec.impactoEstimado}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {insight.implementacao && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Implementado em {insight.implementacao.dataImplementacao?.toLocaleDateString()}
                        </span>
                      </div>
                      {insight.implementacao.efetividade && (
                        <p className="text-xs text-green-700 mt-1">
                          Efetividade: {(insight.implementacao.efetividade * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{workflow.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.ativo ? 'default' : 'secondary'}>
                        {workflow.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {workflow.aprendizado.ativo && (
                        <Badge variant="outline" className="text-blue-600">
                          <Brain className="h-3 w-3 mr-1" />
                          Auto-Learning
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Execuções</p>
                      <p className="text-xl font-bold">{workflow.performance.execucoes}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Taxa de Sucesso</p>
                      <p className="text-xl font-bold text-green-600">
                        {(workflow.performance.taxaSucesso * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ROI Médio</p>
                      <p className="text-xl font-bold">{workflow.performance.roiMedio.toFixed(1)}x</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tempo Médio</p>
                      <p className="text-xl font-bold">{workflow.performance.tempoMedioExecucao.toFixed(0)}s</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Triggers Ativos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.triggers.map((trigger, idx) => (
                        <Badge key={idx} variant="outline">
                          {trigger.tipo}
                          {trigger.proximaExecucao && (
                            <span className="ml-1 text-xs">
                              ({trigger.proximaExecucao.toLocaleString()})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Taxa de Sucesso</span>
                      <span>{(workflow.performance.taxaSucesso * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={workflow.performance.taxaSucesso * 100} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por Funcionalidade */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Funcionalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadoSistema && Object.entries(estadoSistema.performance).map(([func, perf]) => (
                    <div key={func}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">
                          {func.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold">
                          {(perf.taxa_acerto * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={perf.taxa_acerto * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{perf.predicoes} predições</span>
                        <span>{perf.tempo_resposta_medio.toFixed(0)}ms médio</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estadoSistema?.alertas.filter(a => !a.resolvido).map((alerta, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {alerta.severidade === 'critical' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : alerta.severidade === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        ) : alerta.severidade === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            alerta.severidade === 'critical' ? 'destructive' :
                            alerta.severidade === 'error' ? 'destructive' :
                            alerta.severidade === 'warning' ? 'secondary' : 'outline'
                          }>
                            {alerta.tipo}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alerta.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{alerta.mensagem}</p>
                      </div>
                    </div>
                  ))}
                  
                  {(!estadoSistema?.alertas.filter(a => !a.resolvido).length) && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>Sistema funcionando perfeitamente!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}