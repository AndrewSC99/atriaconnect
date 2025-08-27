// Tipos para Sistema de Comunicação Real - Fase 3

export interface ConfiguracaoComunicacao {
  // Configurações do WhatsApp Business
  whatsapp: {
    ativo: boolean
    accessToken: string
    phoneNumberId: string
    webhookToken: string
    businessAccountId: string
    apiVersion: string
    templateNamespace: string
  }
  
  // Configurações SMS
  sms: {
    ativo: boolean
    provider: 'twilio' | 'nexmo' | 'aws-sns' | 'custom'
    apiKey: string
    apiSecret: string
    fromNumber: string
    webhook?: string
  }
  
  // Configurações Email
  email: {
    ativo: boolean
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses'
    config: {
      host?: string
      port?: number
      secure?: boolean
      user: string
      password: string
      fromEmail: string
      fromName: string
    }
    trackingEnabled: boolean
  }
  
  // Configurações gerais
  geral: {
    tentativasMaximas: number
    intervaloEntreTentativas: number // em minutos
    timeoutResposta: number // em horas
    horarioFuncionamento: {
      inicio: string
      fim: string
      diasSemana: number[]
    }
    rateLimits: {
      whatsappPorMinuto: number
      smsPorMinuto: number
      emailPorMinuto: number
    }
  }
}

export interface MensagemEnvio {
  id: string
  tipo: 'whatsapp' | 'sms' | 'email'
  destinatario: {
    pacienteId: string
    nome: string
    telefone?: string
    email?: string
    whatsapp?: string
    canalPreferido: 'whatsapp' | 'sms' | 'email'
  }
  
  conteudo: {
    assunto?: string // Para email
    corpo: string
    templateId?: string
    parametros?: Record<string, string>
    anexos?: AnexoMensagem[]
    tipoMidia?: 'texto' | 'imagem' | 'documento' | 'video' | 'audio'
    mediaUrl?: string
  }
  
  configuracao: {
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
    agendarPara?: Date
    expirarEm?: Date
    requireConfirmacao: boolean
    trackingEnabled: boolean
    followUpAutomatico: boolean
    tentativasMaximas: number
  }
  
  contexto: {
    campanhaId?: string
    workflowId?: string
    acaoOrigemId: string
    tipoAcao: 'lembrete' | 'confirmacao' | 'campanha' | 'followup' | 'reativacao'
    tags: string[]
    dadosPersonalizacao: Record<string, any>
  }
  
  // Tracking
  status: 'pendente' | 'enviando' | 'enviado' | 'entregue' | 'lido' | 'respondido' | 'falhado' | 'expirado'
  timestamps: {
    criado: Date
    enviado?: Date
    entregue?: Date
    lido?: Date
    respondido?: Date
    expirado?: Date
  }
  
  resultados: {
    tentativasRealizadas: number
    erro?: string
    codigoErro?: string
    providerId?: string // ID na API externa
    custoEstimado?: number
    entregaConfirmada: boolean
    leituraConfirmada: boolean
  }
}

export interface AnexoMensagem {
  id: string
  nome: string
  tipo: 'pdf' | 'image' | 'doc' | 'video' | 'audio'
  url: string
  tamanho: number
  mimetype: string
}

export interface TemplateMensagem {
  id: string
  nome: string
  categoria: 'lembrete' | 'confirmacao' | 'campanha' | 'boas_vindas' | 'followup' | 'reativacao'
  canais: ('whatsapp' | 'sms' | 'email')[]
  
  conteudo: {
    whatsapp?: {
      corpo: string
      templateName?: string // Para templates aprovados do WhatsApp
      components?: WhatsAppComponent[]
    }
    sms: {
      corpo: string
      maxLength: number
    }
    email: {
      assunto: string
      corpoTexto: string
      corpoHtml: string
      template: string // Nome do template HTML
    }
  }
  
  personalizacao: {
    variaveis: VariavelTemplate[]
    condicoes?: CondicaoTemplate[]
    dinamico: boolean
  }
  
  configuracao: {
    ativo: boolean
    aprovadoWhatsApp: boolean
    dataAprovacao?: Date
    versao: number
    criadoPor: string
    ultimaEdicao: Date
    tags: string[]
  }
  
  performance: {
    totalEnviado: number
    taxaEntrega: number
    taxaLeitura: number
    taxaResposta: number
    taxaConversao: number
    custoMedio: number
    ultimoUso: Date
  }
}

export interface VariavelTemplate {
  nome: string
  tipo: 'texto' | 'numero' | 'data' | 'boolean' | 'lista'
  obrigatorio: boolean
  valorPadrao?: string
  descricao: string
  exemploValor: string
  formatacao?: {
    mascara?: string
    maiusculo?: boolean
    limite?: number
  }
}

