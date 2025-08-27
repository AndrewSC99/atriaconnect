'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  Users,
  Calendar,
  TrendingUp,
  Megaphone,
  Settings,
  Brain,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react'
import { QuickActionsConfigModal } from './modals/QuickActionsConfigModal'
import { PatientSelectionModal } from './modals/PatientSelectionModal'
import { quickActionsEngine, configuracaoPadrao } from '@/lib/quick-actions-engine'
import { ConfiguracoesAcoesRapidas, TipoAcaoRapida, PacienteRisco, InsightIA } from '@/types/quick-actions'
import { toast } from 'sonner'

interface QuickActionItem {
  tipo: TipoAcaoRapida
  titulo: string
  descricao: string
  icone: React.ReactNode
  cor: string
  badge?: string
}

const quickActions: QuickActionItem[] = [
  {
    tipo: 'send-reminders',
    titulo: 'Lembretes Inteligentes',
    descricao: 'IA sugere pacientes prioritários',
    icone: <Users className="w-4 h-4" />,
    cor: 'bg-blue-500',
    badge: 'IA'
  },
  {
    tipo: 'optimize-schedule',
    titulo: 'Otimizar Agenda',
    descricao: 'Maximize ocupação e eficiência',
    icone: <Calendar className="w-4 h-4" />,
    cor: 'bg-green-500',
    badge: 'Novo'
  },
  {
    tipo: 'generate-report',
    titulo: 'Relatório Automático',
    descricao: 'Insights e métricas detalhadas',
    icone: <TrendingUp className="w-4 h-4" />,
    cor: 'bg-purple-500'
  },
  {
    tipo: 'create-campaign',
    titulo: 'Campanha Inteligente',
    descricao: 'Promoções para horários vazios',
    icone: <Megaphone className="w-4 h-4" />,
    cor: 'bg-orange-500',
    badge: 'IA'
  }
]

