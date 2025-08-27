// Serviço de Email Marketing - Suporte SMTP e provedores - Fase 3

import { 
  MensagemEnvio, 
  ConfiguracaoComunicacao, 
  EventoWebhook,
  AnexoMensagem 
} from '@/types/communication-types'

interface ProviderEmail {
  enviar(mensagem: EmailData, config: ConfiguracaoComunicacao['email']): Promise<ResultadoEnvioEmail>
  verificarStatus(messageId: string, config: ConfiguracaoComunicacao['email']): Promise<StatusEmail>
  obterEstatisticas(config: ConfiguracaoComunicacao['email']): Promise<EstatisticasEmail>
  validarWebhook(dados: any, config: ConfiguracaoComunicacao['email']): boolean
}

interface EmailData {
  para: string
  nome: string
  assunto: string
  corpoTexto: string
  corpoHtml: string
  anexos?: AnexoMensagem[]
  trackingId?: string
  tags?: string[]
  templateId?: string
  parametros?: Record<string, string>
}

interface ResultadoEnvioEmail {
  sucesso: boolean
  messageId?: string
  erro?: string
  custoEstimado: number
}

interface StatusEmail {
  status: 'enviado' | 'entregue' | 'aberto' | 'clicado' | 'bounce' | 'spam' | 'rejeitado'
  timestamp: Date
  detalhes?: {
    tentativas: number
    ultimaResposta?: string
    motivoRejeicao?: string
    ip?: string
    userAgent?: string
  }
}

interface EstatisticasEmail {
  enviadosHoje: number
  entreguesHoje: number
  abertosHoje: number
  clicadosHoje: number
  bounceRate: number
  spamRate: number
  reputacao: number
}

export class EmailService {
  private providers: Map<string, ProviderEmail> = new Map()
  private config: ConfiguracaoComunicacao['email']
  private trackingPixels: Map<string, string> = new Map()

  constructor(config: ConfiguracaoComunicacao['email']) {
    this.config = config
    this.inicializarProviders()
  }

  private inicializarProviders(): void {
    this.providers.set('smtp', new SMTPProvider())
    this.providers.set('sendgrid', new SendGridProvider())
    this.providers.set('mailgun', new MailgunProvider())
    this.providers.set('ses', new AWSEmailProvider())
  }

