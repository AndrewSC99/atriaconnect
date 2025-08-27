// Serviço de Integração WhatsApp Business API - Fase 3

import { 
  MensagemEnvio, 
  ConfiguracaoComunicacao, 
  WhatsAppComponent, 
  ConversaUnificada,
  MensagemConversa,
  EventoWebhook
} from '@/types/communication-types'

export class WhatsAppService {
  private config: ConfiguracaoComunicacao['whatsapp']
  private baseURL: string
  private rateLimitQueue: Map<string, Date[]> = new Map()

  constructor(config: ConfiguracaoComunicacao['whatsapp']) {
    this.config = config
    this.baseURL = `https://graph.facebook.com/${config.apiVersion}`
  }

  // Enviar mensagem de texto simples
  async enviarMensagemTexto(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    providerId?: string
    erro?: string
    custoEstimado: number
  }> {
    try {
      // Verificar rate limit
      await this.verificarRateLimit(mensagem.destinatario.whatsapp!)

      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatarTelefone(mensagem.destinatario.whatsapp!),
        type: 'text',
        text: {
          body: mensagem.conteudo.corpo
        }
      }

      const response = await this.fazerRequisicao('POST', `/messages`, payload)
      
      if (response.messages?.[0]) {
        return {
          sucesso: true,
          providerId: response.messages[0].id,
          custoEstimado: 0.05 // Custo estimado por mensagem
        }
      }

      throw new Error('Resposta inválida da API do WhatsApp')

    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0
      }
    }
  }

  // Enviar mensagem usando template aprovado
  async enviarMensagemTemplate(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    providerId?: string
    erro?: string
    custoEstimado: number
  }> {
    try {
      await this.verificarRateLimit(mensagem.destinatario.whatsapp!)

      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatarTelefone(mensagem.destinatario.whatsapp!),
        type: 'template',
        template: {
          name: mensagem.conteudo.templateId,
          language: {
            code: 'pt_BR'
          },
          components: await this.construirComponentesTemplate(
            mensagem.conteudo.parametros || {},
            mensagem.contexto.dadosPersonalizacao
          )
        }
      }

      const response = await this.fazerRequisicao('POST', `/messages`, payload)
      
      if (response.messages?.[0]) {
        return {
          sucesso: true,
          providerId: response.messages[0].id,
          custoEstimado: 0.08 // Template messages custam mais
        }
      }

      throw new Error('Resposta inválida da API do WhatsApp')

    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0
      }
    }
  }

  // Enviar mídia (imagem, documento, etc.)
  async enviarMidia(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    providerId?: string
    erro?: string
    custoEstimado: number
  }> {
    try {
      await this.verificarRateLimit(mensagem.destinatario.whatsapp!)

      const tipoMidia = mensagem.conteudo.tipoMidia || 'documento'
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatarTelefone(mensagem.destinatario.whatsapp!),
        type: tipoMidia,
        [tipoMidia]: {
          link: mensagem.conteudo.mediaUrl,
          caption: mensagem.conteudo.corpo
        }
      }

      const response = await this.fazerRequisicao('POST', `/messages`, payload)
      
      if (response.messages?.[0]) {
        return {
          sucesso: true,
          providerId: response.messages[0].id,
          custoEstimado: 0.10 // Mídia custa mais
        }
      }

      throw new Error('Resposta inválida da API do WhatsApp')

    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0
      }
    }
  }

  // Processar webhook de resposta
  async processarWebhook(dadosWebhook: any): Promise<EventoWebhook[]> {
    const eventos: EventoWebhook[] = []

    try {
      if (dadosWebhook.entry) {
        for (const entry of dadosWebhook.entry) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value
              
              // Processar status de mensagens enviadas
              if (value.statuses) {
                for (const status of value.statuses) {
                  eventos.push({
                    id: `status_${status.id}_${Date.now()}`,
                    tipo: this.mapearStatusParaTipo(status.status),
                    canal: 'whatsapp',
                    timestamp: new Date(status.timestamp * 1000),
                    dados: {
                      mensagemId: status.id,
                      pacienteId: this.extrairPacienteId(status.recipient_id),
                      status: status.status,
                      providerId: status.id,
                      metadata: status
                    },
                    processamento: {
                      processado: false,
                      tentativas: 0
                    }
                  })
                }
              }

              // Processar mensagens recebidas
              if (value.messages) {
                for (const message of value.messages) {
                  eventos.push({
                    id: `message_${message.id}_${Date.now()}`,
                    tipo: 'resposta',
                    canal: 'whatsapp',
                    timestamp: new Date(message.timestamp * 1000),
                    dados: {
                      mensagemId: message.id,
                      pacienteId: this.extrairPacienteId(message.from),
                      status: 'recebida',
                      providerId: message.id,
                      metadata: {
                        ...message,
                        contato: value.contacts?.find((c: any) => c.wa_id === message.from)
                      }
                    },
                    processamento: {
                      processado: false,
                      tentativas: 0
                    }
                  })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhook WhatsApp:', error)
    }

    return eventos
  }

  // Obter informações do perfil business
  async obterPerfilBusiness(): Promise<{
    nome: string
    descricao: string
    endereco: string
    website: string
    telefone: string
    email: string
    verificado: boolean
  }> {
    try {
      const response = await this.fazerRequisicao('GET', `/whatsapp_business_profile`)
      
      if (response.data?.[0]) {
        const perfil = response.data[0]
        return {
          nome: perfil.name || '',
          descricao: perfil.description || '',
          endereco: perfil.address || '',
          website: perfil.website || '',
          telefone: perfil.phone_number || '',
          email: perfil.email || '',
          verificado: perfil.is_verified || false
        }
      }

      throw new Error('Perfil não encontrado')
    } catch (error) {
      console.error('Erro ao obter perfil business:', error)
      throw error
    }
  }

  // Verificar status de saúde da API
  async verificarSaudeAPI(): Promise<{
    status: 'online' | 'offline' | 'limitado'
    limitesAtuais: {
      mensagensPorMinuto: number
      mensagensRestantes: number
      resetaEm: Date
    }
    ultimaVerificacao: Date
  }> {
    try {
      const response = await this.fazerRequisicao('GET', `/`)
      
      // Simular análise de rate limits (API real fornece headers específicos)
      const agora = new Date()
      
      return {
        status: response ? 'online' : 'offline',
        limitesAtuais: {
          mensagensPorMinuto: 1000, // Limite padrão
          mensagensRestantes: this.calcularMensagensRestantes(),
          resetaEm: new Date(agora.getTime() + 60 * 1000) // Reset a cada minuto
        },
        ultimaVerificacao: agora
      }
    } catch (error) {
      return {
        status: 'offline',
        limitesAtuais: {
          mensagensPorMinuto: 0,
          mensagensRestantes: 0,
          resetaEm: new Date()
        },
        ultimaVerificacao: new Date()
      }
    }
  }

  // Criar template de mensagem
  async criarTemplate(template: {
    nome: string
    categoria: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
    idioma: string
    componentes: WhatsAppComponent[]
  }): Promise<{ sucesso: boolean; templateId?: string; erro?: string }> {
    try {
      const payload = {
        name: template.nome,
        category: template.categoria,
        language: template.idioma,
        components: template.componentes
      }

      const response = await this.fazerRequisicao('POST', `/message_templates`, payload)
      
      if (response.id) {
        return {
          sucesso: true,
          templateId: response.id
        }
      }

      throw new Error('Falha ao criar template')
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Listar templates aprovados
  async listarTemplates(): Promise<{
    templates: {
      id: string
      nome: string
      status: 'APPROVED' | 'PENDING' | 'REJECTED'
      categoria: string
      idioma: string
      componentes: WhatsAppComponent[]
    }[]
  }> {
    try {
      const response = await this.fazerRequisicao('GET', `/message_templates`)
      
      return {
        templates: response.data?.map((template: any) => ({
          id: template.id,
          nome: template.name,
          status: template.status,
          categoria: template.category,
          idioma: template.language,
          componentes: template.components || []
        })) || []
      }
    } catch (error) {
      console.error('Erro ao listar templates:', error)
      return { templates: [] }
    }
  }

  // Upload de mídia
  async uploadMidia(arquivo: {
    nome: string
    tipo: string
    dados: Buffer | string
  }): Promise<{ mediaId: string; url: string }> {
    try {
      // Em ambiente real, faria upload para o Facebook/Meta servers
      const formData = new FormData()
      formData.append('file', new Blob([arquivo.dados]), arquivo.nome)
      formData.append('type', arquivo.tipo)
      formData.append('messaging_product', 'whatsapp')

      const response = await this.fazerRequisicao('POST', `/media`, formData, {
        'Content-Type': 'multipart/form-data'
      })

      return {
        mediaId: response.id,
        url: response.url || ''
      }
    } catch (error) {
      throw new Error(`Falha no upload: ${error}`)
    }
  }

  // Métodos auxiliares privados
  private async fazerRequisicao(
    metodo: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    dados?: any,
    headersCustom?: Record<string, string>
  ): Promise<any> {
    const url = `${this.baseURL}/${this.config.phoneNumberId}${endpoint}`
    
    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
      ...headersCustom
    }

    // Em produção, usaria fetch ou axios real
    console.log(`[WhatsApp API] ${metodo} ${url}`, { dados, headers })
    
    // Simular resposta da API para desenvolvimento
    return this.simularRespostaAPI(metodo, endpoint, dados)
  }

  private simularRespostaAPI(metodo: string, endpoint: string, dados: any): any {
    // Simulações para desenvolvimento
    if (endpoint === '/messages') {
      return {
        messaging_product: 'whatsapp',
        contacts: [{ wa_id: dados.to }],
        messages: [{ id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
      }
    }

    if (endpoint === '/message_templates') {
      return {
        data: [
          {
            id: 'template_123',
            name: 'lembrete_consulta',
            status: 'APPROVED',
            category: 'UTILITY',
            language: 'pt_BR',
            components: []
          }
        ]
      }
    }

    return { success: true }
  }

  private async verificarRateLimit(numeroTelefone: string): Promise<void> {
    const agora = new Date()
    const chave = `rate_limit_${numeroTelefone}`
    const tentativas = this.rateLimitQueue.get(chave) || []
    
    // Remover tentativas antigas (> 1 minuto)
    const tentativasRecentes = tentativas.filter(
      t => agora.getTime() - t.getTime() < 60000
    )
    
    if (tentativasRecentes.length >= 10) { // Máximo 10 por minuto
      const proximaTentativa = new Date(tentativasRecentes[0].getTime() + 60000)
      const esperar = proximaTentativa.getTime() - agora.getTime()
      
      if (esperar > 0) {
        await new Promise(resolve => setTimeout(resolve, esperar))
      }
    }
    
    tentativasRecentes.push(agora)
    this.rateLimitQueue.set(chave, tentativasRecentes)
  }

  private formatarTelefone(telefone: string): string {
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '')
    
    // Adiciona código do país se não tiver
    if (!numeroLimpo.startsWith('55')) {
      return `55${numeroLimpo}`
    }
    
    return numeroLimpo
  }

  private construirComponentesTemplate(
    parametros: Record<string, string>,
    dadosPersonalizacao: Record<string, any>
  ): Promise<WhatsAppComponent[]> {
    return Promise.resolve([
      {
        type: 'body',
        parameters: Object.entries(parametros).map(([key, value]) => ({
          type: 'text',
          text: this.personalizarTexto(value, dadosPersonalizacao)
        }))
      }
    ])
  }

  private personalizarTexto(texto: string, dados: Record<string, any>): string {
    let textoPersonalizado = texto
    
    for (const [chave, valor] of Object.entries(dados)) {
      const regex = new RegExp(`\\{${chave}\\}`, 'g')
      textoPersonalizado = textoPersonalizado.replace(regex, String(valor))
    }
    
    return textoPersonalizado
  }

  private mapearStatusParaTipo(status: string): 'entrega' | 'leitura' | 'resposta' | 'erro' {
    const mapeamento: Record<string, 'entrega' | 'leitura' | 'resposta' | 'erro'> = {
      'sent': 'entrega',
      'delivered': 'entrega',
      'read': 'leitura',
      'failed': 'erro'
    }
    
    return mapeamento[status] || 'erro'
  }

  private extrairPacienteId(numeroWhatsApp: string): string {
    // Em produção, faria lookup no banco de dados
    return `paciente_${numeroWhatsApp}`
  }

  private calcularMensagensRestantes(): number {
    const agora = new Date()
    let totalEnviadas = 0
    
    for (const tentativas of this.rateLimitQueue.values()) {
      totalEnviadas += tentativas.filter(
        t => agora.getTime() - t.getTime() < 60000
      ).length
    }
    
    return Math.max(0, 1000 - totalEnviadas)
  }

  // Validar webhook token
  validarWebhookToken(token: string): boolean {
    return token === this.config.webhookToken
  }

  // Converter mensagem recebida para formato unificado
  converterMensagemRecebida(dadosWebhook: any): MensagemConversa | null {
    try {
      const message = dadosWebhook
      const contato = dadosWebhook.contato
      
      return {
        id: message.id,
        conversaId: `conversa_${message.from}`,
        tipo: 'recebida',
        
        remetente: {
          tipo: 'paciente',
          id: message.from,
          nome: contato?.profile?.name || contato?.wa_id || message.from
        },
        
        conteudo: {
          texto: message.text?.body,
          midia: message.image || message.document || message.audio || message.video ? {
            tipo: this.determinarTipoMidia(message),
            url: this.obterUrlMidia(message),
            nome: message.document?.filename,
            mimetype: this.obterMimetype(message)
          } : undefined,
          localizacao: message.location ? {
            latitude: message.location.latitude,
            longitude: message.location.longitude,
            endereco: message.location.address
          } : undefined
        },
        
        metadata: {
          timestamp: new Date(message.timestamp * 1000),
          reencaminhada: message.forwarded || false,
          respondendoA: message.context?.id
        },
        
        processamento: {
          analisadoPorIA: false
        }
      }
    } catch (error) {
      console.error('Erro ao converter mensagem recebida:', error)
      return null
    }
  }

  private determinarTipoMidia(message: any): 'imagem' | 'documento' | 'audio' | 'video' | 'sticker' {
    if (message.image) return 'imagem'
    if (message.document) return 'documento' 
    if (message.audio) return 'audio'
    if (message.video) return 'video'
    if (message.sticker) return 'sticker'
    return 'documento'
  }

  private obterUrlMidia(message: any): string {
    const midia = message.image || message.document || message.audio || message.video || message.sticker
    return midia?.id ? `${this.baseURL}/${midia.id}` : ''
  }

  private obterMimetype(message: any): string {
    const midia = message.image || message.document || message.audio || message.video
    return midia?.mime_type || 'application/octet-stream'
  }
}