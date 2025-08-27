// Sistema de Tracking de Mensagens - Monitoramento unificado - Fase 3

import { 
  MensagemEnvio, 
  EventoWebhook,
  AnalyticsComunicacao,
  ConfiguracaoComunicacao
} from '@/types/communication-types'
import { WhatsAppService } from './whatsapp-service'
import { SMSService } from './sms-service'
import { EmailService } from './email-service'

export interface StatusMensagemUnificado {
  id: string
  canal: 'whatsapp' | 'sms' | 'email'
  pacienteId: string
  pacienteNome: string
  status: 'pendente' | 'enviando' | 'enviado' | 'entregue' | 'lido' | 'respondido' | 'falhado' | 'expirado'
  
  timestamps: {
    criado: Date
    enviado?: Date
    entregue?: Date
    lido?: Date
    respondido?: Date
    expirado?: Date
    ultimaAtualizacao: Date
  }
  
  detalhes: {
    assunto?: string
    conteudo: string
    providerId?: string
    tentativasRealizadas: number
    custoReal?: number
    erro?: string
    codigoErro?: string
  }
  
  metricas: {
    tempoEntrega?: number // em segundos
    tempoLeitura?: number // em segundos
    tempoResposta?: number // em segundos
    segmentosMensagem?: number
    taxaConversao?: number
  }
  
  contexto: {
    campanhaId?: string
    workflowId?: string
    tipoAcao: string
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
    tags: string[]
  }
}

export interface FilaMensagem {
  id: string
  mensagem: MensagemEnvio
  prioridade: number
  tentativa: number
  proximaTentativa: Date
  status: 'aguardando' | 'processando' | 'falhou' | 'concluido'
  erro?: string
}

export class MessageTracker {
  private mensagens: Map<string, StatusMensagemUnificado> = new Map()
  private filaEnvios: FilaMensagem[] = []
  private processandoFila = false
  private services: {
    whatsapp?: WhatsAppService
    sms?: SMSService
    email?: EmailService
  } = {}
  
  private metricas: {
    enviadosUltimas24h: Map<string, number>
    entreguesUltimas24h: Map<string, number>
    lidosUltimas24h: Map<string, number>
    respondidosUltimas24h: Map<string, number>
    custosUltimas24h: Map<string, number>
  } = {
    enviadosUltimas24h: new Map(),
    entreguesUltimas24h: new Map(),
    lidosUltimas24h: new Map(),
    respondidosUltimas24h: new Map(),
    custosUltimas24h: new Map()
  }

  constructor(config: ConfiguracaoComunicacao) {
    this.inicializarServices(config)
    this.iniciarProcessamentoFila()
    this.iniciarLimpezaMetricas()
  }

  private inicializarServices(config: ConfiguracaoComunicacao): void {
    if (config.whatsapp.ativo) {
      this.services.whatsapp = new WhatsAppService(config.whatsapp)
    }
    
    if (config.sms.ativo) {
      this.services.sms = new SMSService(config.sms)
    }
    
    if (config.email.ativo) {
      this.services.email = new EmailService(config.email)
    }
  }

  // Adicionar mensagem à fila de envio
  async adicionarMensagemFila(mensagem: MensagemEnvio): Promise<string> {
    const filaMensagem: FilaMensagem = {
      id: mensagem.id,
      mensagem,
      prioridade: this.calcularPrioridade(mensagem),
      tentativa: 0,
      proximaTentativa: mensagem.configuracao.agendarPara || new Date(),
      status: 'aguardando'
    }

    // Inserir na fila respeitando prioridade
    const indice = this.filaEnvios.findIndex(f => f.prioridade < filaMensagem.prioridade)
    if (indice === -1) {
      this.filaEnvios.push(filaMensagem)
    } else {
      this.filaEnvios.splice(indice, 0, filaMensagem)
    }

    // Criar status inicial de tracking
    await this.criarStatusMensagem(mensagem)

    return mensagem.id
  }

