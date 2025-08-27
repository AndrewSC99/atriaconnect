// Sistema de Feedback e Aprendizado Contínuo

import { FeedbackAcao, PadraoComportamento, PredicaoIA } from '@/types/ml-types'
import { PacienteRisco, ResultadoAcaoRapida, TipoAcaoRapida } from '@/types/quick-actions'

export class FeedbackSystem {
  private feedbacksColetados: FeedbackAcao[] = []
  private padroesDetectados: PadraoComportamento[] = []
  private predicoesHistoricas: PredicaoIA[] = []

  constructor() {
    // Inicializar com dados mockados para demonstração
    this.initializeMockData()
  }

  // Coletar feedback de uma ação executada
  async coletarFeedback(
    acaoId: string,
    tipoAcao: TipoAcaoRapida,
    input: any,
    resultadoImediato: any
  ): Promise<string> {
    
    // Simular coleta de dados de resultado
    const output = await this.coletarDadosResultado(acaoId, tipoAcao)
    
    const feedback: FeedbackAcao = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      acaoId,
      tipoAcao,
      timestamp: new Date(),
      input,
      output,
      metricas: this.calcularMetricas(input, output),
    }
    
    this.feedbacksColetados.push(feedback)
    
    // Analisar padrões após coletar feedback
    await this.analisarPadroes()
    
    // Ajustar algoritmos baseado no feedback
    await this.ajustarAlgoritmos(feedback)
    
