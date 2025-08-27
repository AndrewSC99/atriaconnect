'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  Settings,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3
} from 'lucide-react'
import { 
  StatusMensagemUnificado,
  MessageTracker,
  FilaMensagem 
} from '@/lib/communication/message-tracker'
import {
  ConfiguracaoComunicacao,
  AnalyticsComunicacao,
  ConversaUnificada
} from '@/types/communication-types'
import { toast } from 'sonner'

interface CommunicationCenterProps {
  configuracao: ConfiguracaoComunicacao
  className?: string
}

export default function CommunicationCenter({ configuracao, className }: CommunicationCenterProps) {
  const [mensagens, setMensagens] = useState<StatusMensagemUnificado[]>([])
  const [conversas, setConversas] = useState<ConversaUnificada[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsComunicacao | null>(null)
  const [statusFila, setStatusFila] = useState({
    aguardando: 0,
    processando: 0,
    falhas: 0,
    proximoProcessamento: undefined as Date | undefined,
    tempoMedioProcessamento: 0
  })
  
  const [filtros, setFiltros] = useState({
    canal: '' as '' | 'whatsapp' | 'sms' | 'email',
    status: '' as '' | StatusMensagemUnificado['status'],
    busca: '',
    periodo: '24h'
  })
  
  const [loading, setLoading] = useState(true)
  const [messageTracker] = useState(new MessageTracker(configuracao))

  useEffect(() => {
    carregarDados()
    const interval = setInterval(carregarDados, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [filtros])

  const carregarDados = async () => {
    try {
      setLoading(true)

      // Carregar mensagens com filtros
      const mensagensFiltradas = messageTracker.listarMensagens({
        canal: filtros.canal || undefined,
        status: filtros.status || undefined,
        limite: 100
      })
      setMensagens(mensagensFiltradas)

      // Carregar status da fila
      const statusAtual = messageTracker.obterStatusFila()
      setStatusFila(statusAtual)

      // Gerar analytics
      const periodo = calcularPeriodo(filtros.periodo)
      const analyticsData = messageTracker.gerarAnalytics(periodo)
      setAnalytics(analyticsData)

      // Simular conversas ativas
      setConversas(gerarConversasSimuladas())

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados de comunicação')
    } finally {
      setLoading(false)
    }
  }

  const calcularPeriodo = (periodo: string) => {
    const agora = new Date()
    const inicio = new Date(agora)

    switch (periodo) {
      case '1h':
        inicio.setHours(agora.getHours() - 1)
        break
      case '24h':
        inicio.setDate(agora.getDate() - 1)
        break
      case '7d':
        inicio.setDate(agora.getDate() - 7)
        break
      case '30d':
        inicio.setDate(agora.getDate() - 30)
        break
      default:
        inicio.setDate(agora.getDate() - 1)
    }

    return { inicio, fim: agora }
  }

  const gerarConversasSimuladas = (): ConversaUnificada[] => {
    return [
      {
        id: 'conv_1',
        pacienteId: 'pac_1',
        canal: 'whatsapp',
        status: 'ativa',
        participantes: {
          paciente: {
            nome: 'Maria Silva',
            telefone: '+5511999999001',
            ultimaAtividade: new Date(Date.now() - 5 * 60 * 1000),
            online: true
          }
        },
        configuracao: {
          notificacoes: true,
          respostasAutomaticas: false,
          escalationAutomatico: true,
          timeoutResposta: 30,
          prioridadeAtendimento: 'alta',
          tagsPersonalizadas: ['primeira_consulta']
        },
        estatisticas: {
          totalMensagens: 12,
          mensagensEnviadas: 8,
          mensagensRecebidas: 4,
          tempoMedioResposta: 5,
          ultimaMensagem: new Date(Date.now() - 5 * 60 * 1000),
          primeiraInteracao: new Date(Date.now() - 2 * 60 * 60 * 1000),
          conversasAnteriores: 2
        },
        contexto: {
          origemContato: 'lembrete',
          assuntosPrincipais: ['agendamento', 'duvidas_dieta'],
          sentimentoGeral: 'positivo'
        }
      },
      {
        id: 'conv_2',
        pacienteId: 'pac_2',
        canal: 'email',
        status: 'aguardando_resposta',
        participantes: {
          paciente: {
            nome: 'João Santos',
            email: 'joao@email.com',
            ultimaAtividade: new Date(Date.now() - 45 * 60 * 1000),
            online: false
          }
        },
        configuracao: {
          notificacoes: true,
          respostasAutomaticas: true,
          escalationAutomatico: false,
          timeoutResposta: 120,
          prioridadeAtendimento: 'normal',
          tagsPersonalizadas: ['retorno']
        },
        estatisticas: {
          totalMensagens: 3,
          mensagensEnviadas: 2,
          mensagensRecebidas: 1,
          tempoMedioResposta: 25,
          ultimaMensagem: new Date(Date.now() - 45 * 60 * 1000),
          primeiraInteracao: new Date(Date.now() - 3 * 60 * 60 * 1000),
          conversasAnteriores: 5
        },
        contexto: {
          origemContato: 'campanha',
          campanhaId: 'camp_promocional_01',
          assuntosPrincipais: ['promocao', 'agendamento'],
          sentimentoGeral: 'neutro'
        }
      }
    ]
  }

  const obterIconeCanal = (canal: string) => {
    switch (canal) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />
      case 'sms':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const obterIconeStatus = (status: StatusMensagemUnificado['status']) => {
    switch (status) {
      case 'pendente':
      case 'enviando':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'enviado':
      case 'entregue':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'lido':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'respondido':
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'falhado':
      case 'expirado':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatarTempo = (segundos?: number) => {
    if (!segundos) return '-'
    
    if (segundos < 60) return `${segundos}s`
    if (segundos < 3600) return `${Math.floor(segundos / 60)}min`
    return `${Math.floor(segundos / 3600)}h${Math.floor((segundos % 3600) / 60)}min`
  }

  const formatarData = (data: Date) => {
    const agora = new Date()
    const diferenca = agora.getTime() - data.getTime()
    
    if (diferenca < 60 * 1000) return 'Agora'
    if (diferenca < 60 * 60 * 1000) return `${Math.floor(diferenca / (60 * 1000))}min atrás`
    if (diferenca < 24 * 60 * 60 * 1000) return `${Math.floor(diferenca / (60 * 60 * 1000))}h atrás`
    
    return data.toLocaleDateString('pt-BR')
  }

  const mensagensFiltradas = mensagens.filter(m => {
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      return m.pacienteNome.toLowerCase().includes(busca) ||
             m.detalhes.conteudo.toLowerCase().includes(busca)
    }
    return true
  })

  if (loading && mensagens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Carregando central de comunicação...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com métricas principais */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Central de Comunicação</h1>
          <p className="text-muted-foreground">
            Gerenciamento unificado de WhatsApp, SMS e Email
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={carregarDados} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fila de Envio</p>
                <p className="text-2xl font-bold">{statusFila.aguardando}</p>
                <p className="text-xs text-blue-600">
                  {statusFila.processando > 0 ? `${statusFila.processando} processando` : 'Em dia'}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold">
                  {analytics ? (analytics.metricas.taxaEntrega * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-green-600">+2.1% vs período anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversas Ativas</p>
                <p className="text-2xl font-bold">{conversas.filter(c => c.status === 'ativa').length}</p>
                <p className="text-xs text-purple-600">
                  {conversas.filter(c => c.status === 'aguardando_resposta').length} aguardando resposta
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold">
                  {analytics ? `${analytics.metricas.tempoMedioResposta}min` : '0min'}
                </p>
                <p className="text-xs text-orange-600">Meta: 15min</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="mensagens" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="conversas">Conversas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fila">Fila de Envio</TabsTrigger>
        </TabsList>

        {/* Tab Mensagens */}
        <TabsContent value="mensagens" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Buscar por paciente ou conteúdo..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <select
                  value={filtros.canal}
                  onChange={(e) => setFiltros(prev => ({ ...prev, canal: e.target.value as any }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Todos os canais</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value as any }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="lido">Lido</option>
                  <option value="respondido">Respondido</option>
                  <option value="falhado">Falhado</option>
                </select>
                <select
                  value={filtros.periodo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="1h">Última hora</option>
                  <option value="24h">Últimas 24h</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de mensagens */}
          <div className="grid gap-4">
            {mensagensFiltradas.map((mensagem) => (
              <Card key={mensagem.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {obterIconeCanal(mensagem.canal)}
                        <Badge variant="outline" className="capitalize">
                          {mensagem.canal}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {obterIconeStatus(mensagem.status)}
                        <Badge 
                          variant={
                            ['respondido', 'lido', 'entregue'].includes(mensagem.status) ? 'default' :
                            ['falhado', 'expirado'].includes(mensagem.status) ? 'destructive' :
                            'secondary'
                          }
                        >
                          {mensagem.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {formatarData(mensagem.timestamps.criado)}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium">{mensagem.pacienteNome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {mensagem.detalhes.conteudo}
                      </p>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="capitalize">{mensagem.contexto.tipoAcao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tentativas:</span>
                        <span>{mensagem.detalhes.tentativasRealizadas}</span>
                      </div>
                      {mensagem.detalhes.custoReal && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Custo:</span>
                          <span>R$ {mensagem.detalhes.custoReal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      {mensagem.metricas.tempoEntrega && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tempo entrega:</span>
                          <span>{formatarTempo(mensagem.metricas.tempoEntrega)}</span>
                        </div>
                      )}
                      {mensagem.metricas.tempoLeitura && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tempo leitura:</span>
                          <span>{formatarTempo(mensagem.metricas.tempoLeitura)}</span>
                        </div>
                      )}
                      {mensagem.metricas.tempoResposta && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tempo resposta:</span>
                          <span>{formatarTempo(mensagem.metricas.tempoResposta)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {mensagem.detalhes.erro && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Erro:</strong> {mensagem.detalhes.erro}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {mensagem.contexto.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {mensagensFiltradas.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma mensagem encontrada com os filtros aplicados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab Conversas */}
        <TabsContent value="conversas" className="space-y-4">
          <div className="grid gap-4">
            {conversas.map((conversa) => (
              <Card key={conversa.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {obterIconeCanal(conversa.canal)}
                      <div>
                        <p className="font-medium">{conversa.participantes.paciente.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {conversa.canal === 'whatsapp' && conversa.participantes.paciente.telefone}
                          {conversa.canal === 'email' && conversa.participantes.paciente.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          conversa.status === 'ativa' ? 'default' :
                          conversa.status === 'aguardando_resposta' ? 'secondary' :
                          'outline'
                        }
                      >
                        {conversa.status.replace('_', ' ')}
                      </Badge>
                      {conversa.participantes.paciente.online && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mensagens</p>
                      <p className="font-medium">
                        {conversa.estatisticas.totalMensagens} 
                        <span className="text-muted-foreground ml-1">
                          ({conversa.estatisticas.mensagensEnviadas}↑ / {conversa.estatisticas.mensagensRecebidas}↓)
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Tempo médio resposta</p>
                      <p className="font-medium">{conversa.estatisticas.tempoMedioResposta}min</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Última atividade</p>
                      <p className="font-medium">
                        {formatarData(conversa.participantes.paciente.ultimaAtividade)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {conversa.contexto.assuntosPrincipais.map(assunto => (
                        <Badge key={assunto} variant="outline" className="text-xs">
                          {assunto}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Histórico
                      </Button>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Responder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6">
              {/* Métricas por canal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance por Canal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(analytics.porCanal).map(([canal, dados]) => (
                      <div key={canal} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {obterIconeCanal(canal)}
                          <h4 className="font-medium capitalize">{canal}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Performance</span>
                            <span className="font-medium">{dados.performance}%</span>
                          </div>
                          <Progress value={dados.performance} />
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Enviado: {dados.enviado}</div>
                            <div>Entregue: {dados.entregue}</div>
                            <div>Lido: {dados.lido}</div>
                            <div>Custo: R$ {dados.custo.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights e recomendações */}
              <Card>
                <CardHeader>
                  <CardTitle>Insights e Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">✨ Melhor Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Canal: <strong className="capitalize">{analytics.insights.melhorCanal}</strong> | 
                        Template: <strong>{analytics.insights.melhorTemplate}</strong> | 
                        Horário: <strong>{analytics.insights.melhorHorario}</strong>
                      </p>
                    </div>

                    {analytics.insights.recomendacoes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">💡 Recomendações</h4>
                        <ul className="space-y-1">
                          {analytics.insights.recomendacoes.map((rec, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analytics.insights.alertas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2">⚠️ Alertas</h4>
                        <ul className="space-y-1">
                          {analytics.insights.alertas.map((alerta, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {alerta}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab Fila */}
        <TabsContent value="fila" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status da Fila de Envio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{statusFila.aguardando}</p>
                  <p className="text-sm text-muted-foreground">Aguardando</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{statusFila.processando}</p>
                  <p className="text-sm text-muted-foreground">Processando</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{statusFila.falhas}</p>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{statusFila.tempoMedioProcessamento.toFixed(1)}s</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
              </div>

              {statusFila.proximoProcessamento && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm">
                    <strong>Próximo processamento:</strong> {formatarData(statusFila.proximoProcessamento)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}