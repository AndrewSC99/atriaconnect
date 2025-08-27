// Motor de IA para Ações Rápidas Inteligentes

import { PacienteRisco, ConfiguracoesAcoesRapidas, InsightIA, TipoAcaoRapida } from '@/types/quick-actions'
import { MLEngine } from './ml-engine'
import { FeedbackSystem } from './feedback-system'
import { PredicaoIA, PadraoComportamento, InsightAvancado } from '@/types/ml-types'

// Simulação de dados de pacientes (em produção viria do banco de dados)
const pacientesMock: PacienteRisco[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 99999-0001',
    ultimaConsulta: new Date('2024-06-15'),
    proximaConsulta: new Date('2024-09-15'),
    scorePrioridade: 85,
    motivoContato: 'Não comparece há 68 dias - Alto risco de abandono',
    categoria: 'Regular',
    patologias: ['diabetes', 'hipertensao'],
    canalPreferido: 'whatsapp',
    mensagemSugerida: 'Olá Maria! Sentimos sua falta. Que tal remarcarmos sua consulta? Sua saúde é nossa prioridade! 🌟',
    historico: {
      totalConsultas: 12,
      faltas: 2,
      cancelamentos: 1,
      taxaAdesao: 85
    },
    metas: {
      peso: { atual: 78, objetivo: 70, progresso: 65 },
      exercicio: { frequencia: 2, objetivo: 4 },
      adherencia: 85
    }
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@email.com',
    telefone: '(11) 99999-0002',
    ultimaConsulta: new Date('2024-07-20'),
    proximaConsulta: new Date('2024-08-25'),
    scorePrioridade: 72,
    motivoContato: 'Retorno pendente - Consulta próxima',
    categoria: 'VIP',
    patologias: ['obesidade'],
    canalPreferido: 'sms',
    mensagemSugerida: 'Oi João! Sua consulta de retorno está marcada para o dia 25/08. Confirma presença? 📅',
    historico: {
      totalConsultas: 8,
      faltas: 1,
      cancelamentos: 0,
      taxaAdesao: 92
    },
    metas: {
      peso: { atual: 95, objetivo: 85, progresso: 40 },
      exercicio: { frequencia: 3, objetivo: 5 },
      adherencia: 92
    }
  },
  {
    id: '3',
    nome: 'Ana Costa',
    email: 'ana@email.com',
    telefone: '(11) 99999-0003',
    ultimaConsulta: new Date('2024-08-05'),
    scorePrioridade: 58,
    motivoContato: 'Meta de peso não atingida - Precisa motivação',
    categoria: 'Regular',
    patologias: [],
    canalPreferido: 'email',
    mensagemSugerida: 'Ana, você está no caminho certo! Vamos ajustar sua dieta para acelerar os resultados? 💪',
    historico: {
      totalConsultas: 6,
      faltas: 0,
      cancelamentos: 1,
      taxaAdesao: 75
    },
    metas: {
      peso: { atual: 68, objetivo: 63, progresso: 30 },
      exercicio: { frequencia: 4, objetivo: 5 },
      adherencia: 75
    }
  },
  {
    id: '4',
    nome: 'Roberto Lima',
    email: 'roberto@email.com',
    telefone: '(11) 99999-0004',
    ultimaConsulta: new Date('2024-05-10'),
    scorePrioridade: 92,
    motivoContato: 'Abandono crítico - 105 dias sem consulta',
    categoria: 'Inativo',
    patologias: ['hipertensao', 'colesterol alto'],
    canalPreferido: 'whatsapp',
    mensagemSugerida: 'Roberto, que saudade! Sabemos que a vida corrida dificulta, mas sua saúde não pode esperar. Vamos conversar? 🏥',
    historico: {
      totalConsultas: 15,
      faltas: 4,
      cancelamentos: 2,
      taxaAdesao: 60
    },
    metas: {
      peso: { atual: 88, objetivo: 80, progresso: 20 },
      exercicio: { frequencia: 1, objetivo: 3 },
      adherencia: 60
    }
  },
  {
    id: '5',
    nome: 'Laura Mendes',
    email: 'laura@email.com',
    telefone: '(11) 99999-0005',
    ultimaConsulta: new Date('2024-08-10'),
    scorePrioridade: 25,
    motivoContato: 'Paciente ativa - Acompanhamento de rotina',
    categoria: 'VIP',
    patologias: [],
    canalPreferido: 'whatsapp',
    mensagemSugerida: 'Laura, parabéns pelo progresso! Vamos manter o foco nos seus objetivos? 🎯',
    historico: {
      totalConsultas: 10,
      faltas: 0,
      cancelamentos: 0,
      taxaAdesao: 98
    },
    metas: {
      peso: { atual: 58, objetivo: 55, progresso: 80 },
      exercicio: { frequencia: 5, objetivo: 5 },
      adherencia: 98
    }
  }
]