  // Processar mensagem específica
  async processarMensagem(mensagemId: string): Promise<{
    sucesso: boolean
    erro?: string
    providerId?: string
  }> {
    const statusMensagem = this.mensagens.get(mensagemId)
    if (!statusMensagem) {
      throw new Error(`Mensagem ${mensagemId} não encontrada`)
    }

    const mensagemFila = this.filaEnvios.find(f => f.id === mensagemId)
    if (!mensagemFila) {
      throw new Error(`Mensagem ${mensagemId} não está na fila`)
    }

    try {
      mensagemFila.status = 'processando'
      statusMensagem.status = 'enviando'
      statusMensagem.timestamps.ultimaAtualizacao = new Date()

      const resultado = await this.enviarMensagem(mensagemFila.mensagem)

      if (resultado.sucesso) {
        statusMensagem.status = 'enviado'
        statusMensagem.timestamps.enviado = new Date()
        statusMensagem.detalhes.providerId = resultado.providerId
        statusMensagem.detalhes.custoReal = resultado.custoEstimado
        mensagemFila.status = 'concluido'

        // Atualizar métricas
        this.atualizarMetricas(statusMensagem.canal, 'enviado', resultado.custoEstimado || 0)
      } else {
        mensagemFila.tentativa++
        mensagemFila.erro = resultado.erro
        
        if (mensagemFila.tentativa >= mensagemFila.mensagem.configuracao.tentativasMaximas) {
          statusMensagem.status = 'falhado'
          statusMensagem.detalhes.erro = resultado.erro
          mensagemFila.status = 'falhou'
        } else {
          statusMensagem.status = 'pendente'
          mensagemFila.status = 'aguardando'
          mensagemFila.proximaTentativa = new Date(Date.now() + (5 * 60 * 1000)) // 5 minutos
        }
      }

      statusMensagem.detalhes.tentativasRealizadas = mensagemFila.tentativa
      statusMensagem.timestamps.ultimaAtualizacao = new Date()

      return resultado

    } catch (error) {
      mensagemFila.status = 'falhou'
      statusMensagem.status = 'falhado'
      statusMensagem.detalhes.erro = error instanceof Error ? error.message : 'Erro desconhecido'
      statusMensagem.timestamps.ultimaAtualizacao = new Date()

      return {
        sucesso: false,
        erro: statusMensagem.detalhes.erro
      }
    }
  }

  // Processar webhook de status
  async processarWebhook(canal: 'whatsapp' | 'sms' | 'email', dadosWebhook: any): Promise<void> {
    const service = this.services[canal]
    if (!service) {
      console.warn(`Serviço ${canal} não configurado`)
      return
    }

    let eventos: EventoWebhook[] = []

    try {
      // Processar webhook específico do canal
      switch (canal) {
        case 'whatsapp':
          if (this.services.whatsapp) {
            eventos = await this.services.whatsapp.processarWebhook(dadosWebhook)
          }
          break
        case 'sms':
          if (this.services.sms) {
            eventos = await this.services.sms.processarWebhook(dadosWebhook)
          }
          break
        case 'email':
          if (this.services.email) {
            eventos = await this.services.email.processarWebhook(dadosWebhook)
          }
          break
      }

      // Processar cada evento
      for (const evento of eventos) {
        await this.processarEventoWebhook(evento)
      }

    } catch (error) {
      console.error(`Erro ao processar webhook ${canal}:`, error)
    }
  }

  // Obter status de mensagem específica
  obterStatusMensagem(mensagemId: string): StatusMensagemUnificado | null {
    return this.mensagens.get(mensagemId) || null
  }

