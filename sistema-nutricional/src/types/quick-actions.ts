// Tipos para o Sistema de Ações Rápidas Inteligentes

export type TipoAcaoRapida = 'send-reminders' | 'optimize-schedule' | 'generate-report' | 'create-campaign'
export type CanalComunicacao = 'whatsapp' | 'sms' | 'email'
export type ModoSelecao = 'automatico' | 'manual' | 'hibrido'
export type PerfilPratica = 'clinico' | 'esportivo' | 'estetico' | 'personalizado'
export type PrioridadeContato = 'baixa' | 'media' | 'alta' | 'urgente'

// Dados do Paciente para Ações Rápidas
export interface PacienteRisco {
  id: string
  nome: string
  email?: string
  telefone?: string
  ultimaConsulta: Date
  proximaConsulta?: Date
  scorePrioridade: number // 0-100
  motivoContato: string
  categoria: string // "VIP", "Regular", "Novo", etc.
  patologias: string[]
  canalPreferido: CanalComunicacao
  mensagemSugerida: string
  historico: {
    totalConsultas: number
    faltas: number
    cancelamentos: number
    taxaAdesao: number
  }
  metas: {
    peso?: { atual: number; objetivo: number; progresso: number }
    exercicio?: { frequencia: number; objetivo: number }
    adherencia?: number
  }
}

// Configurações de Lembretes
export interface ConfiguracaoLembretes {
  ativo: boolean
  modoSelecao: ModoSelecao
  
  selecaoManual: {
    permitir: boolean
    pacientesSelecionados: string[]
  }
  
  criteriosAutomaticos: {
    diasSemConsulta: number
    incluirFaltosos: boolean
    incluirMetasNaoAtingidas: boolean
    incluirRetornosPendentes: boolean
    scoreMinimo: number
    maxPacientesPorDia: number
  }
  
  exclusoes: {
    pacientesExcluidos: string[]
    diasSemana: number[] // 0-6 (dom-sab)
    horariosProibidos: { inicio: string; fim: string }[]
  }
  
  mensagens: {
    usarTemplates: boolean
    templatesPersonalizados: {
      abandono: string
      retorno: string
      metas: string
      motivacional: string
    }
    permitirEdicaoAnteEnvio: boolean
    incluirAssinatura: boolean
    assinatura: string
  }
  
  canais: {
    prioridade: CanalComunicacao[]
    whatsapp: { ativo: boolean; business: boolean }
    sms: { ativo: boolean; provider: string }
    email: { ativo: boolean; template: string }
  }
  
  automacao: {
    envioAutomatico: boolean
    horarioPreferido: string
    reagendarAutomaticamente: boolean
    followUpAutomatico: boolean
    diasParaFollowUp: number
  }
}

// Configurações de Otimização de Agenda
export interface ConfiguracaoOtimizacao {
  ativo: boolean
  
  criterios: {
    minimizarTempoOcioso: boolean
    agruparConsultasSimilares: boolean
    respeitarPreferenciasPaciente: boolean
    considerarTrafego: boolean
    otimizarParaReceita: boolean
  }
  
  restricoes: {
    horariosFixos: TimeSlot[]
    intervalosObrigatorios: number // minutos entre consultas
    maxConsultasPorDia: number
    diasTrabalho: number[]
  }
  
  tipos: {
    consultaInicial: { duracao: number; preco: number }
    retorno: { duracao: number; preco: number }
    avaliacao: { duracao: number; preco: number }
    online: { duracao: number; preco: number }
  }
}

export interface TimeSlot {
  inicio: string // "HH:MM"
  fim: string // "HH:MM"
  dia?: number // 0-6 se específico
  tipo?: string
}

// Configurações de Relatórios
export interface ConfiguracaoRelatorios {
  ativo: boolean
  
  frequencia: 'semanal' | 'mensal' | 'trimestral' | 'personalizado'
  diaEnvio: number // 1-31 ou 1-7 para semanal
  
  secoes: {
    resumoExecutivo: boolean
    metricasFinanceiras: boolean
    analisesPacientes: boolean
    otimizacaoAgenda: boolean
    comparativoPeriodos: boolean
    insightsIA: boolean
    recomendacoes: boolean
  }
  
  formatos: {
    pdf: boolean
    excel: boolean
    dashboard: boolean
  }
  
  distribuicao: {
    emailAutomatico: boolean
    destinatarios: string[]
    salvarNaNuvem: boolean
    caminhoSalvamento: string
  }
  
  personalizacao: {
    logotipo: string
    cores: { primaria: string; secundaria: string }
    assinatura: string
    observacoes: string
  }
}

