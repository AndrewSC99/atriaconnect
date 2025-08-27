// Serviço Central de Comunicação - Integração de todos os canais - Fase 3

import { 
  MensagemEnvio, 
  ConfiguracaoComunicacao,
  CampanhaComunicacao,
  TemplateMensagem,
  EstadoSistemaComunicacao,
  EventoWebhook
} from '@/types/communication-types'
import { WhatsAppService } from './whatsapp-service'
import { SMSService } from './sms-service'
import { EmailService } from './email-service'
import { MessageTracker } from './message-tracker'
import { quickActionsEngine } from '../quick-actions-engine'
import { mlEngine } from '../ml-engine'

export class CommunicationService {
  private config: ConfiguracaoComunicacao
  private whatsappService?: WhatsAppService
  private smsService?: SMSService
  private emailService?: EmailService
  private messageTracker: MessageTracker
  private templates: Map<string, TemplateMensagem> = new Map()

  constructor(config: ConfiguracaoComunicacao) {
    this.config = config
    this.inicializarServices()
    this.messageTracker = new MessageTracker(config)
    this.carregarTemplates()
  }

  private inicializarServices(): void {
    if (this.config.whatsapp.ativo) {
      this.whatsappService = new WhatsAppService(this.config.whatsapp)
    }
    
    if (this.config.sms.ativo) {
      this.smsService = new SMSService(this.config.sms)
    }
    
    if (this.config.email.ativo) {
      this.emailService = new EmailService(this.config.email)
    }
  }

  // Enviar mensagem única através do canal preferido
  async enviarMensagem(mensagem: MensagemEnvio): Promise<{
    sucesso: boolean
    mensagemId: string
    canal: string
    providerId?: string
    erro?: string
    custoEstimado: number
  }> {
    try {
      // Determinar melhor canal se não especificado
      if (!mensagem.tipo) {
        mensagem.tipo = await this.determinarMelhorCanal(mensagem)
      }

      // Aplicar personalização inteligente
      await this.aplicarPersonalizacaoInteligente(mensagem)

      // Adicionar à fila de tracking
      await this.messageTracker.adicionarMensagemFila(mensagem)

      // Processar envio
      const resultado = await this.messageTracker.processarMensagem(mensagem.id)

      return {
        sucesso: resultado.sucesso,
        mensagemId: mensagem.id,
        canal: mensagem.tipo,
        providerId: resultado.providerId,
        erro: resultado.erro,
        custoEstimado: 0 // Será calculado após envio
      }

    } catch (error) {
      return {
        sucesso: false,
        mensagemId: mensagem.id,
        canal: mensagem.tipo || 'desconhecido',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        custoEstimado: 0
      }
    }
  }

