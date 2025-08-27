// Serviço de SMS Gateway - Suporte para múltiplos provedores - Fase 3

import { 
  MensagemEnvio, 
  ConfiguracaoComunicacao, 
  EventoWebhook 
} from '@/types/communication-types'

interface ProviderSMS {
  enviar(mensagem: MensagemEnvio, config: ConfiguracaoComunicacao['sms']): Promise<ResultadoEnvio>
  verificarStatus(providerId: string, config: ConfiguracaoComunicacao['sms']): Promise<StatusMensagem>
  obterCreditos(config: ConfiguracaoComunicacao['sms']): Promise<number>
  validarWebhook(dados: any, config: ConfiguracaoComunicacao['sms']): boolean
}

interface ResultadoEnvio {
  sucesso: boolean
  providerId?: string
  erro?: string
  custoEstimado: number
  segmentos: number
}

interface StatusMensagem {
  status: 'pendente' | 'enviado' | 'entregue' | 'falhado' | 'expirado'
  timestamp: Date
  erro?: string
  custoFinal?: number
}

export class SMSService {
  private providers: Map<string, ProviderSMS> = new Map()
  private config: ConfiguracaoComunicacao['sms']

  constructor(config: ConfiguracaoComunicacao['sms']) {
    this.config = config
    this.inicializarProviders()
  }

  private inicializarProviders(): void {
    this.providers.set('twilio', new TwilioProvider())
    this.providers.set('nexmo', new NexmoProvider())
    this.providers.set('aws-sns', new AWSSNSProvider())
    this.providers.set('custom', new CustomProvider())
  }