  // Enviar email usando provider configurado
  async enviarEmail(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    messageId?: string
    erro?: string
    custoEstimado: number
    trackingId?: string
  }> {
    try {
      const provider = this.providers.get(this.config.provider)
      if (!provider) {
        throw new Error(`Provider ${this.config.provider} não suportado`)
      }

      // Validar email
      if (!this.validarEmail(mensagem.destinatario.email!)) {
        throw new Error('Endereço de email inválido')
      }

      // Preparar dados do email
      const emailData = await this.prepararEmailData(mensagem)
      
      // Enviar através do provider
      const resultado = await provider.enviar(emailData, this.config)

      // Gerar tracking ID se tracking estiver habilitado
      let trackingId: string | undefined
      if (this.config.trackingEnabled && resultado.sucesso) {
        trackingId = this.gerarTrackingId(resultado.messageId!, mensagem.destinatario.email!)
      }

      return {
        ...resultado,
        trackingId
      }

    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0
      }
    }
  }

  // Enviar email em lote (campanha)
  async enviarEmailLote(mensagens: MensagemEnvio[]): Promise<{
    sucessos: number
    falhas: number
    resultados: { messageId?: string; erro?: string; email: string }[]
    custoTotal: number
  }> {
    const resultados: { messageId?: string; erro?: string; email: string }[] = []
    let sucessos = 0
    let falhas = 0
    let custoTotal = 0

    // Processar em batches para evitar rate limiting
    const batchSize = 10
    for (let i = 0; i < mensagens.length; i += batchSize) {
      const batch = mensagens.slice(i, i + batchSize)
      
      const promessasBatch = batch.map(async (mensagem) => {
        const resultado = await this.enviarEmail(mensagem)
        
        resultados.push({
          messageId: resultado.messageId,
          erro: resultado.erro,
          email: mensagem.destinatario.email!
        })

        if (resultado.sucesso) {
          sucessos++
        } else {
          falhas++
        }
        
        custoTotal += resultado.custoEstimado
      })

      await Promise.all(promessasBatch)
      
      // Pausa entre batches para rate limiting
      if (i + batchSize < mensagens.length) {
        await this.pausa(1000) // 1 segundo
      }
    }

    return {
      sucessos,
      falhas,
      resultados,
      custoTotal
    }
  }

  // Verificar status de email
  async verificarStatus(messageId: string): Promise<StatusEmail> {
    const provider = this.providers.get(this.config.provider)
    if (!provider) {
      throw new Error(`Provider ${this.config.provider} não encontrado`)
    }

    return provider.verificarStatus(messageId, this.config)
  }

  // Processar webhook de tracking
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
      console.error('Erro ao processar webhook Email:', error)
    }

    return eventos
  }

  // Registrar abertura de email via pixel tracking
  async registrarAbertura(trackingId: string, dados: {
    ip: string
    userAgent: string
    timestamp: Date
  }): Promise<void> {
    if (this.trackingPixels.has(trackingId)) {
      const messageId = this.trackingPixels.get(trackingId)!
      
      // Simular registro de abertura
      console.log(`[Email Tracking] Abertura registrada: ${messageId}`, dados)
      
      // Em produção, salvaria no banco de dados
    }
  }

  // Registrar clique em link
  async registrarClique(trackingId: string, urlOriginal: string, dados: {
    ip: string
    userAgent: string
    timestamp: Date
  }): Promise<string> {
    if (this.trackingPixels.has(trackingId)) {
      const messageId = this.trackingPixels.get(trackingId)!
      
      // Simular registro de clique
      console.log(`[Email Tracking] Clique registrado: ${messageId} -> ${urlOriginal}`, dados)
    }

    return urlOriginal
  }

  // Obter estatísticas gerais
  async obterEstatisticas(): Promise<EstatisticasEmail> {
    try {
      const provider = this.providers.get(this.config.provider)
      if (!provider) {
        throw new Error(`Provider ${this.config.provider} não encontrado`)
      }

      return provider.obterEstatisticas(this.config)
    } catch (error) {
      return {
        enviadosHoje: 0,
        entreguesHoje: 0,
        abertosHoje: 0,
        clicadosHoje: 0,
        bounceRate: 0,
        spamRate: 0,
        reputacao: 0
      }
    }
  }

  // Validar configuração do provider
  async validarConfiguracao(): Promise<{
    valida: boolean
    erros: string[]
    conectividade: boolean
    reputacao?: number
  }> {
    const erros: string[] = []

    // Validar campos obrigatórios
    if (!this.config.config.user) erros.push('Usuário/Email é obrigatório')
    if (!this.config.config.password) erros.push('Senha é obrigatória')
    if (!this.config.config.fromEmail) erros.push('Email remetente é obrigatório')
    if (!this.config.config.fromName) erros.push('Nome remetente é obrigatório')

    // Validar email remetente
    if (this.config.config.fromEmail && !this.validarEmail(this.config.config.fromEmail)) {
      erros.push('Email remetente inválido')
    }

    // Testar conectividade
    let conectividade = false
    let reputacao: number | undefined

    try {
      const provider = this.providers.get(this.config.provider)
      if (provider) {
        const stats = await provider.obterEstatisticas(this.config)
        conectividade = true
        reputacao = stats.reputacao
      }
    } catch (error) {
      erros.push('Falha na conectividade com o provider')
    }

    return {
      valida: erros.length === 0,
      erros,
      conectividade,
      reputacao
    }
  }

  // Métodos privados
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  private async prepararEmailData(mensagem: MensagemEnvio): Promise<EmailData> {
    // Personalizar conteúdo
    const assunto = this.personalizarTexto(
      mensagem.conteudo.assunto || 'Mensagem da Clínica',
      mensagem.contexto.dadosPersonalizacao
    )

    let corpoTexto = this.personalizarTexto(
      mensagem.conteudo.corpo,
      mensagem.contexto.dadosPersonalizacao
    )

    // Gerar versão HTML se não fornecida
    let corpoHtml = corpoTexto.replace(/\n/g, '<br>')
    
    // Aplicar template HTML se especificado
    if (mensagem.conteudo.templateId) {
      corpoHtml = await this.aplicarTemplate(mensagem.conteudo.templateId, {
        titulo: assunto,
        conteudo: corpoHtml,
        ...mensagem.contexto.dadosPersonalizacao
      })
    } else {
      corpoHtml = this.gerarHtmlPadrao(assunto, corpoHtml)
    }

    // Adicionar tracking se habilitado
    if (this.config.trackingEnabled) {
      corpoHtml = this.adicionarTracking(corpoHtml, mensagem.id)
    }

    return {
      para: mensagem.destinatario.email!,
      nome: mensagem.destinatario.nome,
      assunto,
      corpoTexto,
      corpoHtml,
      anexos: mensagem.conteudo.anexos,
      trackingId: mensagem.id,
      tags: mensagem.contexto.tags,
      templateId: mensagem.conteudo.templateId,
      parametros: mensagem.conteudo.parametros
    }
  }

  private personalizarTexto(texto: string, dados: Record<string, any>): string {
    let textoPersonalizado = texto

    for (const [chave, valor] of Object.entries(dados)) {
      const regex = new RegExp(`\\{${chave}\\}`, 'g')
      textoPersonalizado = textoPersonalizado.replace(regex, String(valor))
    }

    return textoPersonalizado
  }

  private async aplicarTemplate(templateId: string, dados: Record<string, any>): Promise<string> {
    // Carregar template HTML
    const template = await this.carregarTemplate(templateId)
    
    // Aplicar dados ao template
    return this.personalizarTexto(template, dados)
  }

  private async carregarTemplate(templateId: string): Promise<string> {
    // Templates básicos simulados
    const templates: Record<string, string> = {
      'basico': `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333;">{titulo}</h1>
            </div>
            <div style="padding: 20px;">
              {conteudo}
            </div>
            <div style="background: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              {fromName} - {fromEmail}
            </div>
          </body>
        </html>
      `,
      'profissional': `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #fff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">{titulo}</h1>
            </div>
            <div style="padding: 30px; line-height: 1.6; color: #333;">
              {conteudo}
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 3px solid #667eea;">
              <p style="margin: 0; color: #666; font-size: 14px;">{fromName}</p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">{fromEmail}</p>
            </div>
          </body>
        </html>
      `
    }

    return templates[templateId] || templates['basico']
  }

  private gerarHtmlPadrao(assunto: string, conteudo: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #007bff;">
            <h2 style="margin: 0; color: #007bff;">${assunto}</h2>
          </div>
          <div style="padding: 20px;">
            ${conteudo}
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Esta mensagem foi enviada pela ${this.config.config.fromName}</p>
          </div>
        </body>
      </html>
    `
  }

  private adicionarTracking(html: string, trackingId: string): string {
    // Adicionar pixel de tracking
    const pixelUrl = `/api/email/track/open/${trackingId}`
    const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display: none;" />`
    
    // Substituir links por links de tracking
    const htmlComTracking = html.replace(
      /<a([^>]+)href="([^"]+)"([^>]*)>/gi,
      `<a$1href="/api/email/track/click/${trackingId}?url=$2"$3>`
    )

    return htmlComTracking + pixel
  }

  private gerarTrackingId(messageId: string, email: string): string {
    const trackingId = `${messageId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.trackingPixels.set(trackingId, messageId)
    return trackingId
  }

  private async pausa(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async processarWebhookPorProvider(dadosWebhook: any): Promise<EventoWebhook[]> {
    const eventos: EventoWebhook[] = []
    
    switch (this.config.provider) {
      case 'sendgrid':
        eventos.push(...this.processarWebhookSendGrid(dadosWebhook))
        break
      case 'mailgun':
        eventos.push(...this.processarWebhookMailgun(dadosWebhook))
        break
      case 'ses':
        eventos.push(...this.processarWebhookSES(dadosWebhook))
        break
      default:
        eventos.push(...this.processarWebhookGenerico(dadosWebhook))
    }

    return eventos
  }

  private processarWebhookSendGrid(dados: any): EventoWebhook[] {
    const eventos: EventoWebhook[] = []
    
    if (Array.isArray(dados)) {
      for (const evento of dados) {
        eventos.push({
          id: `email_${evento.sg_message_id}_${Date.now()}`,
          tipo: this.mapearEventoSendGrid(evento.event),
          canal: 'email',
          timestamp: new Date(evento.timestamp * 1000),
          dados: {
            mensagemId: evento.sg_message_id,
            pacienteId: `paciente_email_${evento.email}`,
            status: evento.event,
            providerId: evento.sg_message_id,
            metadata: evento
          },
          processamento: {
            processado: false,
            tentativas: 0
          }
        })
      }
    }

    return eventos
  }

  private processarWebhookMailgun(dados: any): EventoWebhook[] {
    return [{
      id: `email_${dados['message-id']}_${Date.now()}`,
      tipo: this.mapearEventoMailgun(dados.event),
      canal: 'email',
      timestamp: new Date(dados.timestamp * 1000),
      dados: {
        mensagemId: dados['message-id'],
        pacienteId: `paciente_email_${dados.recipient}`,
        status: dados.event,
        providerId: dados['message-id'],
        metadata: dados
      },
      processamento: {
        processado: false,
        tentativas: 0
      }
    }]
  }

  private processarWebhookSES(dados: any): EventoWebhook[] {
    const message = JSON.parse(dados.Message || '{}')
    
    return [{
      id: `email_${message.mail.messageId}_${Date.now()}`,
      tipo: this.mapearEventoSES(message.eventType),
      canal: 'email',
      timestamp: new Date(message.mail.timestamp),
      dados: {
        mensagemId: message.mail.messageId,
        pacienteId: `paciente_email_${message.mail.destination?.[0]}`,
        status: message.eventType,
        providerId: message.mail.messageId,
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
      id: `email_${dados.id || Date.now()}_${Date.now()}`,
      tipo: 'entrega',
      canal: 'email',
      timestamp: new Date(),
      dados: {
        mensagemId: dados.id || 'unknown',
        pacienteId: `paciente_email_${dados.email || dados.to}`,
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

  private mapearEventoSendGrid(evento: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'delivered': 'entrega',
      'open': 'leitura',
      'click': 'resposta',
      'bounce': 'erro',
      'dropped': 'erro',
      'spam_report': 'erro'
    }
    return mapeamento[evento] || 'entrega'
  }

  private mapearEventoMailgun(evento: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'delivered': 'entrega',
      'opened': 'leitura',
      'clicked': 'resposta',
      'bounced': 'erro',
      'failed': 'erro',
      'complained': 'erro'
    }
    return mapeamento[evento] || 'entrega'
  }

  private mapearEventoSES(evento: string): EventoWebhook['tipo'] {
    const mapeamento: Record<string, EventoWebhook['tipo']> = {
      'delivery': 'entrega',
      'open': 'leitura',
      'click': 'resposta',
      'bounce': 'erro',
      'complaint': 'erro'
    }
    return mapeamento[evento] || 'entrega'
  }
}

// Implementações dos providers específicos
class SMTPProvider implements ProviderEmail {
  async enviar(emailData: EmailData, config: ConfiguracaoComunicacao['email']): Promise<ResultadoEnvioEmail> {
    try {
      console.log('[SMTP] Enviando email:', {
        from: `${config.config.fromName} <${config.config.fromEmail}>`,
        to: `${emailData.nome} <${emailData.para}>`,
        subject: emailData.assunto
      })

      // Simular envio SMTP
      const messageId = `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        sucesso: true,
        messageId,
        custoEstimado: 0.01 // SMTP é mais barato
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro SMTP',
        custoEstimado: 0
      }
    }
  }

  async verificarStatus(messageId: string, config: ConfiguracaoComunicacao['email']): Promise<StatusEmail> {
    return {
      status: 'entregue',
      timestamp: new Date()
    }
  }

  async obterEstatisticas(config: ConfiguracaoComunicacao['email']): Promise<EstatisticasEmail> {
    return {
      enviadosHoje: 150,
      entreguesHoje: 145,
      abertosHoje: 87,
      clicadosHoje: 23,
      bounceRate: 0.03,
      spamRate: 0.01,
      reputacao: 92
    }
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['email']): boolean {
    return true // SMTP não tem webhooks nativos
  }
}