export class QuickActionsEngine {
  private configuracoes: ConfiguracoesAcoesRapidas
  private mlEngine: MLEngine
  private feedbackSystem: FeedbackSystem

  constructor(configuracoes: ConfiguracoesAcoesRapidas) {
    this.configuracoes = configuracoes
    this.mlEngine = new MLEngine()
    this.feedbackSystem = new FeedbackSystem()
  }

  // Algoritmo de scoring inteligente com ML
  private async calcularScore(paciente: PacienteRisco): Promise<number> {
    // Score base (algoritmo original)
    let score = 0
    
    // Fator 1: Dias sem consulta (peso 35%)
    const diasSemConsulta = Math.floor(
      (new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diasSemConsulta > 90) score += 35
    else if (diasSemConsulta > 60) score += 25
    else if (diasSemConsulta > 30) score += 15
    else if (diasSemConsulta > 14) score += 8
    
    // Fator 2: Histórico de faltas (peso 20%)
    const taxaFaltas = (paciente.historico.faltas / paciente.historico.totalConsultas) * 100
    if (taxaFaltas > 30) score += 20
    else if (taxaFaltas > 20) score += 15
    else if (taxaFaltas > 10) score += 10
    else score += 5
    
    // Fator 3: Taxa de adesão (peso 20%)
    if (paciente.historico.taxaAdesao < 60) score += 20
    else if (paciente.historico.taxaAdesao < 70) score += 15
    else if (paciente.historico.taxaAdesao < 80) score += 10
    else score += 5
    
    // Fator 4: Progresso das metas (peso 15%)
    const progressoMedio = paciente.metas.peso?.progresso || 50
    if (progressoMedio < 30) score += 15
    else if (progressoMedio < 50) score += 10
    else if (progressoMedio < 70) score += 8
    else score += 3
    
    // Fator 5: Patologias críticas (peso 10%)
    const patologiasCriticas = ['diabetes', 'hipertensao', 'obesidade', 'colesterol alto']
    const temPatologiaCritica = paciente.patologias.some(p => patologiasCriticas.includes(p))
    if (temPatologiaCritica) score += 10
    
    const scoreBase = Math.min(score, 100)
    
    // Predição ML para abandonar (ajuste baseado em IA)
    try {
      const predicaoAbandono = await this.mlEngine.preverAbandonoPaciente({
        pacienteId: paciente.id,
        diasSemConsulta,
        taxaFaltas,
        taxaAdesao: paciente.historico.taxaAdesao,
        progressoMetas: progressoMedio,
        temPatologiaCritica,
        categoria: paciente.categoria,
        historico: paciente.historico
      })
      
      // Ajustar score base com predição ML (peso 30%)
      const ajusteML = predicaoAbandono.probabilidade * 30
      return Math.min(scoreBase + ajusteML, 100)
      
    } catch (error) {
      console.warn('Falha na predição ML, usando score base:', error)
      return scoreBase
    }
  }

  // Personalização de mensagens usando IA
  private personalizarMensagem(paciente: PacienteRisco, template: string): string {
    const diasSemConsulta = Math.floor(
      (new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Templates baseados no contexto do paciente
    if (diasSemConsulta > 90) {
      const mensagensAbandono = [
        `${paciente.nome}, que saudade! Sabemos que a vida corrida dificulta, mas sua saúde não pode esperar. Vamos conversar? 🏥`,
        `Oi ${paciente.nome}! Sentimos muito sua falta. Que tal remarcarmos e colocarmos seus objetivos em dia? 💪`,
        `${paciente.nome}, você faz falta aqui! Vamos retomar seu acompanhamento? Sua saúde é prioridade! ⭐`
      ]
      return mensagensAbandono[Math.floor(Math.random() * mensagensAbandono.length)]
    }
    
    if (paciente.proximaConsulta && new Date(paciente.proximaConsulta).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000) {
      const data = new Date(paciente.proximaConsulta).toLocaleDateString()
      return `Oi ${paciente.nome}! Sua consulta de retorno está marcada para o dia ${data}. Confirma presença? 📅`
    }
    
    if (paciente.metas.peso && paciente.metas.peso.progresso < 50) {
      const mensagensmotivacao = [
        `${paciente.nome}, você está no caminho certo! Vamos ajustar sua estratégia para acelerar os resultados? 🎯`,
        `Oi ${paciente.nome}! Juntos vamos conquistar seus objetivos. Que tal uma consultinha para reajustar? 💪`,
        `${paciente.nome}, cada passo conta! Vamos potencializar seus resultados? 🌟`
      ]
      return mensagensmotivacao[Math.floor(Math.random() * mensagensmotivacao.length)]
    }
    
    return template.replace('{nome}', paciente.nome)
  }

  // Seleção inteligente de pacientes para lembretes
  async identificarPacientesParaLembretes(): Promise<{
    sugeridos: PacienteRisco[]
    todos: PacienteRisco[]
  }> {
    // Simular delay de processamento IA
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const config = this.configuracoes.lembretes
    
    // Aplicar filtros básicos
    let pacientesFiltrados = pacientesMock.filter(paciente => {
      // Excluir pacientes da lista de exclusão
      if (config.exclusoes.pacientesExcluidos.includes(paciente.id)) return false
      
      // Filtro por dias sem consulta
      const diasSemConsulta = Math.floor(
        (new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diasSemConsulta < config.criteriosAutomaticos.diasSemConsulta) return false
      
      return true
    })
    
    // Calcular scores e personalizar mensagens com ML
    const pacientesComScore = await Promise.all(
      pacientesFiltrados.map(async paciente => ({
        ...paciente,
        scorePrioridade: await this.calcularScore(paciente),
        mensagemSugerida: this.personalizarMensagem(
          paciente, 
          config.mensagens.templatesPersonalizados.abandono
        )
      }))
    )
    
    // Ordenar por score (maior prioridade primeiro)
    const pacientesOrdenados = pacientesComScore.sort((a, b) => b.scorePrioridade - a.scorePrioridade)
    
    // Aplicar filtro de score mínimo
    const pacientesElegiveis = pacientesOrdenados.filter(
      p => p.scorePrioridade >= config.criteriosAutomaticos.scoreMinimo
    )
    
    // Selecionar top N pacientes para sugestão
    const maxPacientes = Math.min(config.criteriosAutomaticos.maxPacientesPorDia, 5)
    const pacientesSugeridos = pacientesElegiveis.slice(0, maxPacientes)
    
    return {
      sugeridos: pacientesSugeridos,
      todos: pacientesOrdenados
    }
  }

  // Otimização inteligente de agenda com ML
  async otimizarAgenda(): Promise<{
    sugestoes: string[]
    economia: number
    detalhes: any
    predicaoML?: any
  }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Usar ML para otimização de horários
    const predicaoOtimizacao = await this.mlEngine.otimizarAgenda({
      agendaAtual: {
        horariosVazios: 6,
        consultasAgendadas: 45,
        taxaOcupacao: 0.75,
        padraoSemanal: [0.8, 0.9, 0.7, 0.85, 0.6, 0.4, 0.3] // seg-dom
      },
      historicoPacientes: pacientesMock.length
    })
    
    const sugestoes = [
      `${predicaoOtimizacao.horariosOtimizados} horários vagos identificados com maior potencial`,
      'Reagrupar consultas similares para maximizar eficiência',
      `Mover ${predicaoOtimizacao.realocacoesSugeridas} consultas para horários de baixa demanda`,
      'IA sugere criar blocos temáticos para tipos específicos de consulta'
    ]
    
    const detalhes = {
      horariosVaziosEncontrados: predicaoOtimizacao.horariosVazios,
      consultasRealocaveis: predicaoOtimizacao.realocacoesSugeridas,
      melhoriaFluxo: `${Math.round(predicaoOtimizacao.melhoriaEficiencia * 100)}%`,
      aumentoCapacidade: `${Math.round(predicaoOtimizacao.aumentoCapacidade * 100)}%`,
      confiancaML: predicaoOtimizacao.confianca
    }
    
    return {
      sugestoes,
      economia: predicaoOtimizacao.economiaHoras,
      detalhes,
      predicaoML: predicaoOtimizacao
    }
  }

  // Geração de relatório inteligente
  async gerarRelatorio(): Promise<{
    resumo: any
    insights: string[]
    metricas: any
  }> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const resumo = {
      periodo: 'Agosto 2024',
      consultasRealizadas: 47,
      novosClientes: 8,
      receitaTotal: 8460,
      taxaRetencao: 94.2
    }
    
    const insights = [
      'Receita cresceu 18% vs mês anterior',
      '3 pacientes em risco de abandono identificados',
      'Terças-feiras têm 40% mais demanda que sextas',
      'Taxa de no-show reduziu para 5.8% (melhor do ano)',
      'Consultas online representam 35% da receita'
    ]
    
    const metricas = {
      satisfacaoMedia: 9.2,
      tempoMedioConsulta: 42,
      taxaReagendamento: 12.5,
      crescimentoMensal: 18.3
    }
    
    return {
      resumo,
      insights,
      metricas
    }
  }

  // Criação de campanha inteligente com ML
  async criarCampanha(): Promise<{
    campanha: any
    segmento: any
    previsao: any
    predicaoML?: any
  }> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Usar ML para predizer conversão da campanha
    const predicaoConversao = await this.mlEngine.preverConversaoCampanha({
      tipoDesconto: 20,
      segmentoAlvo: 'inativos_30_dias',
      canais: ['whatsapp', 'email'],
      historicoCampanhas: 5,
      pacientesElegiveis: 23
    })
    
    // Análise de horários com baixa ocupação baseada em ML
    const horariosVazios = [
      { dia: 'Segunda', horario: '14:00-16:00', ocupacao: 30, potencial: predicaoConversao.melhorHorario?.segunda || 0.15 },
      { dia: 'Sexta', horario: '15:00-17:00', ocupacao: 45, potencial: predicaoConversao.melhorHorario?.sexta || 0.22 }
    ]
    
    const campanha = {
      nome: 'Happy Hour Nutricional IA',
      descricao: `${predicaoConversao.descontoOtimo}% desconto para consultas em horários específicos (otimizado por IA)`,
      periodo: `${predicaoConversao.duracaoOtima} dias`,
      desconto: predicaoConversao.descontoOtimo,
      horarios: horariosVazios,
      segmentacaoIA: true
    }
    
    const segmento = {
      pacientesAlvo: predicaoConversao.publicoAlvo,
      criterios: predicaoConversao.criteriosOtimizados,
      canais: predicaoConversao.canaisRecomendados,
      personalizacao: predicaoConversao.personalizacao
    }
    
    const previsao = {
      conversaoEstimada: predicaoConversao.taxaConversao * 100,
      receitaAdicional: predicaoConversao.receitaEstimada,
      consultasExtras: predicaoConversao.consultasEsperadas,
      roi: predicaoConversao.roi,
      confiancaML: predicaoConversao.confianca
    }
    
    return {
      campanha,
      segmento,
      previsao,
      predicaoML: predicaoConversao
    }
  }

  // Geração de insights automáticos
  async gerarInsights(): Promise<InsightIA[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const insights: InsightIA[] = [
      {
        id: '1',
        tipo: 'alerta',
        categoria: 'pacientes',
        titulo: '4 pacientes em risco crítico de abandono',
        descricao: 'Pacientes sem consulta há mais de 90 dias com alto valor histórico',
        dados: {
          metrica: 'dias_sem_consulta',
          valor: 105,
          variacao: 15,
          contexto: { pacientes: ['Roberto Lima', 'Maria Silva'], valorTotal: 2400 }
        },
        acao: {
          sugerida: 'Enviar lembretes personalizados urgentes',
          tipo: 'send-reminders',
          configuracao: { prioridade: 'urgente', canal: 'whatsapp' },
          impactoEstimado: { receita: 1200, satisfacao: 8 }
        },
        prioridade: 'alta',
        validadeAte: new Date('2024-09-30'),
        implementado: false
      },
      {
        id: '2',
        tipo: 'oportunidade',
        categoria: 'operacional',
        titulo: 'Otimização de agenda pode gerar 2.5h extras/semana',
        descricao: 'Reagrupamento inteligente de consultas similares',
        dados: {
          metrica: 'tempo_ocioso',
          valor: 2.5,
          variacao: -35,
          contexto: { horariosVazios: 6, realocacaoPossivel: 4 }
        },
        acao: {
          sugerida: 'Aplicar otimização automática de agenda',
          tipo: 'optimize-schedule',
          configuracao: { modo: 'agressivo', respeitarPreferencias: true },
          impactoEstimado: { tempo: 2.5, receita: 400 }
        },
        prioridade: 'media',
        validadeAte: new Date('2024-09-15'),
        implementado: false
      },
      {
        id: '3',
        tipo: 'recomendacao',
        categoria: 'financeiro',
        titulo: 'Campanha para horários vagos pode gerar R$ 1.240',
        descricao: 'Promoção para segundas e sextas com baixa ocupação',
        dados: {
          metrica: 'ocupacao_horarios',
          valor: 35,
          variacao: -20,
          contexto: { horariosDisponiveis: 8, demandaReprimida: 15 }
        },
        acao: {
          sugerida: 'Lançar campanha Happy Hour Nutricional',
          tipo: 'create-campaign',
          configuracao: { desconto: 20, horarios: 'baixa_demanda' },
          impactoEstimado: { receita: 1240, satisfacao: 7 }
        },
        prioridade: 'media',
        validadeAte: new Date('2024-09-20'),
        implementado: false
      }
    ]
    
    return insights
  }

  // Análise preditiva avançada
  async analisePreditivaAvancada(): Promise<{
    predicoes: PredicaoIA[]
    padroes: PadraoComportamento[]
    insights: InsightAvancado[]
    recomendacoes: string[]
  }> {
    // Gerar predições para todos os pacientes
    const predicoes: PredicaoIA[] = []
    
    for (const paciente of pacientesMock) {
      // Predição de abandono
      const predicaoAbandono = await this.mlEngine.preverAbandonoPaciente({
        pacienteId: paciente.id,
        diasSemConsulta: Math.floor((new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)),
        taxaFaltas: (paciente.historico.faltas / paciente.historico.totalConsultas) * 100,
        taxaAdesao: paciente.historico.taxaAdesao,
        progressoMetas: paciente.metas.peso?.progresso || 50,
        temPatologiaCritica: paciente.patologias.some(p => ['diabetes', 'hipertensao', 'obesidade'].includes(p)),
        categoria: paciente.categoria,
        historico: paciente.historico
      })
      
      predicoes.push({
        id: `pred-${paciente.id}`,
        modelo: 'abandono_predictor',
        timestamp: new Date(),
        input: {
          pacienteId: paciente.id,
          contexto: { ultimaConsulta: paciente.ultimaConsulta, categoria: paciente.categoria },
          features: {
            diasSemConsulta: Math.floor((new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)),
            taxaAdesao: paciente.historico.taxaAdesao,
            progressoMetas: paciente.metas.peso?.progresso || 50
          }
        },
        predicao: {
          valor: predicaoAbandono.probabilidade,
          probabilidade: predicaoAbandono.probabilidade,
          confianca: predicaoAbandono.confianca,
          categoria: predicaoAbandono.categoria,
          explicacao: predicaoAbandono.fatoresRisco
        }
      })
    }
    
    // Detectar padrões comportamentais
    const padroes = await this.mlEngine.detectarPadroes({
      pacientes: pacientesMock,
      janelaTemporal: 90,
      tiposAnalise: ['temporal', 'demografico', 'comportamental']
    })
    
    // Gerar insights avançados
    const insights = await this.mlEngine.gerarInsightsAvancados({
      predicoes,
      padroes,
      configuracoes: this.configuracoes
    })
    
    // Recomendações baseadas em ML
    const recomendacoes = [
      `IA identificou ${predicoes.filter(p => p.predicao.probabilidade > 0.7).length} pacientes com alto risco de abandono`,
      `Padrão detectado: ${padroes.length} comportamentos recorrentes podem ser automatizados`,
      `ML sugere focar em ${insights.filter(i => i.urgencia === 'alta').length} ações prioritárias`,
      'Sistema recomenda retreinar modelos com base nos novos dados coletados'
    ]
    
    return {
      predicoes,
      padroes,
      insights,
      recomendacoes
    }
  }

  // Feedback loop para aprendizado contínuo
  async coletarFeedbackAcao(acaoId: string, resultado: any): Promise<void> {
    await this.feedbackSystem.coletarFeedback({
      acaoId,
      tipoAcao: 'quick_action',
      timestamp: new Date(),
      input: {
        pacientesSelecionados: resultado.pacientes || [],
        configuracao: this.configuracoes,
        contexto: resultado.contexto || {}
      },
      output: {
        mensagensEnviadas: resultado.enviados || 0,
        entregues: resultado.entregues || 0,
        lidas: resultado.lidas || 0,
        respondidas: resultado.respondidas || 0,
        reagendamentos: resultado.reagendamentos || 0,
        cancelamentos: resultado.cancelamentos || 0,
        receitaGerada: resultado.receita || 0,
        tempoDecorrido: resultado.tempo || 0
      },
      metricas: {
        taxaConversao: (resultado.respondidas || 0) / (resultado.enviados || 1),
        roi: (resultado.receita || 0) / (resultado.custo || 1),
        satisfacaoEstimada: resultado.satisfacao || 0.7,
        acuraciaPredicao: resultado.acuracia || 0.8
      }
    })
  }

  // Auto-otimização baseada em feedback
  async otimizarConfiguracoes(): Promise<ConfiguracoesAcoesRapidas> {
    const analise = await this.feedbackSystem.analisarPerformance()
    const configuracaoOtima = await this.mlEngine.otimizarParametros({
      configuracaoAtual: this.configuracoes,
      historicoPerfomance: analise,
      objetivos: ['maximizar_conversao', 'minimizar_abandono', 'otimizar_receita']
    })
    
    // Aplicar apenas se a melhoria for significativa
    if (configuracaoOtima.melhoriaEstimada > 0.1) {
      this.configuracoes = { ...this.configuracoes, ...configuracaoOtima.novaConfiguracao }
    }
    
    return this.configuracoes
  }

  // Simulação de execução de ação
  async executarAcao(tipo: TipoAcaoRapida, config: any): Promise<{
    sucesso: boolean
    mensagem: string
    detalhes: any
    pacientesAfetados?: number
    tempoPoupado?: number
    receitaGerada?: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    switch (tipo) {
      case 'send-reminders':
        try {
          let sucessos = 0
          let falhas = 0
          const canais = { whatsapp: 0, sms: 0, email: 0 }
          
          // Enviar lembretes reais via API
          for (const paciente of config.pacientes || []) {
            try {
              const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content: `🔔 ${paciente.mensagem}`,
                  recipientId: paciente.id,
                  type: 'REMINDER'
                })
              })
              
              if (response.ok) {
                sucessos++
                // Contar por canal (simulado baseado no canal preferido)
                if (paciente.canal === 'whatsapp') canais.whatsapp++
                else if (paciente.canal === 'sms') canais.sms++
                else if (paciente.canal === 'email') canais.email++
              } else {
                falhas++
              }
            } catch (error) {
              console.error(`Erro ao enviar lembrete para ${paciente.nome}:`, error)
              falhas++
            }
          }
          