// Configurações de Campanhas
export interface ConfiguracaoCampanhas {
  ativo: boolean
  
  triggers: {
    horariosVazios: boolean
    sazanalidade: boolean
    pacientesInativos: boolean
    metasNaoAtingidas: boolean
    datas especiais: boolean
  }
  
  segmentacao: {
    porIdade: { min: number; max: number }
    porPatologia: string[]
    porCategoria: string[]
    porTempoInativo: number
    porValorConsulta: { min: number; max: number }
  }
  
  ofertas: {
    desconto: { tipo: 'percentual' | 'fixo'; valor: number }
    brinde: string
    combo: { descricao: string; valor: number }
    programa: { nome: string; beneficios: string[] }
  }
  
  comunicacao: {
    canais: CanalComunicacao[]
    template: string
    followUp: boolean
    diasFollowUp: number
  }
}

// Configurações Globais do Sistema
export interface ConfiguracoesAcoesRapidas {
  perfil: PerfilPratica
  
  lembretes: ConfiguracaoLembretes
  otimizacao: ConfiguracaoOtimizacao
  relatorios: ConfiguracaoRelatorios
  campanhas: ConfiguracaoCampanhas
  
  geral: {
    permissoes: {
      iaPodefazerAcoesAutomaticas: boolean
      exigirConfirmacaoSempre: boolean
      permitirAgendamentoAcoes: boolean
      logTodasAcoes: boolean
    }
    
    limites: {
      maxAcoesPorDia: number
      maxMensagensPorPacienteMes: number
      intervalMinimoEntreMensagens: number
    }
    
    inteligencia: {
      usarIA: boolean
      scoringPersonalizado: boolean
      aprendendizado: boolean
      compartilharDados: boolean
    }
  }
}

// Resultado de Execução de Ação
export interface ResultadoAcaoRapida {
  id: string
  tipo: TipoAcaoRapida
  dataExecucao: Date
  configuracao: any
  
  resultado: {
    sucesso: boolean
    mensagem: string
    detalhes: any
    
    metricas: {
      pacientesAfetados: number
      mensagensEnviadas: number
      confirmacoes: number
      reagendamentos: number
      receitaGerada?: number
      tempoEconomizado?: number
    }
  }
  
  pacientes: {
    id: string
    nome: string
    acao: string
    resultado: 'enviado' | 'entregue' | 'lido' | 'respondido' | 'erro'
    timestamp: Date
    observacoes?: string
  }[]
}

// Insight gerado pela IA
export interface InsightIA {
  id: string
  tipo: 'oportunidade' | 'alerta' | 'recomendacao' | 'predicao'
  categoria: 'financeiro' | 'operacional' | 'pacientes' | 'agenda'
  titulo: string
  descricao: string
  
  dados: {
    metrica: string
    valor: number
    variacao: number
    contexto: any
  }
  
  acao: {
    sugerida: string
    tipo: TipoAcaoRapida
    configuracao: any
    impactoEstimado: {
      receita?: number
      tempo?: number
      satisfacao?: number
    }
  }
  
  prioridade: PrioridadeContato
  validadeAte: Date
  implementado: boolean
}

// Estado do Sistema de Ações Rápidas
export interface EstadoAcoesRapidas {
  configuracoes: ConfiguracoesAcoesRapidas
  historicoAcoes: ResultadoAcaoRapida[]
  insights: InsightIA[]
  
  estatisticas: {
    totalAcoesExecutadas: number
    pacientesReativados: number
    receitaGerada: number
    tempoEconomizado: number
    taxaSucesso: number
    
    ultimoMes: {
      lembretes: number
      otimizacoes: number
      relatorios: number
      campanhas: number
    }
  }
}

// Props para Modais
export interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: any) => Promise<void>
  tipo: TipoAcaoRapida
  configuracoes: ConfiguracoesAcoesRapidas
  pacientesDisponiveis: PacienteRisco[]
}

// Regra Personalizada
export interface RegraPersonalizada {
  id: string
  nome: string
  descricao: string
  ativa: boolean
  
  condicoes: {
    campo: keyof PacienteRisco | string
    operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contem' | 'nao_contem'
    valor: any
    logico?: 'E' | 'OU'
  }[]
  
  acao: {
    tipo: 'incluir' | 'excluir' | 'priorizar' | 'desprioriozar'
    peso: number
    configuracao?: any
  }
  
  metadados: {
    criadoEm: Date
    ultimoUso?: Date
    vezesUsada: number
    efetividade: number
  }
}