export function QuickActionsCard() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesAcoesRapidas>(configuracaoPadrao)
  const [insights, setInsights] = useState<InsightIA[]>([])
  const [pacientesDisponiveis, setPacientesDisponiveis] = useState<PacienteRisco[]>([])
  const [pacientesSugeridos, setPacientesSugeridos] = useState<PacienteRisco[]>([])
  
  // Estados dos modais
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<TipoAcaoRapida | null>(null)
  
  // Estados de loading
  const [loadingActions, setLoadingActions] = useState<Set<TipoAcaoRapida>>(new Set())
  const [loadingInsights, setLoadingInsights] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoadingInsights(true)
      
      // Carregar insights da IA
      const insightsData = await quickActionsEngine.gerarInsights()
      setInsights(insightsData)
      
      // Carregar pacientes para lembretes
      const { sugeridos, todos } = await quickActionsEngine.identificarPacientesParaLembretes()
      setPacientesSugeridos(sugeridos)
      setPacientesDisponiveis(todos)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados das ações rápidas')
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleQuickAction = async (tipo: TipoAcaoRapida) => {
    // Se exigir confirmação ou for lembretes, abrir modal
    if (configuracoes.geral.permissoes.exigirConfirmacaoSempre || tipo === 'send-reminders') {
      setCurrentAction(tipo)
      
      if (tipo === 'send-reminders') {
        setPatientModalOpen(true)
      } else {
        await executeAction(tipo, {})
      }
      return
    }
    
    // Executar ação diretamente
    await executeAction(tipo, {})
  }

  const executeAction = async (tipo: TipoAcaoRapida, config: any) => {
    setLoadingActions(prev => new Set([...prev, tipo]))
    
    try {
      const resultado = await quickActionsEngine.executarAcao(tipo, config)
      
      if (resultado.sucesso) {
        toast.success(resultado.mensagem, {
          description: `${resultado.pacientesAfetados ? `${resultado.pacientesAfetados} pacientes afetados` : ''}${resultado.tempoPoupado ? ` • ${resultado.tempoPoupado}h economizadas` : ''}${resultado.receitaGerada ? ` • R$ ${resultado.receitaGerada} potencial` : ''}`
        })
        
        // Recarregar insights após ação executada
        if (tipo === 'send-reminders') {
          await loadInitialData()
        }
      } else {
        toast.error(`Erro ao executar ação: ${resultado.mensagem}`)
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error)
      toast.error('Erro ao executar ação rápida')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(tipo)
        return newSet
      })
    }
  }

  const handlePatientSelectionConfirm = async (pacientesSelecionados: string[], mensagensPersonalizadas: Record<string, string>) => {
    const config = {
      pacientes: pacientesSelecionados.map(id => {
        const paciente = [...pacientesDisponiveis, ...pacientesSugeridos].find(p => p.id === id)
        return {
          id,
          nome: paciente?.nome || '',
          canal: paciente?.canalPreferido || 'whatsapp',
          mensagem: mensagensPersonalizadas[id] || ''
        }
      })
    }
    
    await executeAction('send-reminders', config)
    setPatientModalOpen(false)
    setCurrentAction(null)
  }

  const handleConfigSave = (novaConfig: ConfiguracoesAcoesRapidas) => {
    setConfiguracoes(novaConfig)
    toast.success('Configurações salvas com sucesso!')
    
    // Recarregar dados com novas configurações
    quickActionsEngine['configuracoes'] = novaConfig
    loadInitialData()
  }

  const getActionTitle = (tipo: TipoAcaoRapida) => {
    const action = quickActions.find(a => a.tipo === tipo)
    return action?.titulo || 'Ação'
  }

  const getActionDescription = (tipo: TipoAcaoRapida) => {
    switch (tipo) {
      case 'send-reminders':
        return `Selecione até ${configuracoes.lembretes.criteriosAutomaticos.maxPacientesPorDia} pacientes para enviar lembretes personalizados`
      case 'optimize-schedule':
        return 'Analise e reorganize sua agenda para maximum eficiência'
      case 'generate-report':
        return 'Gere relatório completo com insights e métricas'
      case 'create-campaign':
        return 'Crie campanhas automáticas para otimizar ocupação'
      default:
        return 'Executar ação rápida'
    }
  }

  // Insight mais relevante para exibir
  const insightPrincipal = insights.find(i => i.prioridade === 'alta') || insights[0]

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Ações Rápidas</span>
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                IA
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Tarefas inteligentes baseadas em análise de dados
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Insight Principal */}
          {insightPrincipal && !loadingInsights && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                {insightPrincipal.tipo === 'alerta' ? (
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                ) : (
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{insightPrincipal.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insightPrincipal.descricao}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="space-y-2">
            {quickActions.map((action) => {
              const isLoading = loadingActions.has(action.tipo)
              const relatedInsight = insights.find(i => i.acao.tipo === action.tipo)
              
              return (
                <Button
                  key={action.tipo}
                  className="w-full justify-between h-auto p-3"
                  variant="outline"
                  onClick={() => handleQuickAction(action.tipo)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${action.cor} text-white`}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        action.icone
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.titulo}</p>
                      <p className="text-xs text-muted-foreground">{action.descricao}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                    {relatedInsight && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-2 w-2 mr-1" />
                        Sugerido
                      </Badge>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Status de configuração */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Perfil: {configuracoes.perfil === 'clinico' ? 'Clínico' : 
                        configuracoes.perfil === 'esportivo' ? 'Esportivo' : 
                        configuracoes.perfil === 'estetico' ? 'Estético' : 'Personalizado'}
              </span>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Configurado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      <QuickActionsConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={handleConfigSave}
        configuracaoAtual={configuracoes}
      />

      {/* Modal de Seleção de Pacientes */}
      {currentAction && (
        <PatientSelectionModal
          isOpen={patientModalOpen}
          onClose={() => {
            setPatientModalOpen(false)
            setCurrentAction(null)
          }}
          onConfirm={handlePatientSelectionConfirm}
          tipo={currentAction}
          pacientesDisponiveis={pacientesDisponiveis}
          pacientesSugeridos={pacientesSugeridos}
          titulo={getActionTitle(currentAction)}
          descricao={getActionDescription(currentAction)}
        />
      )}
    </>
  )
}