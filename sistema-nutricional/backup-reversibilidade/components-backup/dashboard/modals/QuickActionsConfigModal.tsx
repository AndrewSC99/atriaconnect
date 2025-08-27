'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Users,
  Calendar,
  FileText,
  Megaphone,
  MessageCircle,
  Clock,
  Target,
  Zap,
  Brain,
  Save,
  RotateCcw,
  Info
} from 'lucide-react'
import { ConfiguracoesAcoesRapidas, ModoSelecao, CanalComunicacao, PerfilPratica } from '@/types/quick-actions'

interface QuickActionsConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: ConfiguracoesAcoesRapidas) => void
  configuracaoAtual?: ConfiguracoesAcoesRapidas
}

const configuracaoPadrao: ConfiguracoesAcoesRapidas = {
  perfil: 'clinico',
  
  lembretes: {
    ativo: true,
    modoSelecao: 'hibrido',
    selecaoManual: {
      permitir: true,
      pacientesSelecionados: []
    },
    criteriosAutomaticos: {
      diasSemConsulta: 30,
      incluirFaltosos: true,
      incluirMetasNaoAtingidas: true,
      incluirRetornosPendentes: true,
      scoreMinimo: 50,
      maxPacientesPorDia: 5
    },
    exclusoes: {
      pacientesExcluidos: [],
      diasSemana: [],
      horariosProibidos: []
    },
    mensagens: {
      usarTemplates: true,
      templatesPersonalizados: {
        abandono: 'Olá {nome}, sentimos sua falta! Que tal remarcarmos sua consulta de acompanhamento?',
        retorno: 'Oi {nome}, seu retorno está próximo (dia {data}). Confirma presença?',
        metas: '{nome}, vamos verificar seu progresso? Agende seu acompanhamento nutricional!',
        motivacional: 'Você está no caminho certo, {nome}! Continue firme nos seus objetivos 💪'
      },
      permitirEdicaoAnteEnvio: true,
      incluirAssinatura: true,
      assinatura: 'Dra. Nutricionista - CRN XXXXX'
    },
    canais: {
      prioridade: ['whatsapp', 'sms', 'email'],
      whatsapp: { ativo: true, business: false },
      sms: { ativo: true, provider: 'default' },
      email: { ativo: true, template: 'professional' }
    },
    automacao: {
      envioAutomatico: false,
      horarioPreferido: '09:00',
      reagendarAutomaticamente: false,
      followUpAutomatico: true,
      diasParaFollowUp: 7
    }
  },
  
  otimizacao: {
    ativo: true,
    criterios: {
      minimizarTempoOcioso: true,
      agruparConsultasSimilares: true,
      respeitarPreferenciasPaciente: true,
      considerarTrafego: false,
      otimizarParaReceita: true
    },
    restricoes: {
      horariosFixos: [],
      intervalosObrigatorios: 15,
      maxConsultasPorDia: 12,
      diasTrabalho: [1, 2, 3, 4, 5]
    },
    tipos: {
      consultaInicial: { duracao: 60, preco: 180 },
      retorno: { duracao: 30, preco: 120 },
      avaliacao: { duracao: 45, preco: 150 },
      online: { duracao: 40, preco: 100 }
    }
  },
  
  relatorios: {
    ativo: true,
    frequencia: 'mensal',
    diaEnvio: 1,
    secoes: {
      resumoExecutivo: true,
      metricasFinanceiras: true,
      analisesPacientes: true,
      otimizacaoAgenda: true,
      comparativoPeriodos: true,
      insightsIA: true,
      recomendacoes: true
    },
    formatos: {
      pdf: true,
      excel: false,
      dashboard: true
    },
    distribuicao: {
      emailAutomatico: true,
      destinatarios: [],
      salvarNaNuvem: true,
      caminhoSalvamento: '/relatorios'
    },
    personalizacao: {
      logotipo: '',
      cores: { primaria: '#10b981', secundaria: '#06b6d4' },
      assinatura: 'Sistema Nutricional - Relatório Automático',
      observacoes: ''
    }
  },
  
  campanhas: {
    ativo: true,
    triggers: {
      horariosVazios: true,
      sazanalidade: true,
      pacientesInativos: true,
      metasNaoAtingidas: false,
      'datas especiais': true
    },
    segmentacao: {
      porIdade: { min: 18, max: 80 },
      porPatologia: [],
      porCategoria: [],
      porTempoInativo: 60,
      porValorConsulta: { min: 50, max: 500 }
    },
    ofertas: {
      desconto: { tipo: 'percentual', valor: 15 },
      brinde: '',
      combo: { descricao: '', valor: 0 },
      programa: { nome: '', beneficios: [] }
    },
    comunicacao: {
      canais: ['whatsapp', 'email'],
      template: 'promocional',
      followUp: true,
      diasFollowUp: 3
    }
  },
  
  geral: {
    permissoes: {
      iaPodefazerAcoesAutomaticas: false,
      exigirConfirmacaoSempre: true,
      permitirAgendamentoAcoes: true,
      logTodasAcoes: true
    },
    limites: {
      maxAcoesPorDia: 20,
      maxMensagensPorPacienteMes: 4,
      intervalMinimoEntreMensagens: 24
    },
    inteligencia: {
      usarIA: true,
      scoringPersonalizado: false,
      aprendendimento: true,
      compartilharDados: false
    }
  }
}