  // Listar mensagens com filtros
  listarMensagens(filtros: {
    canal?: 'whatsapp' | 'sms' | 'email'
    status?: StatusMensagemUnificado['status']
    pacienteId?: string
    campanhaId?: string
    dataInicio?: Date
    dataFim?: Date
    limite?: number
  } = {}): StatusMensagemUnificado[] {
    let mensagens = Array.from(this.mensagens.values())

    // Aplicar filtros
    if (filtros.canal) {
      mensagens = mensagens.filter(m => m.canal === filtros.canal)
    }

    if (filtros.status) {
      mensagens = mensagens.filter(m => m.status === filtros.status)
    }

    if (filtros.pacienteId) {
      mensagens = mensagens.filter(m => m.pacienteId === filtros.pacienteId)
    }

    if (filtros.campanhaId) {
      mensagens = mensagens.filter(m => m.contexto.campanhaId === filtros.campanhaId)
    }

    if (filtros.dataInicio) {
      mensagens = mensagens.filter(m => m.timestamps.criado >= filtros.dataInicio!)
    }

    if (filtros.dataFim) {
      mensagens = mensagens.filter(m => m.timestamps.criado <= filtros.dataFim!)
    }

    // Ordenar por data de criação (mais recente primeiro)
    mensagens.sort((a, b) => b.timestamps.criado.getTime() - a.timestamps.criado.getTime())

    // Aplicar limite
    if (filtros.limite) {
      mensagens = mensagens.slice(0, filtros.limite)
    }

    return mensagens
  }

  // Obter estatísticas da fila
  obterStatusFila(): {
    aguardando: number
    processando: number
    falhas: number
    proximoProcessamento?: Date
    tempoMedioProcessamento: number
  } {
    const estatisticas = {
      aguardando: this.filaEnvios.filter(f => f.status === 'aguardando').length,
      processando: this.filaEnvios.filter(f => f.status === 'processando').length,
      falhas: this.filaEnvios.filter(f => f.status === 'falhou').length,
      proximoProcessamento: undefined as Date | undefined,
      tempoMedioProcessamento: 0
    }

    // Próximo processamento
    const proximasMensagens = this.filaEnvios
      .filter(f => f.status === 'aguardando')
      .sort((a, b) => a.proximaTentativa.getTime() - b.proximaTentativa.getTime())

    if (proximasMensagens.length > 0) {
      estatisticas.proximoProcessamento = proximasMensagens[0].proximaTentativa
    }

    // Tempo médio de processamento (simulado)
    estatisticas.tempoMedioProcessamento = 2.5 // segundos

    return estatisticas
  }

  // Gerar analytics de comunicação
  gerarAnalytics(periodo: { inicio: Date; fim: Date }): AnalyticsComunicacao {
    const mensagensPeriodo = Array.from(this.mensagens.values()).filter(m => 
      m.timestamps.criado >= periodo.inicio && m.timestamps.criado <= periodo.fim
    )

    const totalEnviado = mensagensPeriodo.length
    const totalEntregue = mensagensPeriodo.filter(m => ['entregue', 'lido', 'respondido'].includes(m.status)).length
    const totalLido = mensagensPeriodo.filter(m => ['lido', 'respondido'].includes(m.status)).length
    const totalRespondido = mensagensPeriodo.filter(m => m.status === 'respondido').length

    const custoTotal = mensagensPeriodo.reduce((soma, m) => soma + (m.detalhes.custoReal || 0), 0)

    const porCanal = this.calcularMetricasPorCanal(mensagensPeriodo)
    const tendencias = this.calcularTendencias(mensagensPeriodo)

    return {
      periodo,
      metricas: {
        totalEnviado,
        totalEntregue,
        totalLido,
        totalRespondido,
        taxaEntrega: totalEnviado > 0 ? totalEntregue / totalEnviado : 0,
        taxaLeitura: totalEntregue > 0 ? totalLido / totalEntregue : 0,
        taxaResposta: totalLido > 0 ? totalRespondido / totalLido : 0,
        taxaConversao: totalEnviado > 0 ? totalRespondido / totalEnviado : 0,
        custoTotal,
        custoPorMensagem: totalEnviado > 0 ? custoTotal / totalEnviado : 0,
        custoPorConversao: totalRespondido > 0 ? custoTotal / totalRespondido : 0,
        tempoMedioResposta: this.calcularTempoMedioResposta(mensagensPeriodo)
      },
      porCanal,
      porTemplate: this.calcularMetricasPorTemplate(mensagensPeriodo),
      porSegmento: this.calcularMetricasPorSegmento(mensagensPeriodo),
      tendencias,
      insights: this.gerarInsights(mensagensPeriodo, porCanal, tendencias)
    }
  }