class SendGridProvider implements ProviderEmail {
  async enviar(emailData: EmailData, config: ConfiguracaoComunicacao['email']): Promise<ResultadoEnvioEmail> {
    console.log('[SendGrid] Enviando email via API')
    
    return {
      sucesso: true,
      messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      custoEstimado: 0.08
    }
  }

  async verificarStatus(messageId: string, config: ConfiguracaoComunicacao['email']): Promise<StatusEmail> {
    return {
      status: 'entregue',
      timestamp: new Date()
    }
  }

  async obterEstatisticas(config: ConfiguracaoComunicacao['email']): Promise<EstatisticasEmail> {
    return {
      enviadosHoje: 500,
      entreguesHoje: 485,
      abertosHoje: 234,
      clicadosHoje: 67,
      bounceRate: 0.025,
      spamRate: 0.005,
      reputacao: 96
    }
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['email']): boolean {
    return Array.isArray(dados) && dados.length > 0
  }
}

class MailgunProvider implements ProviderEmail {
  async enviar(emailData: EmailData, config: ConfiguracaoComunicacao['email']): Promise<ResultadoEnvioEmail> {
    console.log('[Mailgun] Enviando email via API')
    
    return {
      sucesso: true,
      messageId: `mg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      custoEstimado: 0.06
    }
  }

  async verificarStatus(messageId: string, config: ConfiguracaoComunicacao['email']): Promise<StatusEmail> {
    return {
      status: 'entregue',
      timestamp: new Date()
    }
  }

  async obterEstatisticas(config: ConfiguracaoComunicacao['email']): Promise<EstatisticasEmail> {
    return {
      enviadosHoje: 300,
      entreguesHoje: 295,
      abertosHoje: 156,
      clicadosHoje: 42,
      bounceRate: 0.02,
      spamRate: 0.003,
      reputacao: 94
    }
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['email']): boolean {
    return dados.event && dados['message-id']
  }
}

class AWSEmailProvider implements ProviderEmail {
  async enviar(emailData: EmailData, config: ConfiguracaoComunicacao['email']): Promise<ResultadoEnvioEmail> {
    console.log('[AWS SES] Enviando email via SDK')
    
    return {
      sucesso: true,
      messageId: `aws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      custoEstimado: 0.05
    }
  }

  async verificarStatus(messageId: string, config: ConfiguracaoComunicacao['email']): Promise<StatusEmail> {
    return {
      status: 'entregue',
      timestamp: new Date()
    }
  }

  async obterEstatisticas(config: ConfiguracaoComunicacao['email']): Promise<EstatisticasEmail> {
    return {
      enviadosHoje: 800,
      entreguesHoje: 792,
      abertosHoje: 387,
      clicadosHoje: 98,
      bounceRate: 0.015,
      spamRate: 0.002,
      reputacao: 98
    }
  }

  validarWebhook(dados: any, config: ConfiguracaoComunicacao['email']): boolean {
    return dados.Type === 'Notification' && dados.Message
  }
}