          return {
            sucesso: sucessos > 0,
            mensagem: falhas === 0 
              ? `✅ Lembretes enviados para ${sucessos} pacientes com sucesso!`
              : `⚠️ ${sucessos} lembretes enviados com sucesso, ${falhas} falharam.`,
            detalhes: {
              whatsapp: canais.whatsapp,
              sms: canais.sms,
              email: canais.email,
              entregues: sucessos,
              falhas: falhas,
              confirmacoes: 0 // Seriam atualizadas em tempo real
            },
            pacientesAfetados: sucessos
          }
        } catch (error) {
          console.error('Erro no envio de lembretes:', error)
          return {
            sucesso: false,
            mensagem: 'Erro ao enviar lembretes. Tente novamente.',
            detalhes: { erro: error instanceof Error ? error.message : 'Erro desconhecido' },
            pacientesAfetados: 0
          }
        }
        
      case 'optimize-schedule':
        return {
          sucesso: true,
          mensagem: 'Agenda otimizada! 3 realocações sugeridas e 2.5h economizadas.',
          detalhes: {
            realocacoes: 3,
            horariosOtimizados: 5,
            fluxoMelhorado: '35%',
            proximasAcoes: ['Confirmar realocações com pacientes', 'Atualizar sistema de agendamento']
          },
          tempoPoupado: 2.5
        }
        
      case 'generate-report':
        return {
          sucesso: true,
          mensagem: 'Relatório mensal gerado! Download disponível.',
          detalhes: {
            paginas: 12,
            graficos: 8,
            insights: 15,
            formato: 'PDF + Excel',
            enviadoPorEmail: true,
            salvoDaNuvem: true
          }
        }
        
      case 'create-campaign':
        return {
          sucesso: true,
          mensagem: 'Campanha "Happy Hour Nutricional" criada e ativada!',
          detalhes: {
            nome: 'Happy Hour Nutricional',
            desconto: '20%',
            publico: 23,
            duração: '15 dias',
            canais: ['WhatsApp', 'Email'],
            previsaoROI: '280%'
          },
          receitaGerada: 0, // Será atualizada conforme conversões
          pacientesAfetados: 23
        }
        
      default:
        return {
          sucesso: false,
          mensagem: 'Ação não reconhecida',
          detalhes: {}
        }
    }
  }
}