  // Métodos privados
  private async criarStatusMensagem(mensagem: MensagemEnvio): Promise<void> {
    const status: StatusMensagemUnificado = {
      id: mensagem.id,
      canal: mensagem.tipo,
      pacienteId: mensagem.destinatario.pacienteId,
      pacienteNome: mensagem.destinatario.nome,
      status: 'pendente',
      
      timestamps: {
        criado: new Date(),
        ultimaAtualizacao: new Date()
      },
      
      detalhes: {
        assunto: mensagem.conteudo.assunto,
        conteudo: mensagem.conteudo.corpo.substring(0, 200) + (mensagem.conteudo.corpo.length > 200 ? '...' : ''),
        tentativasRealizadas: 0
      },
      
      metricas: {
        segmentosMensagem: mensagem.tipo === 'sms' ? Math.ceil(mensagem.conteudo.corpo.length / 160) : 1
      },
      
      contexto: {
        campanhaId: mensagem.contexto.campanhaId,
        workflowId: mensagem.contexto.workflowId,
        tipoAcao: mensagem.contexto.tipoAcao,
        prioridade: mensagem.configuracao.prioridade,
        tags: mensagem.contexto.tags
      }
    }

    this.mensagens.set(mensagem.id, status)
  }

  private calcularPrioridade(mensagem: MensagemEnvio): number {
    const prioridades = {
      'baixa': 1,
      'normal': 2,
      'alta': 3,
      'urgente': 4
    }
    return prioridades[mensagem.configuracao.prioridade] || 2
  }

  private async enviarMensagem(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    providerId?: string
    erro?: string
    custoEstimado?: number
  }> {
    switch (mensagem.tipo) {
      case 'whatsapp':
        if (!this.services.whatsapp) {
          throw new Error('WhatsApp não configurado')
        }
        
        if (mensagem.conteudo.mediaUrl) {
          return this.services.whatsapp.enviarMidia(mensagem)
        } else if (mensagem.conteudo.templateId) {
          return this.services.whatsapp.enviarMensagemTemplate(mensagem)
        } else {
          return this.services.whatsapp.enviarMensagemTexto(mensagem)
        }

      case 'sms':
        if (!this.services.sms) {
          throw new Error('SMS não configurado')
        }
        
        const resultadoSMS = await this.services.sms.enviarSMS(mensagem)
        return {
          sucesso: resultadoSMS.sucesso,
          providerId: resultadoSMS.providerId,
          erro: resultadoSMS.erro,
          custoEstimado: resultadoSMS.custoEstimado
        }

      case 'email':
        if (!this.services.email) {
          throw new Error('Email não configurado')
        }
        
        const resultadoEmail = await this.services.email.enviarEmail(mensagem)
        return {
          sucesso: resultadoEmail.sucesso,
          providerId: resultadoEmail.messageId,
          erro: resultadoEmail.erro,
          custoEstimado: resultadoEmail.custoEstimado
        }

      default:
        throw new Error(`Canal ${mensagem.tipo} não suportado`)
    }
  }

