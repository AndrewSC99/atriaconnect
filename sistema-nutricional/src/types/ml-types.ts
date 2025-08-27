// Tipos para Sistema de Machine Learning e Inteligência Avançada

export interface FeedbackAcao {
  id: string
  acaoId: string
  tipoAcao: string
  timestamp: Date
  
  // Dados da ação executada
  input: {
    pacientesSelecionados: string[]
    configuracao: any
    contexto: any
  }
  
  // Resultados observados
  output: {
    mensagensEnviadas: number
    entregues: number
    lidas: number
    respondidas: number
    reagendamentos: number
    cancelamentos: number
    receitaGerada: number
    tempoDecorrido: number // em horas até primeira resposta
  }
  
  // Feedback do usuário
  avaliacaoUsuario?: {
    efetividade: number // 1-5
    precisaoIA: number // 1-5  
    comentarios: string
    melhoriasSugeridas: string[]
  }
  
  // Métricas calculadas
  metricas: {
    taxaConversao: number
    roi: number
    satisfacaoEstimada: number
    acuraciaPredicao: number
  }
}

export interface PadraoComportamento {
  id: string
  tipo: 'temporal' | 'demografico' | 'comportamental' | 'sazonal'
  
  // Padrão identificado
  padrao: {
    nome: string
    descricao: string
    confianca: number // 0-1
    frequencia: number
    ultimaOcorrencia: Date
  }
  
  // Dados do padrão
  dados: {
    horarios?: string[]
    diasSemana?: number[]
    idades?: { min: number; max: number }
    categorias?: string[]
    valores?: { min: number; max: number }
    sazonalidade?: 'verão' | 'inverno' | 'inicio_ano' | 'fim_ano'
  }
  
  // Ações sugeridas baseadas no padrão
  acoesSugeridas: {
    tipo: string
    configuracao: any
    impactoEstimado: number
    prioridade: number
  }[]
  
  // Performance histórica
  performance: {
    vezesAplicado: number
    sucessoMedio: number
    roiMedio: number
    ultimaAplicacao?: Date
  }
}

export interface ModeloML {
  id: string
  nome: string
  tipo: 'classificacao' | 'regressao' | 'clustering' | 'time_series'
  objetivo: string
  
  // Configuração do modelo
  configuracao: {
    algoritmo: 'random_forest' | 'neural_network' | 'linear_regression' | 'k_means'
    parametros: Record<string, any>
    features: string[]
    target: string
  }
  
  // Estado do treinamento
  treinamento: {
    status: 'nao_treinado' | 'treinando' | 'treinado' | 'erro'
    dataUltimoTreino?: Date
    acuracia?: number
    loss?: number
    epochsExecutadas?: number
    tempoTreino?: number
  }
  
  // Dados de performance
  performance: {
    precisao: number
    recall: number
    f1Score: number
    acuracia: number
    predicoesCertas: number
    predicoesTotais: number
  }
  
  // Historico de versões
  versoes: {
    versao: string
    data: Date
    acuracia: number
    mudancas: string[]
  }[]
}

export interface PredicaoIA {
  id: string
  modelo: string
  timestamp: Date
  
  // Input da predição
  input: {
    pacienteId?: string
    contexto: Record<string, any>
    features: Record<string, number>
  }
  
  // Output da predição
  predicao: {
    valor: number
    probabilidade: number
    confianca: number
    categoria?: string
    explicacao: string[]
  }
  
  // Validação posterior
  validacao?: {
    resultadoReal: any
    acertou: boolean
    diferencaPercentual?: number
    feedbackColetado: Date
  }
}

export interface WorkflowInteligente {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  
  // Triggers inteligentes
  triggers: {
    tipo: 'temporal' | 'evento' | 'condicao' | 'pattern'
    configuracao: {
      cronExpression?: string // Para triggers temporais
      evento?: string // Para triggers de evento
      condicoes?: LogicalCondition[]
      padrao?: string // ID do padrão detectado
    }
    ultimaExecucao?: Date
    proximaExecucao?: Date
  }[]
  
  // Condições inteligentes
  condicoes: SmartCondition[]
  
  // Ações a executar
  acoes: AutomatedAction[]
  
  // Aprendizado
  aprendizado: {
    ativo: boolean
    autoAjuste: boolean
    parametrosAjustaveis: string[]
    historico: {
      data: Date
      ajuste: string
      motivacao: string
      resultado: number
    }[]
  }
  
  // Performance
  performance: {
    execucoes: number
    sucessos: number
    falhas: number
    taxaSucesso: number
    impactoMedio: number
    roiMedio: number
    tempoMedioExecucao: number
  }
}

export interface SmartCondition {
  id: string
  tipo: 'comparacao' | 'ml_predicao' | 'pattern_match' | 'tempo'
  
  configuracao: {
    // Para comparação simples
    campo?: string
    operador?: '>' | '<' | '=' | '!=' | 'contem' | 'regex'
    valor?: any
    
    // Para predições ML
    modelo?: string
    threshold?: number
    confiancaMinima?: number
    
    // Para pattern matching
    padrao?: string
    similaridadeMinima?: number
    
    // Para condições temporais
    horario?: { inicio: string; fim: string }
    diasSemana?: number[]
    sazonalidade?: string
  }
  