export function QuickActionsConfigModal({ isOpen, onClose, onSave, configuracaoAtual }: QuickActionsConfigModalProps) {
  const [config, setConfig] = useState<ConfiguracoesAcoesRapidas>(configuracaoAtual || configuracaoPadrao)
  const [activeTab, setActiveTab] = useState('geral')

  useEffect(() => {
    if (configuracaoAtual) {
      setConfig(configuracaoAtual)
    }
  }, [configuracaoAtual])

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const resetToDefaults = () => {
    setConfig(configuracaoPadrao)
  }

  const updateConfig = (section: keyof ConfiguracoesAcoesRapidas, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], ...updates }
        : updates
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurar Ações Rápidas</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral" className="text-xs">Geral</TabsTrigger>
            <TabsTrigger value="lembretes" className="text-xs">Lembretes</TabsTrigger>
            <TabsTrigger value="agenda" className="text-xs">Agenda</TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs">Relatórios</TabsTrigger>
            <TabsTrigger value="campanhas" className="text-xs">Campanhas</TabsTrigger>
          </TabsList>

          {/* Tab Geral */}
          <TabsContent value="geral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Configurações Gerais</span>
                </CardTitle>
                <CardDescription>
                  Configurações básicas e perfil de prática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Perfil da Prática</Label>
                  <Select 
                    value={config.perfil} 
                    onValueChange={(value: PerfilPratica) => updateConfig('perfil', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinico">Clínico Tradicional</SelectItem>
                      <SelectItem value="esportivo">Nutrição Esportiva</SelectItem>
                      <SelectItem value="estetico">Estético/Emagrecimento</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Permissões</Label>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ia-automatica" className="text-sm">IA pode fazer ações automáticas</Label>
                      <Switch
                        id="ia-automatica"
                        checked={config.geral.permissoes.iaPodefazerAcoesAutomaticas}
                        onCheckedChange={(checked) => updateConfig('geral', {
                          ...config.geral,
                          permissoes: { ...config.geral.permissoes, iaPodefazerAcoesAutomaticas: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmar-sempre" className="text-sm">Exigir confirmação sempre</Label>
                      <Switch
                        id="confirmar-sempre"
                        checked={config.geral.permissoes.exigirConfirmacaoSempre}
                        onCheckedChange={(checked) => updateConfig('geral', {
                          ...config.geral,
                          permissoes: { ...config.geral.permissoes, exigirConfirmacaoSempre: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="log-acoes" className="text-sm">Log de todas as ações</Label>
                      <Switch
                        id="log-acoes"
                        checked={config.geral.permissoes.logTodasAcoes}
                        onCheckedChange={(checked) => updateConfig('geral', {
                          ...config.geral,
                          permissoes: { ...config.geral.permissoes, logTodasAcoes: checked }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Limites</Label>
                    
                    <div>
                      <Label htmlFor="max-acoes-dia" className="text-sm">Máx. ações por dia</Label>
                      <Input
                        id="max-acoes-dia"
                        type="number"
                        value={config.geral.limites.maxAcoesPorDia}
                        onChange={(e) => updateConfig('geral', {
                          ...config.geral,
                          limites: { ...config.geral.limites, maxAcoesPorDia: parseInt(e.target.value) }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="max-msg-paciente" className="text-sm">Máx. msgs/paciente por mês</Label>
                      <Input
                        id="max-msg-paciente"
                        type="number"
                        value={config.geral.limites.maxMensagensPorPacienteMes}
                        onChange={(e) => updateConfig('geral', {
                          ...config.geral,
                          limites: { ...config.geral.limites, maxMensagensPorPacienteMes: parseInt(e.target.value) }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="intervalo-min" className="text-sm">Intervalo mín. entre msgs (horas)</Label>
                      <Input
                        id="intervalo-min"
                        type="number"
                        value={config.geral.limites.intervalMinimoEntreMensagens}
                        onChange={(e) => updateConfig('geral', {
                          ...config.geral,
                          limites: { ...config.geral.limites, intervalMinimoEntreMensagens: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Lembretes */}
          <TabsContent value="lembretes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Configuração de Lembretes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar lembretes automáticos</Label>
                  <Switch
                    checked={config.lembretes.ativo}
                    onCheckedChange={(checked) => updateConfig('lembretes', { ...config.lembretes, ativo: checked })}
                  />
                </div>

                {config.lembretes.ativo && (
                  <>
                    <div>
                      <Label>Modo de seleção</Label>
                      <Select 
                        value={config.lembretes.modoSelecao} 
                        onValueChange={(value: ModoSelecao) => 
                          updateConfig('lembretes', { ...config.lembretes, modoSelecao: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatico">Automático (IA decide)</SelectItem>
                          <SelectItem value="manual">Manual (eu escolho)</SelectItem>
                          <SelectItem value="hibrido">Híbrido (IA sugere, eu confirmo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Dias sem consulta</Label>
                        <Input
                          type="number"
                          value={config.lembretes.criteriosAutomaticos.diasSemConsulta}
                          onChange={(e) => updateConfig('lembretes', {
                            ...config.lembretes,
                            criteriosAutomaticos: {
                              ...config.lembretes.criteriosAutomaticos,
                              diasSemConsulta: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Score mínimo</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={config.lembretes.criteriosAutomaticos.scoreMinimo}
                          onChange={(e) => updateConfig('lembretes', {
                            ...config.lembretes,
                            criteriosAutomaticos: {
                              ...config.lembretes.criteriosAutomaticos,
                              scoreMinimo: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Critérios adicionais</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.lembretes.criteriosAutomaticos.incluirFaltosos}
                          onCheckedChange={(checked) => updateConfig('lembretes', {
                            ...config.lembretes,
                            criteriosAutomaticos: {
                              ...config.lembretes.criteriosAutomaticos,
                              incluirFaltosos: checked
                            }
                          })}
                        />
                        <Label className="text-sm">Incluir pacientes faltosos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.lembretes.criteriosAutomaticos.incluirRetornosPendentes}
                          onCheckedChange={(checked) => updateConfig('lembretes', {
                            ...config.lembretes,
                            criteriosAutomaticos: {
                              ...config.lembretes.criteriosAutomaticos,
                              incluirRetornosPendentes: checked
                            }
                          })}
                        />
                        <Label className="text-sm">Incluir retornos pendentes</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Templates de mensagens</Label>
                      <Textarea
                        placeholder="Mensagem para abandono"
                        value={config.lembretes.mensagens.templatesPersonalizados.abandono}
                        onChange={(e) => updateConfig('lembretes', {
                          ...config.lembretes,
                          mensagens: {
                            ...config.lembretes.mensagens,
                            templatesPersonalizados: {
                              ...config.lembretes.mensagens.templatesPersonalizados,
                              abandono: e.target.value
                            }
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {'{nome}'}, {'{data}'} para personalização
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Agenda */}
          <TabsContent value="agenda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Otimização de Agenda</span>
                </CardTitle>
                <CardDescription>
                  Configure como a IA deve otimizar sua agenda para maximizar eficiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações Básicas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Otimização Automática</Label>
                      <p className="text-xs text-muted-foreground">Permite que a IA reorganize automaticamente sua agenda</p>
                    </div>
                    <Switch
                      checked={config.otimizacao?.ativo || false}
                      onCheckedChange={(checked) => updateConfig('otimizacao', {
                        ...config.otimizacao,
                        ativo: checked
                      })}
                    />
                  </div>

                  {config.otimizacao?.ativo && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Modo de Otimização</Label>
                          <Select 
                            value={config.otimizacao.modo || 'balanceado'} 
                            onValueChange={(value) => updateConfig('otimizacao', {
                              ...config.otimizacao,
                              modo: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agressivo">Agressivo - Máxima otimização</SelectItem>
                              <SelectItem value="balanceado">Balanceado - Equilibrio entre eficiência e preferências</SelectItem>
                              <SelectItem value="conservador">Conservador - Respeita preferências dos pacientes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Frequência</Label>
                          <Select 
                            value={config.otimizacao.frequencia || 'semanal'} 
                            onValueChange={(value) => updateConfig('otimizacao', {
                              ...config.otimizacao,
                              frequencia: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diaria">Diária</SelectItem>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="sob_demanda">Sob Demanda</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Critérios de Otimização */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Critérios de Otimização</Label>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="agrupar-tipos" className="text-sm">Agrupar tipos similares de consulta</Label>
                            <Switch
                              id="agrupar-tipos"
                              checked={config.otimizacao.criterios?.agruparTipos || false}
                              onCheckedChange={(checked) => updateConfig('otimizacao', {
                                ...config.otimizacao,
                                criterios: { ...config.otimizacao.criterios, agruparTipos: checked }
                              })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="minimizar-ocioso" className="text-sm">Minimizar tempo ocioso</Label>
                            <Switch
                              id="minimizar-ocioso"
                              checked={config.otimizacao.criterios?.minimizarOcioso || false}
                              onCheckedChange={(checked) => updateConfig('otimizacao', {
                                ...config.otimizacao,
                                criterios: { ...config.otimizacao.criterios, minimizarOcioso: checked }
                              })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="respeitar-preferencias" className="text-sm">Respeitar preferências dos pacientes</Label>
                            <Switch
                              id="respeitar-preferencias"
                              checked={config.otimizacao.criterios?.respeitarPreferencias !== false}
                              onCheckedChange={(checked) => updateConfig('otimizacao', {
                                ...config.otimizacao,
                                criterios: { ...config.otimizacao.criterios, respeitarPreferencias: checked }
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Priorização</Label>
                          <Select 
                            value={config.otimizacao.priorizacao || 'ocupacao'} 
                            onValueChange={(value) => updateConfig('otimizacao', {
                              ...config.otimizacao,
                              priorizacao: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ocupacao">Ocupação - Maximizar consultas</SelectItem>
                              <SelectItem value="receita">Receita - Maximizar ganhos</SelectItem>
                              <SelectItem value="satisfacao">Satisfação - Foco na experiência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Restrições */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Restrições de Horário</Label>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Intervalo entre consultas (minutos)</Label>
                            <Input
                              type="number"
                              min="5"
                              max="60"
                              value={config.otimizacao.restricoes?.intervalosObrigatorios || 15}
                              onChange={(e) => updateConfig('otimizacao', {
                                ...config.otimizacao,
                                restricoes: { 
                                  ...config.otimizacao.restricoes, 
                                  intervalosObrigatorios: parseInt(e.target.value) 
                                }
                              })}
                            />
                          </div>

                          <div>
                            <Label>Máximo consultas por dia</Label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={config.otimizacao.restricoes?.maxConsultasPorDia || 12}
                              onChange={(e) => updateConfig('otimizacao', {
                                ...config.otimizacao,
                                restricoes: { 
                                  ...config.otimizacao.restricoes, 
                                  maxConsultasPorDia: parseInt(e.target.value) 
                                }
                              })}
                            />
                          </div>
                        </div>

                        {/* Dias de trabalho */}
                        <div>
                          <Label className="text-sm font-medium">Dias de Trabalho</Label>
                          <div className="flex gap-2 mt-2">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
                              <div key={dia} className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  id={`dia-${index}`}
                                  checked={config.otimizacao.restricoes?.diasTrabalho?.includes(index) || false}
                                  onChange={(e) => {
                                    const dias = config.otimizacao.restricoes?.diasTrabalho || []
                                    const novosDias = e.target.checked 
                                      ? [...dias, index] 
                                      : dias.filter(d => d !== index)
                                    updateConfig('otimizacao', {
                                      ...config.otimizacao,
                                      restricoes: { 
                                        ...config.otimizacao.restricoes, 
                                        diasTrabalho: novosDias 
                                      }
                                    })
                                  }}
                                  className="rounded"
                                />
                                <Label htmlFor={`dia-${index}`} className="text-xs">{dia}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tipos de Consulta */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Configuração por Tipo de Consulta</Label>
                        
                        <div className="grid gap-3">
                          {[
                            { key: 'consultaInicial', name: 'Consulta Inicial', defaultDuration: 60, defaultPrice: 200 },
                            { key: 'retorno', name: 'Retorno', defaultDuration: 30, defaultPrice: 150 },
                            { key: 'avaliacao', name: 'Avaliação', defaultDuration: 90, defaultPrice: 300 },
                            { key: 'online', name: 'Consulta Online', defaultDuration: 45, defaultPrice: 180 }
                          ].map(tipo => (
                            <div key={tipo.key} className="grid grid-cols-3 gap-2 items-center">
                              <Label className="text-sm">{tipo.name}</Label>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  placeholder="Min"
                                  value={config.otimizacao.tipos?.[tipo.key]?.duracao || tipo.defaultDuration}
                                  onChange={(e) => updateConfig('otimizacao', {
                                    ...config.otimizacao,
                                    tipos: {
                                      ...config.otimizacao.tipos,
                                      [tipo.key]: {
                                        ...config.otimizacao.tipos?.[tipo.key],
                                        duracao: parseInt(e.target.value) || tipo.defaultDuration
                                      }
                                    }
                                  })}
                                  className="text-xs"
                                />
                                <span className="text-xs text-muted-foreground">min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs">R$</span>
                                <Input
                                  type="number"
                                  placeholder="Preço"
                                  value={config.otimizacao.tipos?.[tipo.key]?.preco || tipo.defaultPrice}
                                  onChange={(e) => updateConfig('otimizacao', {
                                    ...config.otimizacao,
                                    tipos: {
                                      ...config.otimizacao.tipos,
                                      [tipo.key]: {
                                        ...config.otimizacao.tipos?.[tipo.key],
                                        preco: parseInt(e.target.value) || tipo.defaultPrice
                                      }
                                    }
                                  })}
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Geração de Relatórios</span>
                </CardTitle>
                <CardDescription>
                  Configure a geração automática de relatórios gerenciais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações Básicas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Relatórios Automáticos</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar geração automática de relatórios
                      </p>
                    </div>
                    <Switch
                      checked={config.relatorios.ativo}
                      onCheckedChange={(checked) => updateConfig('relatorios', {
                        ...config.relatorios,
                        ativo: checked
                      })}
                    />
                  </div>

                  {(config.relatorios?.ativo) && (
                    <>
                      {/* Configurações de Frequência */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Frequência</Label>
                          <Select
                            value={config.relatorios?.frequencia || 'mensal'}
                            onValueChange={(value: 'semanal' | 'mensal' | 'trimestral' | 'personalizado') => updateConfig('relatorios', {
                              ...config.relatorios,
                              frequencia: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                              <SelectItem value="trimestral">Trimestral</SelectItem>
                              <SelectItem value="personalizado">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Dia do Envio</Label>
                          <Input
                            type="number"
                            min="1"
                            max={config.relatorios?.frequencia === 'semanal' ? 7 : 31}
                            value={config.relatorios?.diaEnvio || 1}
                            onChange={(e) => updateConfig('relatorios', {
                              ...config.relatorios,
                              diaEnvio: parseInt(e.target.value)
                            })}
                            placeholder={config.relatorios?.frequencia === 'semanal' ? '1-7 (dom-sab)' : '1-31'}
                          />
                        </div>
                      </div>

                      {/* Seções do Relatório */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Seções do Relatório</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.resumoExecutivo || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  resumoExecutivo: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Resumo Executivo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.metricasFinanceiras || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  metricasFinanceiras: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Métricas Financeiras</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.analisesPacientes || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  analisesPacientes: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Análises de Pacientes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.otimizacaoAgenda || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  otimizacaoAgenda: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Otimização de Agenda</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.comparativoPeriodos || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  comparativoPeriodos: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Comparativo de Períodos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.insightsIA || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  insightsIA: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Insights da IA</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.secoes?.recomendacoes || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                secoes: {
                                  ...(config.relatorios?.secoes || {}),
                                  recomendacoes: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Recomendações</Label>
                          </div>
                        </div>
                      </div>

                      {/* Formatos de Exportação */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Formatos de Exportação</Label>
                        <div className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.formatos?.pdf || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                formatos: {
                                  ...(config.relatorios?.formatos || {}),
                                  pdf: checked
                                }
                              })}
                            />
                            <Label className="text-sm">PDF</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.formatos?.excel || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                formatos: {
                                  ...(config.relatorios?.formatos || {}),
                                  excel: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Excel</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.formatos?.dashboard || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                formatos: {
                                  ...(config.relatorios?.formatos || {}),
                                  dashboard: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Dashboard Online</Label>
                          </div>
                        </div>
                      </div>

                      {/* Configurações de Distribuição */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Distribuição</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.distribuicao?.emailAutomatico || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                distribuicao: {
                                  ...(config.relatorios?.distribuicao || {}),
                                  emailAutomatico: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Envio por Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.relatorios?.distribuicao?.salvarNaNuvem || false}
                              onCheckedChange={(checked) => updateConfig('relatorios', {
                                ...config.relatorios,
                                distribuicao: {
                                  ...(config.relatorios?.distribuicao || {}),
                                  salvarNaNuvem: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Salvar na Nuvem</Label>
                          </div>
                        </div>

                        {(config.relatorios?.distribuicao?.emailAutomatico) && (
                          <div>
                            <Label>Destinatários de Email</Label>
                            <Textarea
                              value={config.relatorios?.distribuicao?.destinatarios?.join(', ') || ''}
                              onChange={(e) => updateConfig('relatorios', {
                                ...config.relatorios,
                                distribuicao: {
                                  ...(config.relatorios?.distribuicao || {}),
                                  destinatarios: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                                }
                              })}
                              placeholder="email1@exemplo.com, email2@exemplo.com"
                              className="h-20"
                            />
                          </div>
                        )}

                        {(config.relatorios?.distribuicao?.salvarNaNuvem) && (
                          <div>
                            <Label>Caminho de Salvamento</Label>
                            <Input
                              value={config.relatorios?.distribuicao?.caminhoSalvamento || ''}
                              onChange={(e) => updateConfig('relatorios', {
                                ...config.relatorios,
                                distribuicao: {
                                  ...(config.relatorios?.distribuicao || {}),
                                  caminhoSalvamento: e.target.value
                                }
                              })}
                              placeholder="/reports/monthly/"
                            />
                          </div>
                        )}
                      </div>

                      {/* Personalização */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Personalização</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Logotipo (URL)</Label>
                            <Input
                              value={config.relatorios?.personalizacao?.logotipo || ''}
                              onChange={(e) => updateConfig('relatorios', {
                                ...config.relatorios,
                                personalizacao: {
                                  ...(config.relatorios?.personalizacao || {}),
                                  logotipo: e.target.value
                                }
                              })}
                              placeholder="https://exemplo.com/logo.png"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Cor Primária</Label>
                              <Input
                                type="color"
                                value={config.relatorios?.personalizacao?.cores?.primaria || '#10b981'}
                                onChange={(e) => updateConfig('relatorios', {
                                  ...config.relatorios,
                                  personalizacao: {
                                    ...(config.relatorios?.personalizacao || {}),
                                    cores: {
                                      ...(config.relatorios?.personalizacao?.cores || {}),
                                      primaria: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <Label>Cor Secundária</Label>
                              <Input
                                type="color"
                                value={config.relatorios?.personalizacao?.cores?.secundaria || '#06b6d4'}
                                onChange={(e) => updateConfig('relatorios', {
                                  ...config.relatorios,
                                  personalizacao: {
                                    ...(config.relatorios?.personalizacao || {}),
                                    cores: {
                                      ...(config.relatorios?.personalizacao?.cores || {}),
                                      secundaria: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Assinatura do Relatório</Label>
                          <Textarea
                            value={config.relatorios?.personalizacao?.assinatura || ''}
                            onChange={(e) => updateConfig('relatorios', {
                              ...config.relatorios,
                              personalizacao: {
                                ...(config.relatorios?.personalizacao || {}),
                                assinatura: e.target.value
                              }
                            })}
                            placeholder="Dr. João Silva - Nutricionista CRN 12345"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <Label>Observações Adicionais</Label>
                          <Textarea
                            value={config.relatorios?.personalizacao?.observacoes || ''}
                            onChange={(e) => updateConfig('relatorios', {
                              ...config.relatorios,
                              personalizacao: {
                                ...(config.relatorios?.personalizacao || {}),
                                observacoes: e.target.value
                              }
                            })}
                            placeholder="Observações que aparecerão no rodapé dos relatórios"
                            className="h-20"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campanhas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Megaphone className="h-4 w-4" />
                  <span>Campanhas de Marketing</span>
                </CardTitle>
                <CardDescription>
                  Configure campanhas automáticas baseadas em triggers inteligentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações Básicas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Campanhas Automáticas</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar criação automática de campanhas baseadas em eventos
                      </p>
                    </div>
                    <Switch
                      checked={config.campanhas?.ativo || false}
                      onCheckedChange={(checked) => updateConfig('campanhas', {
                        ...config.campanhas,
                        ativo: checked
                      })}
                    />
                  </div>

                  {(config.campanhas?.ativo) && (
                    <>
                      {/* Triggers de Campanhas */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Triggers Automáticos</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.campanhas?.triggers?.horariosVazios || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                triggers: {
                                  ...(config.campanhas?.triggers || {}),
                                  horariosVazios: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Horários Vazios</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.campanhas?.triggers?.sazanalidade || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                triggers: {
                                  ...(config.campanhas?.triggers || {}),
                                  sazanalidade: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Sazonalidade</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.campanhas?.triggers?.pacientesInativos || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                triggers: {
                                  ...(config.campanhas?.triggers || {}),
                                  pacientesInativos: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Pacientes Inativos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.campanhas?.triggers?.metasNaoAtingidas || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                triggers: {
                                  ...(config.campanhas?.triggers || {}),
                                  metasNaoAtingidas: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Metas Não Atingidas</Label>
                          </div>
                          <div className="flex items-center space-x-2 col-span-2">
                            <Switch
                              checked={config.campanhas?.triggers?.['datas especiais'] || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                triggers: {
                                  ...(config.campanhas?.triggers || {}),
                                  'datas especiais': checked
                                }
                              })}
                            />
                            <Label className="text-sm">Datas Especiais (aniversários, feriados)</Label>
                          </div>
                        </div>
                      </div>

                      {/* Segmentação de Público */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Segmentação de Público</Label>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Idade Mínima</Label>
                            <Input
                              type="number"
                              min="0"
                              max="120"
                              value={config.campanhas?.segmentacao?.porIdade?.min || 18}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                segmentacao: {
                                  ...(config.campanhas?.segmentacao || {}),
                                  porIdade: {
                                    ...(config.campanhas?.segmentacao?.porIdade || {}),
                                    min: parseInt(e.target.value)
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Idade Máxima</Label>
                            <Input
                              type="number"
                              min="0"
                              max="120"
                              value={config.campanhas?.segmentacao?.porIdade?.max || 65}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                segmentacao: {
                                  ...(config.campanhas?.segmentacao || {}),
                                  porIdade: {
                                    ...(config.campanhas?.segmentacao?.porIdade || {}),
                                    max: parseInt(e.target.value)
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Patologias de Interesse</Label>
                          <Textarea
                            value={config.campanhas?.segmentacao?.porPatologia?.join(', ') || ''}
                            onChange={(e) => updateConfig('campanhas', {
                              ...config.campanhas,
                              segmentacao: {
                                ...(config.campanhas?.segmentacao || {}),
                                porPatologia: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="Diabetes, Hipertensão, Obesidade"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <Label>Categorias de Paciente</Label>
                          <Textarea
                            value={config.campanhas?.segmentacao?.porCategoria?.join(', ') || ''}
                            onChange={(e) => updateConfig('campanhas', {
                              ...config.campanhas,
                              segmentacao: {
                                ...(config.campanhas?.segmentacao || {}),
                                porCategoria: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              }
                            })}
                            placeholder="VIP, Regular, Novo, Premium"
                            className="h-16"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Tempo Inativo (dias)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={config.campanhas?.segmentacao?.porTempoInativo || 30}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                segmentacao: {
                                  ...(config.campanhas?.segmentacao || {}),
                                  porTempoInativo: parseInt(e.target.value)
                                }
                              })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Valor Min.</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={config.campanhas?.segmentacao?.porValorConsulta?.min || 0}
                                onChange={(e) => updateConfig('campanhas', {
                                  ...config.campanhas,
                                  segmentacao: {
                                    ...(config.campanhas?.segmentacao || {}),
                                    porValorConsulta: {
                                      ...(config.campanhas?.segmentacao?.porValorConsulta || {}),
                                      min: parseFloat(e.target.value)
                                    }
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <Label>Valor Máx.</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={config.campanhas?.segmentacao?.porValorConsulta?.max || 500}
                                onChange={(e) => updateConfig('campanhas', {
                                  ...config.campanhas,
                                  segmentacao: {
                                    ...(config.campanhas?.segmentacao || {}),
                                    porValorConsulta: {
                                      ...(config.campanhas?.segmentacao?.porValorConsulta || {}),
                                      max: parseFloat(e.target.value)
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configurações de Ofertas */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Ofertas e Incentivos</Label>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Tipo de Desconto</Label>
                            <Select
                              value={config.campanhas?.ofertas?.desconto?.tipo || 'percentual'}
                              onValueChange={(value: 'percentual' | 'fixo') => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  desconto: {
                                    ...(config.campanhas?.ofertas?.desconto || {}),
                                    tipo: value
                                  }
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentual">Percentual (%)</SelectItem>
                                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Valor do Desconto</Label>
                            <Input
                              type="number"
                              min="0"
                              step={config.campanhas?.ofertas?.desconto?.tipo === 'percentual' ? '1' : '0.01'}
                              max={config.campanhas?.ofertas?.desconto?.tipo === 'percentual' ? '100' : undefined}
                              value={config.campanhas?.ofertas?.desconto?.valor || 10}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  desconto: {
                                    ...(config.campanhas?.ofertas?.desconto || {}),
                                    valor: parseFloat(e.target.value)
                                  }
                                }
                              })}
                              placeholder={config.campanhas?.ofertas?.desconto?.tipo === 'percentual' ? '10' : '50.00'}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Brinde Promocional</Label>
                          <Input
                            value={config.campanhas?.ofertas?.brinde || ''}
                            onChange={(e) => updateConfig('campanhas', {
                              ...config.campanhas,
                              ofertas: {
                                ...(config.campanhas?.ofertas || {}),
                                brinde: e.target.value
                              }
                            })}
                            placeholder="Consulta de retorno grátis, Kit nutricional"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Combo Promocional</Label>
                            <Input
                              value={config.campanhas?.ofertas?.combo?.descricao || ''}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  combo: {
                                    ...(config.campanhas?.ofertas?.combo || {}),
                                    descricao: e.target.value
                                  }
                                }
                              })}
                              placeholder="3 consultas + plano alimentar"
                            />
                          </div>
                          <div>
                            <Label>Valor do Combo</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={config.campanhas?.ofertas?.combo?.valor || 0}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  combo: {
                                    ...(config.campanhas?.ofertas?.combo || {}),
                                    valor: parseFloat(e.target.value)
                                  }
                                }
                              })}
                              placeholder="299.99"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nome do Programa</Label>
                            <Input
                              value={config.campanhas?.ofertas?.programa?.nome || ''}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  programa: {
                                    ...(config.campanhas?.ofertas?.programa || {}),
                                    nome: e.target.value
                                  }
                                }
                              })}
                              placeholder="Programa VIP de Acompanhamento"
                            />
                          </div>
                          <div>
                            <Label>Benefícios do Programa</Label>
                            <Textarea
                              value={config.campanhas?.ofertas?.programa?.beneficios?.join(', ') || ''}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                ofertas: {
                                  ...(config.campanhas?.ofertas || {}),
                                  programa: {
                                    ...(config.campanhas?.ofertas?.programa || {}),
                                    beneficios: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                                  }
                                }
                              })}
                              placeholder="Consultas ilimitadas, WhatsApp direto, Planos personalizados"
                              className="h-16"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Configurações de Comunicação */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Comunicação da Campanha</Label>
                        
                        <div>
                          <Label>Canais de Comunicação</Label>
                          <div className="flex space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={config.campanhas?.comunicacao?.canais?.includes('whatsapp') || false}
                                onCheckedChange={(checked) => {
                                  const canais = config.campanhas?.comunicacao?.canais || []
                                  updateConfig('campanhas', {
                                    ...config.campanhas,
                                    comunicacao: {
                                      ...(config.campanhas?.comunicacao || {}),
                                      canais: checked 
                                        ? [...canais, 'whatsapp'] 
                                        : canais.filter(c => c !== 'whatsapp')
                                    }
                                  })
                                }}
                              />
                              <Label className="text-sm">WhatsApp</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={config.campanhas?.comunicacao?.canais?.includes('sms') || false}
                                onCheckedChange={(checked) => {
                                  const canais = config.campanhas?.comunicacao?.canais || []
                                  updateConfig('campanhas', {
                                    ...config.campanhas,
                                    comunicacao: {
                                      ...(config.campanhas?.comunicacao || {}),
                                      canais: checked 
                                        ? [...canais, 'sms'] 
                                        : canais.filter(c => c !== 'sms')
                                    }
                                  })
                                }}
                              />
                              <Label className="text-sm">SMS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={config.campanhas?.comunicacao?.canais?.includes('email') || false}
                                onCheckedChange={(checked) => {
                                  const canais = config.campanhas?.comunicacao?.canais || []
                                  updateConfig('campanhas', {
                                    ...config.campanhas,
                                    comunicacao: {
                                      ...(config.campanhas?.comunicacao || {}),
                                      canais: checked 
                                        ? [...canais, 'email'] 
                                        : canais.filter(c => c !== 'email')
                                    }
                                  })
                                }}
                              />
                              <Label className="text-sm">Email</Label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Template da Mensagem</Label>
                          <Textarea
                            value={config.campanhas?.comunicacao?.template || ''}
                            onChange={(e) => updateConfig('campanhas', {
                              ...config.campanhas,
                              comunicacao: {
                                ...(config.campanhas?.comunicacao || {}),
                                template: e.target.value
                              }
                            })}
                            placeholder="Olá {nome}! Temos uma oferta especial para você: {oferta}. Entre em contato para saber mais!"
                            className="h-24"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.campanhas?.comunicacao?.followUp || false}
                              onCheckedChange={(checked) => updateConfig('campanhas', {
                                ...config.campanhas,
                                comunicacao: {
                                  ...(config.campanhas?.comunicacao || {}),
                                  followUp: checked
                                }
                              })}
                            />
                            <Label className="text-sm">Follow-up Automático</Label>
                          </div>
                          <div>
                            <Label>Dias para Follow-up</Label>
                            <Input
                              type="number"
                              min="1"
                              value={config.campanhas?.comunicacao?.diasFollowUp || 3}
                              onChange={(e) => updateConfig('campanhas', {
                                ...config.campanhas,
                                comunicacao: {
                                  ...(config.campanhas?.comunicacao || {}),
                                  diasFollowUp: parseInt(e.target.value)
                                }
                              })}
                              disabled={!config.campanhas?.comunicacao?.followUp}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}