  private async processarEventoWebhook(evento: EventoWebhook): Promise<void> {
    const mensagem = this.encontrarMensagemPorProviderId(evento.dados.providerId)
    if (!mensagem) {
      console.warn(`Mensagem não encontrada para providerId: ${evento.dados.providerId}`)
      return
    }

    const agora = new Date()

    // Atualizar status baseado no tipo de evento
    switch (evento.tipo) {
      case 'entrega':
        if (mensagem.status === 'enviado') {
          mensagem.status = 'entregue'
          mensagem.timestamps.entregue = agora
          mensagem.metricas.tempoEntrega = this.calcularDiferenca(mensagem.timestamps.enviado!, agora)
          this.atualizarMetricas(mensagem.canal, 'entregue', 0)
        }
        break

      case 'leitura':
        if (['enviado', 'entregue'].includes(mensagem.status)) {
          mensagem.status = 'lido'
          mensagem.timestamps.lido = agora
          
          if (mensagem.timestamps.entregue) {
            mensagem.metricas.tempoLeitura = this.calcularDiferenca(mensagem.timestamps.entregue, agora)
          }
          
          this.atualizarMetricas(mensagem.canal, 'lido', 0)
        }
        break

      case 'resposta':
        if (['enviado', 'entregue', 'lido'].includes(mensagem.status)) {
          mensagem.status = 'respondido'
          mensagem.timestamps.respondido = agora
          
          if (mensagem.timestamps.enviado) {
            mensagem.metricas.tempoResposta = this.calcularDiferenca(mensagem.timestamps.enviado, agora)
          }
          
          this.atualizarMetricas(mensagem.canal, 'respondido', 0)
        }
        break

      case 'erro':
        mensagem.status = 'falhado'
        mensagem.detalhes.erro = evento.dados.erro || 'Erro desconhecido'
        mensagem.detalhes.codigoErro = evento.dados.status
        break
    }

    mensagem.timestamps.ultimaAtualizacao = agora

    // Marcar evento como processado
    evento.processamento.processado = true
  }

  private encontrarMensagemPorProviderId(providerId?: string): StatusMensagemUnificado | null {
    if (!providerId) return null
    
    return Array.from(this.mensagens.values())
      .find(m => m.detalhes.providerId === providerId) || null
  }

  private calcularDiferenca(inicio: Date, fim: Date): number {
    return Math.floor((fim.getTime() - inicio.getTime()) / 1000) // em segundos
  }

  private atualizarMetricas(canal: string, tipo: string, custo: number): void {
    const chave = `${canal}_${tipo}`
    const agora = new Date()
    const timestamp = agora.toISOString().split('T')[0] // YYYY-MM-DD

    // Atualizar contadores
    switch (tipo) {
      case 'enviado':
        this.incrementarMetrica(this.metricas.enviadosUltimas24h, chave)
        break
      case 'entregue':
        this.incrementarMetrica(this.metricas.entreguesUltimas24h, chave)
        break
      case 'lido':
        this.incrementarMetrica(this.metricas.lidosUltimas24h, chave)
        break
      case 'respondido':
        this.incrementarMetrica(this.metricas.respondidosUltimas24h, chave)
        break
    }

    // Atualizar custos
    if (custo > 0) {
      const custoAtual = this.metricas.custosUltimas24h.get(chave) || 0
      this.metricas.custosUltimas24h.set(chave, custoAtual + custo)
    }
  }

  private incrementarMetrica(mapa: Map<string, number>, chave: string): void {
    const valorAtual = mapa.get(chave) || 0
    mapa.set(chave, valorAtual + 1)
  }