  // Enviar mensagens em lote (campanha)
  async enviarCampanha(campanha: CampanhaComunicacao): Promise<{
    campanhaId: string
    mensagensEnviadas: number
    sucessos: number
    falhas: number
    custoTotal: number
    tempoEstimado: number
  }> {
    const inicioExecucao = Date.now()
    
    try {
      // Marcar campanha como executando
      campanha.status = 'executando'
      campanha.execucao.iniciadaEm = new Date()

      // Obter lista de pacientes elegíveis
      const pacientesElegiveis = await this.obterPacientesElegiveis(campanha)
      
      let sucessos = 0
      let falhas = 0
      let custoTotal = 0
      const mensagensEnvio: MensagemEnvio[] = []

      // Gerar mensagens para cada paciente
      for (const paciente of pacientesElegiveis) {
        const mensagem = await this.criarMensagemCampanha(campanha, paciente)
        mensagensEnvio.push(mensagem)
      }

      // Processar em lotes respeitando rate limits
      const batchSize = 20
      for (let i = 0; i < mensagensEnvio.length; i += batchSize) {
        const batch = mensagensEnvio.slice(i, i + batchSize)
        
        const promessasBatch = batch.map(async (mensagem) => {
          const resultado = await this.enviarMensagem(mensagem)
          
          if (resultado.sucesso) {
            sucessos++
          } else {
            falhas++
          }
          
          custoTotal += resultado.custoEstimado
          
          // Atualizar progresso da campanha
          campanha.execucao.pacientesProcessados++
          campanha.execucao.mensagensEnviadas = sucessos
          campanha.execucao.errosEncontrados = falhas
          campanha.execucao.percentualConclusao = 
            (campanha.execucao.pacientesProcessados / pacientesElegiveis.length) * 100
        })

        await Promise.all(promessasBatch)
        
        // Pausa entre lotes para rate limiting
        if (i + batchSize < mensagensEnvio.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      // Finalizar campanha
      campanha.status = 'concluida'
      campanha.execucao.finalizadaEm = new Date()
      campanha.resultados.entregues = sucessos
      campanha.resultados.custoTotal = custoTotal

      // Coletar feedback da campanha para ML
      await this.coletarFeedbackCampanha(campanha)

      return {
        campanhaId: campanha.id,
        mensagensEnviadas: mensagensEnvio.length,
        sucessos,
        falhas,
        custoTotal,
        tempoEstimado: Date.now() - inicioExecucao
      }

    } catch (error) {
      campanha.status = 'cancelada'
      throw error
    }
  }

  // Processar webhooks de todos os canais
  async processarWebhook(
    canal: 'whatsapp' | 'sms' | 'email', 
    dadosWebhook: any,
    assinatura?: string
  ): Promise<{ eventos: EventoWebhook[]; processados: number }> {
    try {
      // Validar webhook baseado no canal
      const valido = await this.validarWebhook(canal, dadosWebhook, assinatura)
      if (!valido) {
        throw new Error('Webhook inválido')
      }

      // Processar através do message tracker
      await this.messageTracker.processarWebhook(canal, dadosWebhook)

      return {
        eventos: [], // O tracker já processa internamente
        processados: 1
      }

    } catch (error) {
      console.error(`Erro ao processar webhook ${canal}:`, error)
      return {
        eventos: [],
        processados: 0
      }
    }
  }

  // Obter estado geral do sistema de comunicação
  async obterEstadoSistema(): Promise<EstadoSistemaComunicacao> {
    const statusFila = this.messageTracker.obterStatusFila()
    
    // Verificar status de cada canal
    const statusCanais = {
      whatsapp: {
        conectado: false,
        ultimaVerificacao: new Date(),
        limitesAtuais: {
          mensagensPorMinuto: 0,
          mensagensRestantes: 0,
          resetaEm: new Date()
        },
        errosRecentes: 0
      },
      sms: {
        conectado: false,
        providerStatus: 'unknown',
        creditos: 0,
        ultimaVerificacao: new Date()
      },
      email: {
        conectado: false,
        reputacaoSender: 0,
        blacklistStatus: false,
        ultimaVerificacao: new Date()
      }
    }

    // Verificar WhatsApp
    if (this.whatsappService) {
      try {
        const statusWA = await this.whatsappService.verificarSaudeAPI()
        statusCanais.whatsapp = {
          conectado: statusWA.status === 'online',
          ultimaVerificacao: statusWA.ultimaVerificacao,
          limitesAtuais: statusWA.limitesAtuais,
          errosRecentes: 0
        }
      } catch (error) {
        statusCanais.whatsapp.conectado = false
      }
    }

    // Verificar SMS
    if (this.smsService) {
      try {
        const validacao = await this.smsService.validarConfiguracao()
        const creditos = await this.smsService.obterCreditos()
        
        statusCanais.sms = {
          conectado: validacao.conectividade,
          providerStatus: validacao.conectividade ? 'online' : 'offline',
          creditos: creditos.creditos,
          ultimaVerificacao: new Date()
        }
      } catch (error) {
        statusCanais.sms.conectado = false
      }
    }

    // Verificar Email
    if (this.emailService) {
      try {
        const validacao = await this.emailService.validarConfiguracao()
        const stats = await this.emailService.obterEstatisticas()
        
        statusCanais.email = {
          conectado: validacao.conectividade,
          reputacaoSender: stats.reputacao,
          blacklistStatus: stats.spamRate > 0.05,
          ultimaVerificacao: new Date()
        }
      } catch (error) {
        statusCanais.email.conectado = false
      }
    }

    // Gerar alertas
    const alertas = this.gerarAlertas(statusCanais, statusFila)

    return {
      status: this.determinarStatusGeral(statusCanais),
      canais: statusCanais,
      filaEnvios: {
        pendentes: statusFila.aguardando,
        enviando: statusFila.processando,
        falhados: statusFila.falhas,
        agendados: 0,
        proximoEnvio: statusFila.proximoProcessamento
      },
      performance: {
        mensagensUltimas24h: this.calcularMensagens24h(),
        taxaErroGeral: this.calcularTaxaErro(),
        tempoMedioProcessamento: statusFila.tempoMedioProcessamento,
        custoDiario: await this.calcularCustoDiario()
      },
      alertas
    }
  }

  // Gerenciar templates de mensagem
  async criarTemplate(template: Omit<TemplateMensagem, 'id' | 'performance'>): Promise<string> {
    const templateCompleto: TemplateMensagem = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performance: {
        totalEnviado: 0,
        taxaEntrega: 0,
        taxaLeitura: 0,
        taxaResposta: 0,
        taxaConversao: 0,
        custoMedio: 0,
        ultimoUso: new Date()
      }
    }

    this.templates.set(templateCompleto.id, templateCompleto)

    // Se for template do WhatsApp, submeter para aprovação
    if (template.canais.includes('whatsapp') && this.whatsappService) {
      try {
        await this.whatsappService.criarTemplate({
          nome: template.nome,
          categoria: 'UTILITY',
          idioma: 'pt_BR',
          componentes: template.conteudo.whatsapp?.components || []
        })
      } catch (error) {
        console.warn('Erro ao criar template no WhatsApp:', error)
      }
    }

    return templateCompleto.id
  }

  // Obter analytics de comunicação
  async obterAnalytics(periodo: { inicio: Date; fim: Date }) {
    return this.messageTracker.gerarAnalytics(periodo)
  }

  // Integração com sistema de ações rápidas
  async integrarComAcoesRapidas(): Promise<void> {
    // Escutar eventos de ações rápidas e converter em mensagens
    // Esta integração conecta o sistema ML com a comunicação real
    
    // Registrar callback para quando uma ação rápida for executada
    // Em produção, seria feito através de event listeners ou pub/sub
  }

  // Métodos privados de apoio
  private async determinarMelhorCanal(mensagem: MensagemEnvio): Promise<'whatsapp' | 'sms' | 'email'> {
    const destinatario = mensagem.destinatario
    
    // Usar ML para determinar melhor canal baseado no histórico
    try {
      const predicao = await mlEngine.preverMelhorCanal({
        pacienteId: destinatario.pacienteId,
        canalPreferido: destinatario.canalPreferido,
        horarioEnvio: new Date().getHours(),
        tipoMensagem: mensagem.contexto.tipoAcao,
        urgencia: mensagem.configuracao.prioridade
      })

      if (predicao && this.canalDisponivel(predicao.canal)) {
        return predicao.canal as 'whatsapp' | 'sms' | 'email'
      }
    } catch (error) {
      console.warn('Erro na predição ML, usando canal preferido:', error)
    }

    // Fallback para canal preferido
    if (this.canalDisponivel(destinatario.canalPreferido)) {
      return destinatario.canalPreferido
    }

    // Fallback final
    if (this.config.whatsapp.ativo) return 'whatsapp'
    if (this.config.sms.ativo) return 'sms'
    if (this.config.email.ativo) return 'email'
    
    throw new Error('Nenhum canal de comunicação disponível')
  }

  private canalDisponivel(canal: string): boolean {
    switch (canal) {
      case 'whatsapp':
        return this.config.whatsapp.ativo && !!this.whatsappService
      case 'sms':
        return this.config.sms.ativo && !!this.smsService
      case 'email':
        return this.config.email.ativo && !!this.emailService
      default:
        return false
    }
  }

  private async aplicarPersonalizacaoInteligente(mensagem: MensagemEnvio): Promise<void> {
    // Usar ML para personalizar mensagem baseada no perfil do paciente
    try {
      const personalizacao = await mlEngine.personalizarMensagem({
        pacienteId: mensagem.destinatario.pacienteId,
        tipoAcao: mensagem.contexto.tipoAcao,
        canal: mensagem.tipo,
        conteudoOriginal: mensagem.conteudo.corpo,
        dadosPaciente: mensagem.contexto.dadosPersonalizacao
      })

      if (personalizacao) {
        mensagem.conteudo.corpo = personalizacao.conteudoPersonalizado
        mensagem.conteudo.assunto = personalizacao.assuntoPersonalizado
      }
    } catch (error) {
      console.warn('Erro na personalização ML:', error)
    }
  }

  private async obterPacientesElegiveis(campanha: CampanhaComunicacao): Promise<any[]> {
    // Simular busca de pacientes baseada nos critérios da campanha
    // Em produção, faria query no banco de dados
    
    const pacientesSimulados = [
      {
        id: 'pac_1',
        nome: 'Maria Silva',
        email: 'maria@email.com',
        telefone: '+5511999999001',
        whatsapp: '+5511999999001',
        canalPreferido: 'whatsapp',
        segmento: 'inativo_30_dias',
        dadosPersonalizacao: {
          nome: 'Maria',
          proximaConsulta: '15/09/2024'
        }
      },
      {
        id: 'pac_2',
        nome: 'João Santos',
        email: 'joao@email.com',
        telefone: '+5511999999002',
        canalPreferido: 'email',
        segmento: 'ativo',
        dadosPersonalizacao: {
          nome: 'João',
          ultimaConsulta: '20/08/2024'
        }
      }
    ]

    return pacientesSimulados.filter(p => 
      campanha.publico.segmentos.includes(p.segmento)
    )
  }

  private async criarMensagemCampanha(
    campanha: CampanhaComunicacao, 
    paciente: any
  ): Promise<MensagemEnvio> {
    const template = this.templates.get(campanha.configuracao.templateId)
    
    return {
      id: `msg_${campanha.id}_${paciente.id}_${Date.now()}`,
      tipo: campanha.configuracao.canais[0], // Usar primeiro canal da campanha
      destinatario: {
        pacienteId: paciente.id,
        nome: paciente.nome,
        email: paciente.email,
        telefone: paciente.telefone,
        whatsapp: paciente.whatsapp,
        canalPreferido: paciente.canalPreferido
      },
      conteudo: {
        assunto: template?.conteudo.email?.assunto || campanha.nome,
        corpo: template?.conteudo.sms.corpo || `Olá ${paciente.nome}, confira nossa oferta especial!`,
        templateId: template?.id
      },
      configuracao: {
        prioridade: 'normal',
        agendarPara: new Date(),
        requireConfirmacao: false,
        trackingEnabled: true,
        followUpAutomatico: true,
        tentativasMaximas: 3
      },
      contexto: {
        campanhaId: campanha.id,
        acaoOrigemId: campanha.id,
        tipoAcao: 'campanha',
        tags: ['campanha', campanha.nome],
        dadosPersonalizacao: paciente.dadosPersonalizacao
      },
      status: 'pendente',
      timestamps: {
        criado: new Date()
      },
      resultados: {
        tentativasRealizadas: 0,
        entregaConfirmada: false,
        leituraConfirmada: false
      }
    }
  }

  private async validarWebhook(
    canal: 'whatsapp' | 'sms' | 'email',
    dados: any,
    assinatura?: string
  ): Promise<boolean> {
    switch (canal) {
      case 'whatsapp':
        return this.whatsappService?.validarWebhookToken(dados.hub?.verify_token || '') || false
      case 'sms':
        return true // SMS providers têm validações específicas
      case 'email':
        return true // Email providers têm validações específicas
      default:
        return false
    }
  }

  private async coletarFeedbackCampanha(campanha: CampanhaComunicacao): Promise<void> {
    // Coletar feedback da campanha para o sistema ML
    await quickActionsEngine.coletarFeedbackAcao(campanha.id, {
      enviados: campanha.resultados.entregues,
      entregues: campanha.resultados.entregues,
      lidas: campanha.resultados.lidas,
      respondidas: campanha.resultados.respondidas,
      conversoes: campanha.resultados.conversoes,
      custo: campanha.resultados.custoTotal,
      tempo: campanha.execucao.finalizadaEm 
        ? campanha.execucao.finalizadaEm.getTime() - campanha.execucao.iniciadaEm!.getTime()
        : 0
    })
  }

  private determinarStatusGeral(statusCanais: any): 'ativo' | 'manutencao' | 'limitado' | 'erro' {
    const canaisAtivos = Object.values(statusCanais).filter((canal: any) => canal.conectado)
    
    if (canaisAtivos.length === 0) return 'erro'
    if (canaisAtivos.length < Object.keys(statusCanais).length) return 'limitado'
    return 'ativo'
  }

  private gerarAlertas(statusCanais: any, statusFila: any): any[] {
    const alertas = []

    // Alerta de fila grande
    if (statusFila.aguardando > 100) {
      alertas.push({
        tipo: 'limite_atingido',
        mensagem: `${statusFila.aguardando} mensagens aguardando na fila`,
        timestamp: new Date(),
        severidade: 'warning',
        resolvido: false
      })
    }

    // Alertas por canal
    if (!statusCanais.whatsapp.conectado && this.config.whatsapp.ativo) {
      alertas.push({
        tipo: 'falha_conexao',
        canal: 'whatsapp',
        mensagem: 'WhatsApp desconectado',
        timestamp: new Date(),
        severidade: 'error',
        resolvido: false
      })
    }

    return alertas
  }

  private calcularMensagens24h(): number {
    // Em produção, consultaria métricas reais
    return 234
  }

  private calcularTaxaErro(): number {
    // Em produção, calcularia baseado em dados reais
    return 0.05 // 5%
  }

  private async calcularCustoDiario(): Promise<number> {
    // Em produção, somaria custos reais do dia
    return 45.60
  }

  private carregarTemplates(): void {
    // Carregar templates padrão
    const templatesDefault: TemplateMensagem[] = [
      {
        id: 'template_lembrete_consulta',
        nome: 'Lembrete de Consulta',
        categoria: 'lembrete',
        canais: ['whatsapp', 'sms', 'email'],
        conteudo: {
          whatsapp: {
            corpo: 'Olá {nome}! Lembrete: sua consulta está marcada para {data} às {hora}. Confirma presença?'
          },
          sms: {
            corpo: 'Lembrete: consulta em {data} às {hora}. Confirme: {link}',
            maxLength: 160
          },
          email: {
            assunto: 'Lembrete: Consulta em {data}',
            corpoTexto: 'Olá {nome}, este é um lembrete da sua consulta marcada para {data} às {hora}.',
            corpoHtml: '<p>Olá <strong>{nome}</strong>, este é um lembrete da sua consulta marcada para <strong>{data}</strong> às <strong>{hora}</strong>.</p>',
            template: 'basico'
          }
        },
        personalizacao: {
          variaveis: [
            {
              nome: 'nome',
              tipo: 'texto',
              obrigatorio: true,
              descricao: 'Nome do paciente',
              exemploValor: 'Maria Silva'
            },
            {
              nome: 'data',
              tipo: 'data',
              obrigatorio: true,
              descricao: 'Data da consulta',
              exemploValor: '25/09/2024'
            },
            {
              nome: 'hora',
              tipo: 'texto',
              obrigatorio: true,
              descricao: 'Horário da consulta',
              exemploValor: '14:00'
            }
          ],
          dinamico: true
        },
        configuracao: {
          ativo: true,
          aprovadoWhatsApp: false,
          versao: 1,
          criadoPor: 'sistema',
          ultimaEdicao: new Date(),
          tags: ['lembrete', 'consulta']
        },
        performance: {
          totalEnviado: 0,
          taxaEntrega: 0,
          taxaLeitura: 0,
          taxaResposta: 0,
          taxaConversao: 0,
          custoMedio: 0,
          ultimoUso: new Date()
        }
      }
    ]

    templatesDefault.forEach(template => {
      this.templates.set(template.id, template)
    })
  }
}