    return feedback.id
  }

  // Coletar dados de resultado (simulação de integração com sistemas reais)
  private async coletarDadosResultado(acaoId: string, tipoAcao: TipoAcaoRapida) {
    // Simular delay da coleta de dados
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Simular dados baseados no tipo de ação
    switch (tipoAcao) {
      case 'send-reminders':
        return {
          mensagensEnviadas: 3,
          entregues: 3,
          lidas: 2,
          respondidas: 1,
          reagendamentos: 1,
          cancelamentos: 0,
          receitaGerada: 180,
          tempoDecorrido: 4.5
        }
      
      case 'optimize-schedule':
        return {
          mensagensEnviadas: 0,
          entregues: 0,
          lidas: 0,
          respondidas: 0,
          reagendamentos: 4,
          cancelamentos: 0,
          receitaGerada: 720,
          tempoDecorrido: 0
        }
      
      case 'create-campaign':
        return {
          mensagensEnviadas: 15,
          entregues: 14,
          lidas: 12,
          respondidas: 4,
          reagendamentos: 3,
          cancelamentos: 1,
          receitaGerada: 540,
          tempoDecorrido: 24.2
        }
      
      default:
        return {
          mensagensEnviadas: 0,
          entregues: 0,
          lidas: 0,
          respondidas: 0,
          reagendamentos: 0,
          cancelamentos: 0,
          receitaGerada: 0,
          tempoDecorrido: 0
        }
    }
  }

  // Calcular métricas de performance
  private calcularMetricas(input: any, output: any) {
    const taxaConversao = output.mensagensEnviadas > 0 
      ? (output.reagendamentos / output.mensagensEnviadas) * 100 
      : 0
      
    const roi = input.custoEstimado 
      ? ((output.receitaGerada - input.custoEstimado) / input.custoEstimado) * 100
      : output.receitaGerada
      
    const satisfacaoEstimada = this.estimarSatisfacao(output)
    
    const acuraciaPredicao = this.calcularAcuraciaPredicao(input, output)
    
    return {
      taxaConversao,
      roi,
      satisfacaoEstimada,
      acuraciaPredicao
    }
  }

  // Estimar satisfação baseado nos resultados
  private estimarSatisfacao(output: any): number {
    let score = 50 // Base neutra
    
    // Fatores positivos
    if (output.respondidas / output.mensagensEnviadas > 0.3) score += 20
    if (output.reagendamentos > 0) score += 15
    if (output.tempoDecorrido < 12) score += 10 // Resposta rápida
    
    // Fatores negativos
    if (output.cancelamentos > 0) score -= 15
    if (output.lidas / output.entregues < 0.5) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  // Calcular acurácia das predições da IA
  private calcularAcuraciaPredicao(input: any, output: any): number {
    if (!input.predicoesIA) return 50
    
    const predicoes = input.predicoesIA
    let acertos = 0
    let total = 0
    
    // Verificar predição de taxa de conversão
    if (predicoes.taxaConversaoEsperada) {
      const diferenca = Math.abs(predicoes.taxaConversaoEsperada - (output.reagendamentos / output.mensagensEnviadas))
      if (diferenca < 0.1) acertos++ // Margem de 10%
      total++
    }
    
    // Verificar predição de tempo de resposta
    if (predicoes.tempoRespostaEsperado) {
      const diferenca = Math.abs(predicoes.tempoRespostaEsperado - output.tempoDecorrido)
      if (diferenca < 6) acertos++ // Margem de 6 horas
      total++
    }
    
    return total > 0 ? (acertos / total) * 100 : 50
  }

  // Analisar padrões nos feedbacks coletados
  async analisarPadroes(): Promise<void> {
    if (this.feedbacksColetados.length < 5) return // Precisa de dados mínimos
    
    // Análise de padrões temporais
    const padraoTemporal = this.analisarPadroesTemporais()
    if (padraoTemporal) {
      this.adicionarPadrao(padraoTemporal)
    }
    
    // Análise de padrões de resposta
    const padraoResposta = this.analisarPadroesResposta()
    if (padraoResposta) {
      this.adicionarPadrao(padraoResposta)
    }
    
    // Análise de padrões de ROI
    const padraoROI = this.analisarPadroesROI()
    if (padraoROI) {
      this.adicionarPadrao(padraoROI)
    }
  }

  // Analisar padrões temporais
  private analisarPadroesTemporais(): PadraoComportamento | null {
    const feedbacksPorHorario = new Map<number, FeedbackAcao[]>()
    
    this.feedbacksColetados.forEach(feedback => {
      const hora = feedback.timestamp.getHours()
      if (!feedbacksPorHorario.has(hora)) {
        feedbacksPorHorario.set(hora, [])
      }
      feedbacksPorHorario.get(hora)!.push(feedback)
    })
    
    // Encontrar horário com melhor performance
    let melhorHorario = -1
    let melhorTaxaConversao = 0
    
    feedbacksPorHorario.forEach((feedbacks, hora) => {
      const taxaMedia = feedbacks.reduce((sum, f) => sum + f.metricas.taxaConversao, 0) / feedbacks.length
      if (taxaMedia > melhorTaxaConversao) {
        melhorTaxaConversao = taxaMedia
        melhorHorario = hora
      }
    })
    
    if (melhorHorario >= 0 && melhorTaxaConversao > 20) {
      return {
        id: `padrao_temporal_${Date.now()}`,
        tipo: 'temporal',
        padrao: {
          nome: `Melhor horário para ações: ${melhorHorario}h`,
          descricao: `Ações executadas às ${melhorHorario}h têm ${melhorTaxaConversao.toFixed(1)}% mais conversão`,
          confianca: Math.min(0.9, feedbacksPorHorario.get(melhorHorario)!.length / 10),
          frequencia: feedbacksPorHorario.get(melhorHorario)!.length,
          ultimaOcorrencia: new Date()
        },
        dados: {
          horarios: [`${melhorHorario}:00`]
        },
        acoesSugeridas: [{
          tipo: 'ajustar_horario_padrao',
          configuracao: { horario: `${melhorHorario}:00` },
          impactoEstimado: melhorTaxaConversao,
          prioridade: 8
        }],
        performance: {
          vezesAplicado: 0,
          sucessoMedio: melhorTaxaConversao,
          roiMedio: 0,
        }
      }
    }
    
    return null
  }

  // Analisar padrões de resposta
  private analisarPadroesResposta(): PadraoComportamento | null {
    const feedbacksComResposta = this.feedbacksColetados.filter(f => f.output.respondidas > 0)
    
    if (feedbacksComResposta.length < 3) return null
    
    // Analisar tempo médio de resposta
    const tempoMedioResposta = feedbacksComResposta.reduce((sum, f) => sum + f.output.tempoDecorrido, 0) / feedbacksComResposta.length
    
    return {
      id: `padrao_resposta_${Date.now()}`,
      tipo: 'comportamental',
      padrao: {
        nome: 'Padrão de tempo de resposta',
        descricao: `Pacientes respondem em média em ${tempoMedioResposta.toFixed(1)} horas`,
        confianca: Math.min(0.8, feedbacksComResposta.length / 10),
        frequencia: feedbacksComResposta.length,
        ultimaOcorrencia: new Date()
      },
      dados: {},
      acoesSugeridas: [{
        tipo: 'otimizar_timing_followup',
        configuracao: { horasEspera: Math.ceil(tempoMedioResposta + 2) },
        impactoEstimado: 15,
        prioridade: 6
      }],
      performance: {
        vezesAplicado: 0,
        sucessoMedio: 0,
        roiMedio: 0,
      }
    }
  }

  // Analisar padrões de ROI
  private analisarPadroesROI(): PadraoComportamento | null {
    const roisPositivos = this.feedbacksColetados.filter(f => f.metricas.roi > 100)
    
    if (roisPositivos.length < 2) return null
    
    const roiMedio = roisPositivos.reduce((sum, f) => sum + f.metricas.roi, 0) / roisPositivos.length
    
    return {
      id: `padrao_roi_${Date.now()}`,
      tipo: 'comportamental',
      padrao: {
        nome: 'Padrão de ROI positivo',
        descricao: `Ações bem-sucedidas geram ROI médio de ${roiMedio.toFixed(0)}%`,
        confianca: 0.7,
        frequencia: roisPositivos.length,
        ultimaOcorrencia: new Date()
      },
      dados: {},
      acoesSugeridas: [{
        tipo: 'replicar_acoes_sucesso',
        configuracao: { roiMinimo: roiMedio * 0.8 },
        impactoEstimado: roiMedio,
        prioridade: 9
      }],
      performance: {
        vezesAplicado: 0,
        sucessoMedio: roiMedio,
        roiMedio,
      }
    }
  }

  // Adicionar novo padrão detectado
  private adicionarPadrao(padrao: PadraoComportamento): void {
    // Verificar se padrão similar já existe
    const padraoExistente = this.padroesDetectados.find(p => 
      p.tipo === padrao.tipo && p.padrao.nome.includes(padrao.padrao.nome.split(' ')[0])
    )
    
    if (padraoExistente) {
      // Atualizar padrão existente
      padraoExistente.padrao.confianca = Math.max(padraoExistente.padrao.confianca, padrao.padrao.confianca)
      padraoExistente.padrao.frequencia += padrao.padrao.frequencia
      padraoExistente.padrao.ultimaOcorrencia = new Date()
    } else {
      // Adicionar novo padrão
      this.padroesDetectados.push(padrao)
    }
  }

  // Ajustar algoritmos baseado no feedback
  async ajustarAlgoritmos(feedback: FeedbackAcao): Promise<void> {
    // Ajustar pesos do algoritmo de scoring baseado na efetividade
    if (feedback.metricas.taxaConversao > 50) {
      this.aumentarPesosFatoresPositivos(feedback)
    } else if (feedback.metricas.taxaConversao < 20) {
      this.diminuirPesosFatoresNegativos(feedback)
    }
    
    // Ajustar templates de mensagem baseado na resposta
    if (feedback.output.respondidas > 0) {
      this.otimizarTemplatesMensagem(feedback)
    }
  }

  // Aumentar pesos dos fatores que levaram ao sucesso
  private aumentarPesosFatoresPositivos(feedback: FeedbackAcao): void {
    // Em implementação real, ajustaria pesos no algoritmo de ML
    console.log(`Ajustando pesos positivamente baseado em feedback ${feedback.id}`)
  }

  // Diminuir pesos dos fatores que levaram ao insucesso
  private diminuirPesosFatoresNegativos(feedback: FeedbackAcao): void {
    console.log(`Ajustando pesos negativamente baseado em feedback ${feedback.id}`)
  }

  // Otimizar templates baseado nas respostas
  private otimizarTemplatesMensagem(feedback: FeedbackAcao): void {
    console.log(`Otimizando templates baseado em feedback ${feedback.id}`)
  }

  // Obter estatísticas do sistema de feedback
  getEstatisticas() {
    const totalFeedbacks = this.feedbacksColetados.length
    const taxaConversaoMedia = totalFeedbacks > 0
      ? this.feedbacksColetados.reduce((sum, f) => sum + f.metricas.taxaConversao, 0) / totalFeedbacks
      : 0
    
    const roiMedio = totalFeedbacks > 0
      ? this.feedbacksColetados.reduce((sum, f) => sum + f.metricas.roi, 0) / totalFeedbacks
      : 0
    
    const acuraciaIAMedia = totalFeedbacks > 0
      ? this.feedbacksColetados.reduce((sum, f) => sum + f.metricas.acuraciaPredicao, 0) / totalFeedbacks
      : 0

    return {
      totalFeedbacks,
      totalPadroes: this.padroesDetectados.length,
      performance: {
        taxaConversaoMedia: taxaConversaoMedia.toFixed(1),
        roiMedio: roiMedio.toFixed(0),
        acuraciaIAMedia: acuraciaIAMedia.toFixed(1),
        satisfacaoMedia: totalFeedbacks > 0
          ? this.feedbacksColetados.reduce((sum, f) => sum + f.metricas.satisfacaoEstimada, 0) / totalFeedbacks
          : 0
      },
      tendencias: {
        melhorando: taxaConversaoMedia > 30,
        precisaoIA: acuraciaIAMedia > 70,
        roiPositivo: roiMedio > 100
      }
    }
  }

  // Obter padrões detectados
  getPadroesDetectados(): PadraoComportamento[] {
    return this.padroesDetectados.sort((a, b) => b.padrao.confianca - a.padrao.confianca)
  }

  // Obter feedback detalhado por ID
  getFeedbackDetalhado(feedbackId: string): FeedbackAcao | null {
    return this.feedbacksColetados.find(f => f.id === feedbackId) || null
  }

  // Limpar dados antigos (GDPR compliance)
  async limparDadosAntigos(diasRetencao: number = 365): Promise<number> {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - diasRetencao)
    
    const feedbacksParaRemover = this.feedbacksColetados.filter(f => f.timestamp < dataLimite)
    this.feedbacksColetados = this.feedbacksColetados.filter(f => f.timestamp >= dataLimite)
    
    return feedbacksParaRemover.length
  }

  // Inicializar com dados mockados para demonstração
  private initializeMockData(): void {
    // Gerar alguns feedbacks históricos mockados
    const feedbacksMock: FeedbackAcao[] = [
      {
        id: 'fb_mock_1',
        acaoId: 'acao_1',
        tipoAcao: 'send-reminders',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        input: { pacientesSelecionados: ['1', '2', '3'] },
        output: { mensagensEnviadas: 3, entregues: 3, lidas: 2, respondidas: 2, reagendamentos: 2, cancelamentos: 0, receitaGerada: 360, tempoDecorrido: 3.5 },
        metricas: { taxaConversao: 66.7, roi: 180, satisfacaoEstimada: 85, acuraciaPredicao: 78 }
      },
      {
        id: 'fb_mock_2',
        acaoId: 'acao_2',
        tipoAcao: 'create-campaign',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 dias atrás
        input: { campanha: 'happy_hour' },
        output: { mensagensEnviadas: 12, entregues: 11, lidas: 9, respondidas: 4, reagendamentos: 3, cancelamentos: 1, receitaGerada: 450, tempoDecorrido: 18.2 },
        metricas: { taxaConversao: 25.0, roi: 125, satisfacaoEstimada: 70, acuraciaPredicao: 82 }
      },
      {
        id: 'fb_mock_3',
        acaoId: 'acao_3',
        tipoAcao: 'optimize-schedule',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 dias atrás
        input: { otimizacao: 'automatica' },
        output: { mensagensEnviadas: 0, entregues: 0, lidas: 0, respondidas: 0, reagendamentos: 5, cancelamentos: 0, receitaGerada: 900, tempoDecorrido: 0 },
        metricas: { taxaConversao: 100, roi: 400, satisfacaoEstimada: 90, acuraciaPredicao: 95 }
      }
    ]
    
    this.feedbacksColetados = feedbacksMock
    
    // Analisar padrões iniciais
    this.analisarPadroes()
  }
}

// Instância global do sistema de feedback
export const feedbackSystem = new FeedbackSystem()