export interface CondicaoTemplate {
  campo: string
  operador: '==' | '!=' | '>' | '<' | 'contem' | 'vazio'
  valor: any
  conteudoAlternativo: string
}

export interface WhatsAppComponent {
  type: 'header' | 'body' | 'footer' | 'buttons'
  format?: 'text' | 'image' | 'document' | 'video'
  text?: string
  parameters?: WhatsAppParameter[]
  buttons?: WhatsAppButton[]
}

export interface WhatsAppParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document'
  text?: string
  currency?: { fallback_value: string; code: string; amount_1000: number }
  date_time?: { fallback_value: string }
  image?: { link: string }
  document?: { link: string; filename: string }
}

export interface WhatsAppButton {
  type: 'reply' | 'phone_number' | 'url'
  title: string
  id?: string
  phone_number?: string
  url?: string
}

export interface ConversaUnificada {
  id: string
  pacienteId: string
  canal: 'whatsapp' | 'sms' | 'email'
  status: 'ativa' | 'pausada' | 'encerrada' | 'aguardando_resposta'
  
  participantes: {
    paciente: {
      nome: string
      avatar?: string
      telefone?: string
      email?: string
      ultimaAtividade: Date
      online: boolean
    }
    atendente?: {
      id: string
      nome: string
      avatar?: string
      departamento: string
    }
  }
  
  configuracao: {
    notificacoes: boolean
    respostasAutomaticas: boolean
    escalationAutomatico: boolean
    timeoutResposta: number // em minutos
    prioridadeAtendimento: 'baixa' | 'normal' | 'alta' | 'urgente'
    tagsPersonalizadas: string[]
  }
  
  estatisticas: {
    totalMensagens: number
    mensagensEnviadas: number
    mensagensRecebidas: number
    tempoMedioResposta: number // em minutos
    ultimaMensagem: Date
    primeiraInteracao: Date
    conversasAnteriores: number
  }
  
  contexto: {
    origemContato: 'campanha' | 'lembrete' | 'agendamento' | 'suporte' | 'espontaneo'
    campanhaId?: string
    workflowId?: string
    consultaRelacionada?: string
    assuntosPrincipais: string[]
    sentimentoGeral: 'positivo' | 'neutro' | 'negativo'
  }
}

export interface MensagemConversa {
  id: string
  conversaId: string
  tipo: 'enviada' | 'recebida' | 'sistema'
  
  remetente: {
    tipo: 'paciente' | 'atendente' | 'sistema' | 'bot'
    id: string
    nome: string
  }
  
  conteudo: {
    texto?: string
    midia?: {
      tipo: 'imagem' | 'documento' | 'audio' | 'video' | 'sticker'
      url: string
      nome?: string
      tamanho?: number
      mimetype: string
      thumbnail?: string
    }
    localizacao?: {
      latitude: number
      longitude: number
      endereco?: string
    }
    contato?: {
      nome: string
      telefone: string
    }
  }
  
  metadata: {
    timestamp: Date
    entregue?: Date
    lida?: Date
    editada?: Date
    excluida?: Date
    reencaminhada: boolean
    respondendoA?: string // ID da mensagem que está respondendo
    mencoes?: string[]
    hashtags?: string[]
  }
  
  processamento: {
    analisadoPorIA: boolean
    sentimento?: 'positivo' | 'neutro' | 'negativo'
    intencao?: string[]
    entidadesDetectadas?: EntidadeDetectada[]
    respostasSugeridas?: string[]
    acaoSugerida?: AcaoSugerida
  }
}

export interface EntidadeDetectada {
  tipo: 'pessoa' | 'data' | 'horario' | 'procedimento' | 'sintoma' | 'medicamento'
  valor: string
  confianca: number
  posicao: { inicio: number; fim: number }
}

export interface AcaoSugerida {
  tipo: 'agendar_consulta' | 'enviar_informacao' | 'escalar_atendente' | 'criar_lembrete'
  prioridade: number
  parametros: Record<string, any>
  confianca: number
}

export interface CanalComunicacao {
  id: string
  tipo: 'whatsapp' | 'sms' | 'email'
  nome: string
  ativo: boolean
  configuracao: ConfiguracaoComunicacao[keyof ConfiguracaoComunicacao]
  
  estatisticas: {
    mensagensEnviadas24h: number
    mensagensRecebidas24h: number
    taxaEntrega: number
    taxaLeitura: number
    taxaResposta: number
    tempoMedioEntrega: number // em segundos
    custoMedio: number
    ultimoEnvio: Date
    status: 'online' | 'offline' | 'limitado' | 'erro'
  }
  
  limites: {
    mensagensPorMinuto: number
    mensagensPorDia: number
    custoDiarioMaximo: number
    tamanhnoMaximoMensagem: number
    tiposMediaSuportados: string[]
  }
  