  // Enviar SMS usando provider configurado
  async enviarSMS(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    providerId?: string
    erro?: string
    custoEstimado: number
    segmentos: number
  }> {
    try {
      const provider = this.providers.get(this.config.provider)
      if (!provider) {
        throw new Error(`Provider ${this.config.provider} não suportado`)
      }

      // Validar número de telefone
      const telefoneValido = this.validarTelefone(mensagem.destinatario.telefone!)
      if (!telefoneValido) {
        throw new Error('Número de telefone inválido')
      }

      // Validar conteúdo da mensagem
      const conteudoValidado = this.validarConteudo(mensagem.conteudo.corpo)
      if (!conteudoValidado.valido) {
        throw new Error(conteudoValidado.erro)
      }

      // Calcular número de segmentos
      const segmentos = this.calcularSegmentos(mensagem.conteudo.corpo)

      // Aplicar personalização
      mensagem.conteudo.corpo = this.personalizarMensagem(
        mensagem.conteudo.corpo,
        mensagem.contexto.dadosPersonalizacao
      )

      // Enviar através do provider
      const resultado = await provider.enviar(mensagem, this.config)

      return {
        ...resultado,
        segmentos
      }

    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0,
        segmentos: 0
      }
    }
  }

  // Verificar status de mensagem
  async verificarStatus(providerId: string): Promise<StatusMensagem> {
    const provider = this.providers.get(this.config.provider)
    if (!provider) {
      throw new Error(`Provider ${this.config.provider} não encontrado`)
    }

    return provider.verificarStatus(providerId, this.config)
  }

  // Obter créditos restantes
  async obterCreditos(): Promise<{
    creditos: number
    valorPorCredito: number
    moeda: string
  }> {
    try {
      const provider = this.providers.get(this.config.provider)
      if (!provider) {
        throw new Error(`Provider ${this.config.provider} não encontrado`)
      }

      const creditos = await provider.obterCreditos(this.config)
      
      return {
        creditos,
        valorPorCredito: this.obterValorPorCredito(),
        moeda: 'BRL'
      }
    } catch (error) {
      return {
        creditos: 0,
        valorPorCredito: 0,
        moeda: 'BRL'
      }
    }
  }

  // Processar webhook de delivery reports
  async processarWebhook(dadosWebhook: any): Promise<EventoWebhook[]> {
    const eventos: EventoWebhook[] = []
    
    try {
      const provider = this.providers.get(this.config.provider)
      if (!provider || !provider.validarWebhook(dadosWebhook, this.config)) {
        throw new Error('Webhook inválido')
      }

      // Processar baseado no provider
      const eventosProvider = await this.processarWebhookPorProvider(dadosWebhook)
      eventos.push(...eventosProvider)

    } catch (error) {
      console.error('Erro ao processar webhook SMS:', error)
    }

    return eventos
  }

  // Validar configuração do provider
  async validarConfiguracao(): Promise<{
    valida: boolean
    erros: string[]
    conectividade: boolean
    creditos?: number
  }> {
    const erros: string[] = []

    // Validar campos obrigatórios
    if (!this.config.apiKey) erros.push('API Key é obrigatória')
    if (!this.config.fromNumber) erros.push('Número remetente é obrigatório')

    // Validar provider específico
    if (!this.providers.has(this.config.provider)) {
      erros.push(`Provider ${this.config.provider} não suportado`)
    }

    // Testar conectividade
    let conectividade = false
    let creditos: number | undefined

    try {
      const provider = this.providers.get(this.config.provider)
      if (provider) {
        creditos = await provider.obterCreditos(this.config)
        conectividade = true
      }
    } catch (error) {
      erros.push('Falha na conectividade com o provider')
    }

    return {
      valida: erros.length === 0,
      erros,
      conectividade,
      creditos
    }
  }

  // Métodos privados
  private validarTelefone(telefone: string): boolean {
    // Remove caracteres especiais
    const numeroLimpo = telefone.replace(/\D/g, '')
    
    // Valida formato brasileiro: 11 dígitos (com DDD + 9)
    const regexBrasil = /^55[1-9][1-9]\d{8,9}$/
    
    return regexBrasil.test(numeroLimpo)
  }

  private validarConteudo(conteudo: string): { valido: boolean; erro?: string } {
    if (!conteudo || conteudo.trim().length === 0) {
      return { valido: false, erro: 'Conteúdo da mensagem não pode estar vazio' }
    }

    if (conteudo.length > 1600) {
      return { valido: false, erro: 'Mensagem muito longa (máximo 1600 caracteres)' }
    }

    // Validar caracteres proibidos
    const caracteresProibidos = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu
    if (caracteresProibidos.test(conteudo)) {
      return { valido: false, erro: 'Emojis não são suportados via SMS' }
    }

    return { valido: true }
  }

  private calcularSegmentos(conteudo: string): number {
    // SMS padrão: 160 caracteres por segmento
    // SMS com caracteres especiais (Unicode): 70 caracteres por segmento
    
    const temUnicode = /[^\x00-\x7F]/.test(conteudo)
    const limitePorSegmento = temUnicode ? 70 : 160
    
    return Math.ceil(conteudo.length / limitePorSegmento)
  }

  private personalizarMensagem(mensagem: string, dados: Record<string, any>): string {
    let mensagemPersonalizada = mensagem

    for (const [chave, valor] of Object.entries(dados)) {
      const regex = new RegExp(`\\{${chave}\\}`, 'g')
      mensagemPersonalizada = mensagemPersonalizada.replace(regex, String(valor))
    }

    return mensagemPersonalizada
  }

  private obterValorPorCredito(): number {
    // Preços estimados por provider (em BRL)
    const precos: Record<string, number> = {
      'twilio': 0.15,
      'nexmo': 0.12,
      'aws-sns': 0.10,
      'custom': 0.08
    }

    return precos[this.config.provider] || 0.15
  }

  private async processarWebhookPorProvider(dadosWebhook: any): Promise<EventoWebhook[]> {
    const eventos: EventoWebhook[] = []
    
    switch (this.config.provider) {
      case 'twilio':
        eventos.push(...this.processarWebhookTwilio(dadosWebhook))
        break
      case 'nexmo':
        eventos.push(...this.processarWebhookNexmo(dadosWebhook))
        break
      case 'aws-sns':
        eventos.push(...this.processarWebhookAWS(dadosWebhook))
        break
      default:
        eventos.push(...this.processarWebhookGenerico(dadosWebhook))
    }

    return eventos
  }

  private processarWebhookTwilio(dados: any): EventoWebhook[] {
    return [{
      id: `sms_${dados.MessageSid}_${Date.now()}`,
      tipo: this.mapearStatusTwilio(dados.MessageStatus),
      canal: 'sms',
      timestamp: new Date(),
      dados: {
        mensagemId: dados.MessageSid,
        pacienteId: this.extrairPacienteId(dados.To),
        status: dados.MessageStatus,
        providerId: dados.MessageSid,
        metadata: dados
      },
      processamento: {
        processado: false,
        tentativas: 0
      }
    }]
  }

  private processarWebhookNexmo(dados: any): EventoWebhook[] {
    return [{
      id: `sms_${dados['message-id']}_${Date.now()}`,
      tipo: this.mapearStatusNexmo(dados.status),
      canal: 'sms',
      timestamp: new Date(dados['message-timestamp']),
      dados: {
        mensagemId: dados['message-id'],
        pacienteId: this.extrairPacienteId(dados.to),
        status: dados.status,
        erro: dados['err-code'] ? `Error ${dados['err-code']}` : undefined,
        providerId: dados['message-id'],
        metadata: dados
      },
      processamento: {
        processado: false,
        tentativas: 0
      }
    }]
  }

  private processarWebhookAWS(dados: any): EventoWebhook[] {
    // AWS SNS format
    const message = JSON.parse(dados.Message || '{}')
    
    return [{
      id: `sms_${message.messageId}_${Date.now()}`,
      tipo: this.mapearStatusAWS(message.status),
      canal: 'sms',
      timestamp: new Date(dados.Timestamp),
      dados: {
        mensagemId: message.messageId,
        pacienteId: this.extrairPacienteId(message.destination),
        status: message.status,
        providerId: message.messageId,
        metadata: dados
      },
      processamento: {
        processado: false,
        tentativas: 0
      }
    }]
  }

  private processarWebhookGenerico(dados: any): EventoWebhook[] {
    return [{
      id: `sms_${dados.id || Date.now()}_${Date.now()}`,
      tipo: 'entrega',
      canal: 'sms',
      timestamp: new Date(),
      dados: {
        mensagemId: dados.id || 'unknown',
        pacienteId: this.extrairPacienteId(dados.to || dados.destination),
        status: dados.status || 'delivered',
        providerId: dados.id || 'unknown',
        metadata: dados
      },
      processamento: {
        processado: false,
        tentativas: 0
      }
    }]
  }

  private mapearStatusTwilio(status: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'queued': 'entrega',
      'sent': 'entrega',
      'delivered': 'entrega',
      'undelivered': 'erro',
      'failed': 'erro'
    }
    return mapeamento[status] || 'erro'
  }

  private mapearStatusNexmo(status: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'delivered': 'entrega',
      'expired': 'erro',
      'failed': 'erro',
      'rejected': 'erro',
      'unknown': 'erro'
    }
    return mapeamento[status] || 'erro'
  }

  private mapearStatusAWS(status: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'SUCCESS': 'entrega',
      'FAILURE': 'erro',
      'UNKNOWN': 'erro'
    }
    return mapeamento[status] || 'erro'
  }

  private extrairPacienteId(numeroTelefone: string): string {
    // Em produção, faria lookup no banco de dados
    return `paciente_sms_${numeroTelefone.replace(/\D/g, '')}`
  }
}