  private iniciarProcessamentoFila(): void {
    setInterval(async () => {
      if (this.processandoFila) return

      this.processandoFila = true
      
      try {
        const agora = new Date()
        const mensagensParaProcessar = this.filaEnvios.filter(f => 
          f.status === 'aguardando' && f.proximaTentativa <= agora
        )

        for (const mensagem of mensagensParaProcessar.slice(0, 5)) { // Processar máximo 5 por vez
          await this.processarMensagem(mensagem.id)
          
          // Pausa entre envios para rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error('Erro no processamento da fila:', error)
      } finally {
        this.processandoFila = false
      }
    }, 5000) // A cada 5 segundos
  }

  private iniciarLimpezaMetricas(): void {
    setInterval(() => {
      // Limpar métricas antigas (> 24h)
      const limite24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      // Em produção, implementaria lógica mais sofisticada de limpeza
      console.log('Limpeza de métricas executada')
    }, 60 * 60 * 1000) // A cada hora
  }

  private calcularMetricasPorCanal(mensagens: StatusMensagemUnificado[]): Record<string, any> {
    const canais = ['whatsapp', 'sms', 'email']
    const resultado: Record<string, any> = {}

    for (const canal of canais) {
      const mensagensCanal = mensagens.filter(m => m.canal === canal)
      const enviado = mensagensCanal.length
      const entregue = mensagensCanal.filter(m => ['entregue', 'lido', 'respondido'].includes(m.status)).length
      const custo = mensagensCanal.reduce((soma, m) => soma + (m.detalhes.custoReal || 0), 0)

      resultado[canal] = {
        enviado,
        entregue,
        lido: mensagensCanal.filter(m => ['lido', 'respondido'].includes(m.status)).length,
        respondido: mensagensCanal.filter(m => m.status === 'respondido').length,
        custo,
        performance: enviado > 0 ? Math.round((entregue / enviado) * 100) : 0
      }
    }

    return resultado
  }

  private calcularMetricasPorTemplate(mensagens: StatusMensagemUnificado[]): Record<string, any> {
    // Simular dados por template (em produção viria do contexto da mensagem)
    return {
      'template_lembrete': {
        nome: 'Lembrete de Consulta',
        enviado: 45,
        performance: 87,
        conversoes: 12,
        custo: 5.40
      },
      'template_campanha': {
        nome: 'Campanha Promocional',
        enviado: 78,
        performance: 73,
        conversoes: 8,
        custo: 9.36
      }
    }
  }

  private calcularMetricasPorSegmento(mensagens: StatusMensagemUnificado[]): Record<string, any> {
    return {
      'pacientes_ativos': {
        pacientes: 45,
        enviado: 89,
        taxa_resposta: 0.24,
        roi: 3.2
      },
      'pacientes_inativos': {
        pacientes: 23,
        enviado: 34,
        taxa_resposta: 0.12,
        roi: 1.8
      }
    }
  }

  private calcularTendencias(mensagens: StatusMensagemUnificado[]): any {
    return {
      melhoresHorarios: [
        { hora: 9, taxa_resposta: 0.32 },
        { hora: 14, taxa_resposta: 0.28 },
        { hora: 19, taxa_resposta: 0.24 }
      ],
      melhoresDias: [
        { dia: 2, taxa_resposta: 0.29 }, // Terça
        { dia: 3, taxa_resposta: 0.27 }, // Quarta
        { dia: 4, taxa_resposta: 0.25 }  // Quinta
      ],
      padroesSazonais: [
        { mes: new Date().getMonth() + 1, performance: 78 }
      ]
    }
  }

  private calcularTempoMedioResposta(mensagens: StatusMensagemUnificado[]): number {
    const mensagensRespondidas = mensagens.filter(m => m.metricas.tempoResposta)
    if (mensagensRespondidas.length === 0) return 0

    const somaTempos = mensagensRespondidas.reduce((soma, m) => soma + (m.metricas.tempoResposta || 0), 0)
    return Math.round(somaTempos / mensagensRespondidas.length / 60) // em minutos
  }

  private gerarInsights(
    mensagens: StatusMensagemUnificado[], 
    porCanal: Record<string, any>, 
    tendencias: any
  ): any {
    const insights = {
      melhorCanal: '',
      melhorTemplate: 'template_lembrete',
      melhorHorario: '09:00',
      recomendacoes: [] as string[],
      alertas: [] as string[]
    }

    // Encontrar melhor canal por performance
    let melhorPerformance = 0
    for (const [canal, dados] of Object.entries(porCanal)) {
      if (dados.performance > melhorPerformance) {
        melhorPerformance = dados.performance
        insights.melhorCanal = canal
      }
    }

    // Gerar recomendações
    if (porCanal.whatsapp?.performance > 80) {
      insights.recomendacoes.push('WhatsApp está com excelente performance, considere aumentar o volume')
    }

    if (porCanal.email?.performance < 60) {
      insights.alertas.push('Taxa de entrega de email abaixo do esperado, verificar reputação')
    }

    return insights
  }
}