// Configuração padrão para testes
export const configuracaoPadrao: ConfiguracoesAcoesRapidas = {
  perfil: 'clinico',
  lembretes: {
    ativo: true,
    modoSelecao: 'hibrido',
    selecaoManual: { permitir: true, pacientesSelecionados: [] },
    criteriosAutomaticos: {
      diasSemConsulta: 30,
      incluirFaltosos: true,
      incluirMetasNaoAtingidas: true,
      incluirRetornosPendentes: true,
      scoreMinimo: 50,
      maxPacientesPorDia: 5
    },
    exclusoes: { pacientesExcluidos: [], diasSemana: [], horariosProibidos: [] },
    mensagens: {
      usarTemplates: true,
      templatesPersonalizados: {
        abandono: 'Olá {nome}, sentimos sua falta! Que tal remarcarmos?',
        retorno: 'Oi {nome}, seu retorno está próximo. Confirma?',
        metas: '{nome}, vamos verificar seu progresso?',
        motivacional: 'Continue firme, {nome}! 💪'
      },
      permitirEdicaoAnteEnvio: true,
      incluirAssinatura: true,
      assinatura: 'Equipe Nutricional'
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
  // Outras configurações simplificadas para o exemplo...
  otimizacao: {} as any,
  relatorios: {} as any,
  campanhas: {} as any,
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

// Instância global do engine (em produção seria injetada via DI)
export const quickActionsEngine = new QuickActionsEngine(configuracaoPadrao)