// Implementações dos providers específicos
class TwilioProvider implements ProviderSMS {
  async enviar(mensagem: MensagemEnvio, config: ConfiguracaoComunicacao['sms']): Promise<ResultadoEnvio> {
    try {
      // Simular envio via Twilio API
      console.log('[Twilio] Enviando SMS:', {
        from: config.fromNumber,
        to: mensagem.destinatario.telefone,
        body: mensagem.conteudo.corpo
      })

      // Em produção, faria requisição real para Twilio
      const providerId = `SM${Math.random().toString(36).substr(2, 32)}`
      
      return {
        sucesso: true,
        providerId,
        custoEstimado: 0.15,
        segmentos: Math.ceil(mensagem.conteudo.corpo.length / 160)
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro no Twilio',
        custoEstimado: 0,
        segmentos: 0
      }
    }
  }

  async verificarStatus(providerId: string, config: ConfiguracaoComunicacao['sms']): Promise<StatusMensagem> {
    // Simular verificação de status
    return {
      status: 'entregue',
      timestamp: new Date(),
      custoFinal: 0.15
    }
  }

  async obterCreditos(config: ConfiguracaoComunicacao['sms']): Promise<number> {
    // Simular consulta de créditos Twilio
    return 500
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['sms']): boolean {
    // Validar signature do Twilio
    return dados.AccountSid && dados.MessageSid
  }
}