  logico?: 'E' | 'OU' | 'NAO'
  peso: number // Para condições ponderadas
}

export interface AutomatedAction {
  id: string
  tipo: 'enviar_mensagem' | 'criar_campanha' | 'agendar_consulta' | 'gerar_relatorio' | 'ajustar_configuracao'
  
  configuracao: {
    // Para envio de mensagens
    canal?: 'whatsapp' | 'sms' | 'email'
    template?: string
    personalizacao?: Record<string, string>
    
    // Para campanhas
    segmento?: string
    ofertas?: any
    duracao?: number
    
    // Para agendamentos
    horarios?: string[]
    tipo_consulta?: string
    
    // Para ajustes automáticos
    parametro?: string
    novoValor?: any
    motivacao?: string
  }
  
  // Condições de execução
  condicoes?: SmartCondition[]
  
  // Configurações de retry
  retry: {
    tentativas: number
    intervalo: number // em minutos
    condicaoParada?: SmartCondition
  }
}

export interface InsightAvancado {
  id: string
  tipo: 'predicao' | 'anomalia' | 'oportunidade' | 'risco' | 'otimizacao'
  categoria: 'pacientes' | 'agenda' | 'financeiro' | 'operacional'
  
  // Dados do insight
  insight: {
    titulo: string
    descricao: string
    confianca: number // 0-1
    impactoEstimado: number
    urgencia: 'baixa' | 'media' | 'alta' | 'critica'
    validadeAte: Date
  }
  
  // Evidências (dados que suportam o insight)
  evidencias: {
    tipo: 'dados' | 'padrao' | 'predicao' | 'comparativo'
    descricao: string
    dados: any
    peso: number
  }[]
  
  // Ações recomendadas
  recomendacoes: {
    acao: string
    configuracao: any
    impactoEstimado: number
    esforcoEstimado: number
    prioridade: number
    automavel: boolean
  }[]
  
  // Tracking de implementação
  implementacao?: {
    implementado: boolean
    dataImplementacao?: Date
    resultadoReal?: any
    efetividade?: number
    comentarios?: string
  }
}

export interface ConfiguracaoML {
  // Configurações gerais
  geral: {
    coletarFeedback: boolean
    retreinarAutomaticamente: boolean
    intervalوReTreino: number // em dias
    minDadosParaTreino: number
    backupModelos: boolean
  }
  
  // Configurações por modelo
  modelos: {
    [modeloId: string]: {
      ativo: boolean
      autoTune: boolean
      parametrosCustom: Record<string, any>
      scheduleTreino?: string
      validacaoCruzada: boolean
    }
  }
  
  // Configurações de feedback
  feedback: {
    solicitarAvaliacaoUsuario: boolean
    coletarMetricasAutomaticamente: boolean
    analisarPadroesComportamento: boolean
    gerarInsightsAutomaticos: boolean
  }
  
  // Configurações de privacy
  privacy: {
    anonimizarDados: boolean
    retencaoDados: number // em dias
    compartilharDadosAgregados: boolean
    logTodasPredicoes: boolean
  }
}

// Estado do sistema ML
export interface EstadoSistemaML {
  status: 'inicializando' | 'ativo' | 'treinando' | 'erro'
  
  // Estatísticas gerais
  estatisticas: {
    totalFeedbacks: number
    totalPredicoes: number
    acuraciaGeral: number
    padrzoesDetectados: number
    workflowsAtivos: number
    ultimoTreino: Date
  }
  
  // Performance por funcionalidade
  performance: {
    [funcionalidade: string]: {
      predicoes: number
      acertos: number
      taxa_acerto: number
      tempo_resposta_medio: number
    }
  }
  
  // Alertas do sistema
  alertas: {
    tipo: 'performance' | 'dados' | 'modelo' | 'sistema'
    mensagem: string
    severidade: 'info' | 'warning' | 'error' | 'critical'
    timestamp: Date
    resolvido: boolean
  }[]
  
  // Configuração atual
  configuracao: ConfiguracaoML
}

export interface AnaliseComparativa {
  id: string
  periodo: { inicio: Date; fim: Date }
  
  // Dados comparativos
  metricas: {
    antes: {
      lembretes: { enviados: number; conversao: number; roi: number }
      agenda: { ocupacao: number; no_shows: number; eficiencia: number }
      receita: { total: number; crescimento: number; ticket_medio: number }
    }
    
    depois: {
      lembretes: { enviados: number; conversao: number; roi: number }
      agenda: { ocupacao: number; no_shows: number; eficiencia: number }
      receita: { total: number; crescimento: number; ticket_medio: number }
    }
    
    melhoria: {
      lembretes: { conversao_delta: number; roi_delta: number }
      agenda: { ocupacao_delta: number; eficiencia_delta: number }
      receita: { crescimento_delta: number; impacto_total: number }
    }
  }
  
  // Análise qualitativa
  analise: {
    pontos_fortes: string[]
    areas_melhoria: string[]
    recomendacoes: string[]
    proximosPassos: string[]
  }
}

export interface LogicalCondition {
  campo: string
  operador: '>' | '<' | '=' | '!=' | 'contem' | 'regex'
  valor: any
  logico?: 'E' | 'OU'
}