  webhooks: {
    urlEntrega: string
    urlLeitura: string
    urlResposta: string
    urlStatus: string
    secretToken: string
    ativo: boolean
  }
}

export interface AnalyticsComunicacao {
  periodo: {
    inicio: Date
    fim: Date
  }
  
  metricas: {
    totalEnviado: number
    totalEntregue: number
    totalLido: number
    totalRespondido: number
    taxaEntrega: number
    taxaLeitura: number
    taxaResposta: number
    taxaConversao: number
    custoTotal: number
    custoPorMensagem: number
    custoPorConversao: number
    tempoMedioResposta: number
  }
  
  porCanal: {
    [canal: string]: {
      enviado: number
      entregue: number
      lido: number
      respondido: number
      custo: number
      performance: number // score 0-100
    }
  }
  
  porTemplate: {
    [templateId: string]: {
      nome: string
      enviado: number
      performance: number
      conversoes: number
      custo: number
    }
  }
  
  porSegmento: {
    [segmento: string]: {
      pacientes: number
      enviado: number
      taxa_resposta: number
      roi: number
    }
  }
  
  tendencias: {
    melhoresHorarios: { hora: number; taxa_resposta: number }[]
    melhoresDias: { dia: number; taxa_resposta: number }[]
    padroesSazonais: { mes: number; performance: number }[]
  }
  
  insights: {
    melhorCanal: string
    melhorTemplate: string
    melhorHorario: string
    recomendacoes: string[]
    alertas: string[]
  }
}

export interface CampanhaComunicacao {
  id: string
  nome: string
  descricao: string
  status: 'rascunho' | 'agendada' | 'executando' | 'pausada' | 'concluida' | 'cancelada'
  
  configuracao: {
    canais: ('whatsapp' | 'sms' | 'email')[]
    templateId: string
    segmentoAlvo: string[]
    dataInicio: Date
    dataFim?: Date
    horarioEnvio: string
    fusoHorario: string
    rateLimitCustom?: number
  }
  
  publico: {
    totalPacientes: number
    segmentos: string[]
    filtros: Record<string, any>
    exclusoes: string[]
    pacientesElegiveis: number
  }
  
  execucao: {
    iniciadaEm?: Date
    finalizadaEm?: Date
    pacientesProcessados: number
    mensagensEnviadas: number
    errosEncontrados: number
    percentualConclusao: number
    tempoEstimadoRestante?: number // em minutos
  }
  
  resultados: {
    entregues: number
    lidas: number
    respondidas: number
    conversoes: number
    custoTotal: number
    roi: number
    taxaConversao: number
    melhorCanal: string
    feedbackRecebido: number
  }
  
  ab_testing?: {
    ativo: boolean
    variantes: {
      nome: string
      templateId: string
      percentual: number
      resultados: {
        enviados: number
        conversoes: number
        taxa_conversao: number
      }
    }[]
    vencedor?: string
    confiancaEstatistica: number
  }
}

export interface EventoWebhook {
  id: string
  tipo: 'entrega' | 'leitura' | 'resposta' | 'status' | 'erro'
  canal: 'whatsapp' | 'sms' | 'email'
  timestamp: Date
  
  dados: {
    mensagemId: string
    pacienteId: string
    status: string
    erro?: string
    providerId?: string
    metadata: Record<string, any>
  }
  
  processamento: {
    processado: boolean
    tentativas: number
    proximaTentativa?: Date
    erro?: string
  }
}

// Estado do sistema de comunicação
export interface EstadoSistemaComunicacao {
  status: 'ativo' | 'manutencao' | 'limitado' | 'erro'
  
  canais: {
    whatsapp: {
      conectado: boolean
      ultimaVerificacao: Date
      limitesAtuais: {
        mensagensPorMinuto: number
        mensagensRestantes: number
        resetaEm: Date
      }
      errosRecentes: number
    }
    sms: {
      conectado: boolean
      providerStatus: string
      creditos: number
      ultimaVerificacao: Date
    }
    email: {
      conectado: boolean
      reputacaoSender: number
      blacklistStatus: boolean
      ultimaVerificacao: Date
    }
  }
  
  filaEnvios: {
    pendentes: number
    enviando: number
    falhados: number
    agendados: number
    proximoEnvio?: Date
  }
  
  performance: {
    mensagensUltimas24h: number
    taxaErroGeral: number
    tempoMedioProcessamento: number
    custoDiario: number
  }
  
  alertas: {
    tipo: 'limite_atingido' | 'falha_conexao' | 'taxa_erro_alta' | 'custo_alto'
    canal?: string
    mensagem: string
    timestamp: Date
    severidade: 'info' | 'warning' | 'error' | 'critical'
    resolvido: boolean
  }[]
}