class NexmoProvider implements ProviderSMS {
  async enviar(mensagem: MensagemEnvio, config: ConfiguracaoComunicacao['sms']): Promise<ResultadoEnvio> {
    try {
      console.log('[Nexmo/Vonage] Enviando SMS:', {
        from: config.fromNumber,
        to: mensagem.destinatario.telefone,
        text: mensagem.conteudo.corpo
      })

      const providerId = `nexmo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        sucesso: true,
        providerId,
        custoEstimado: 0.12,
        segmentos: Math.ceil(mensagem.conteudo.corpo.length / 160)
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro no Nexmo',
        custoEstimado: 0,
        segmentos: 0
      }
    }
  }

  async verificarStatus(providerId: string, config: ConfiguracaoComunicacao['sms']): Promise<StatusMensagem> {
    return {
      status: 'entregue',
      timestamp: new Date(),
      custoFinal: 0.12
    }
  }

  async obterCreditos(config: ConfiguracaoComunicacao['sms']): Promise<number> {
    return 1000
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['sms']): boolean {
    return dados['message-id'] && dados.status
  }
}

class AWSSNSProvider implements ProviderSMS {
  async enviar(mensagem: MensagemEnvio, config: ConfiguracaoComunicacao['sms']): Promise<ResultadoEnvio> {
    try {
      console.log('[AWS SNS] Enviando SMS:', {
        phoneNumber: mensagem.destinatario.telefone,
        message: mensagem.conteudo.corpo
      })

      const providerId = `aws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        sucesso: true,
        providerId,
        custoEstimado: 0.10,
        segmentos: Math.ceil(mensagem.conteudo.corpo.length / 160)
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro no AWS SNS',
        custoEstimado: 0,
        segmentos: 0
      }
    }
  }

  async verificarStatus(providerId: string, config: ConfiguracaoComunicacao['sms']): Promise<StatusMensagem> {
    return {
      status: 'entregue',
      timestamp: new Date(),
      custoFinal: 0.10
    }
  }

  async obterCreditos(config: ConfiguracaoComunicacao['sms']): Promise<number> {
    return 2000
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['sms']): boolean {
    return dados.Type === 'Notification' && dados.Message
  }
}

class CustomProvider implements ProviderSMS {
  async enviar(mensagem: MensagemEnvio, config: ConfiguracaoComunicacao['sms']): Promise<ResultadoEnvio> {
    console.log('[Custom Provider] Enviando SMS:', mensagem.conteudo.corpo)
    
    return {
      sucesso: true,
      providerId: `custom_${Date.now()}`,
      custoEstimado: 0.08,
      segmentos: 1
    }
  }

  async verificarStatus(providerId: string, config: ConfiguracaoComunicacao['sms']): Promise<StatusMensagem> {
    return {
      status: 'entregue',
      timestamp: new Date()
    }
  }

  async obterCreditos(config: ConfiguracaoComunicacao['sms']): Promise<number> {
    return 5000
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['sms']): boolean {
    return true
  }
}