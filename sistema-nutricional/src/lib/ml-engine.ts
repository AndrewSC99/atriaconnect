// Motor de Machine Learning Avançado

import { ModeloML, PredicaoIA, PadraoComportamento, InsightAvancado } from '@/types/ml-types'
import { PacienteRisco } from '@/types/quick-actions'
import { feedbackSystem } from './feedback-system'

// Implementação simplificada de algoritmos de ML (em produção usaria TensorFlow.js)
export class MLEngine {
  private modelos: Map<string, ModeloML> = new Map()
  private predicoesCache: Map<string, PredicaoIA> = new Map()
  private dadosTreinamento: any[] = []

  constructor() {
    this.inicializarModelos()
    this.carregarDadosMock()
  }

  // Inicializar modelos base
  private inicializarModelos(): void {
    // Modelo para predição de abandono
    const modeloAbandono: ModeloML = {
      id: 'abandono_predictor',
      nome: 'Preditor de Abandono de Pacientes',
      tipo: 'classificacao',
      objetivo: 'Prever probabilidade de abandono do paciente',
      configuracao: {
        algoritmo: 'random_forest',
        parametros: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
          threshold: 0.7
        },
        features: [
          'dias_sem_consulta',
          'historico_faltas',
          'taxa_adesao',
          'progresso_metas',
          'idade',
          'patologias_criticas',
          'valor_historico'
        ],
        target: 'probabilidade_abandono'
      },
      treinamento: {
        status: 'treinado',
        dataUltimoTreino: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        acuracia: 87.5,
        loss: 0.23,
        epochsExecutadas: 150,
        tempoTreino: 45
      },
      performance: {
        precisao: 89.2,
        recall: 85.8,
        f1Score: 87.4,
        acuracia: 87.5,
        predicoesCertas: 142,
        predicoesTotais: 162
      },
      versoes: [
        { versao: '1.0.0', data: new Date('2024-08-01'), acuracia: 78.2, mudancas: ['Modelo inicial'] },
        { versao: '1.1.0', data: new Date('2024-08-15'), acuracia: 84.1, mudancas: ['Adição feature idade', 'Tuning de hiperparâmetros'] },
        { versao: '1.2.0', data: new Date('2024-08-20'), acuracia: 87.5, mudancas: ['Feature engineering melhorada', 'Mais dados de treino'] }
      ]
    }

    // Modelo para predição de conversão de campanhas
    const modeloConversao: ModeloML = {
      id: 'conversao_campanha',
      nome: 'Preditor de Conversão de Campanhas',
      tipo: 'regressao',
      objetivo: 'Prever taxa de conversão de campanhas por segmento',
      configuracao: {
        algoritmo: 'neural_network',
        parametros: {
          hidden_layers: [64, 32, 16],
          activation: 'relu',
          learning_rate: 0.001,
          epochs: 200
        },
        features: [
          'horario_envio',
          'dia_semana',
          'tipo_desconto',
          'valor_desconto',
          'segmento_idade',
          'historico_engajamento',
          'sazonalidade'
        ],
        target: 'taxa_conversao'
      },
      treinamento: {
        status: 'treinado',
        dataUltimoTreino: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        acuracia: 82.3,
        loss: 0.18,
        epochsExecutadas: 180,
        tempoTreino: 67
      },
      performance: {
        precisao: 83.7,
        recall: 80.9,
        f1Score: 82.3,
        acuracia: 82.3,
        predicoesCertas: 98,
        predicoesTotais: 119
      },
      versoes: [
        { versao: '1.0.0', data: new Date('2024-08-05'), acuracia: 74.1, mudancas: ['Modelo inicial neural network'] },
        { versao: '1.1.0', data: new Date('2024-08-18'), acuracia: 82.3, mudancas: ['Otimização da arquitetura', 'Regularização L2'] }
      ]
    }

    // Modelo para otimização de horários
    const modeloHorarios: ModeloML = {
      id: 'otimizacao_horarios',
      nome: 'Otimizador de Horários de Consultas',
      tipo: 'clustering',
      objetivo: 'Identificar horários ótimos por perfil de paciente',
      configuracao: {
        algoritmo: 'k_means',
        parametros: {
          n_clusters: 8,
          max_iter: 300,
          random_state: 42
        },
        features: [
          'horario_preferido',
          'idade',
          'ocupacao',
          'distancia',
          'historico_reagendamentos'
        ],
        target: 'cluster_horario'
      },
      treinamento: {
        status: 'treinado',
        dataUltimoTreino: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        acuracia: 91.2,
        loss: 0.12,
        epochsExecutadas: 89,
        tempoTreino: 23
      },
      performance: {
        precisao: 92.1,
        recall: 90.3,
        f1Score: 91.2,
        acuracia: 91.2,
        predicoesCertas: 156,
        predicoesTotais: 171
      },
      versoes: [
        { versao: '1.0.0', data: new Date('2024-08-10'), acuracia: 88.7, mudancas: ['K-means com 6 clusters'] },
        { versao: '1.1.0', data: new Date('2024-08-22'), acuracia: 91.2, mudancas: ['Aumento para 8 clusters', 'Feature distância'] }
      ]
    }

    this.modelos.set('abandono_predictor', modeloAbandono)
    this.modelos.set('conversao_campanha', modeloConversao)
    this.modelos.set('otimizacao_horarios', modeloHorarios)
  }

  // Fazer predição usando um modelo específico
  async fazerPredicao(
    modeloId: string, 
    dados: Record<string, any>, 
    contexto?: any
  ): Promise<PredicaoIA | null> {
    const modelo = this.modelos.get(modeloId)
    if (!modelo) return null

    // Simular processamento ML
    await new Promise(resolve => setTimeout(resolve, 200))

    const predicao = await this.processarPredicao(modelo, dados, contexto)
    
    // Cachear predição para análise posterior
    this.predicoesCache.set(predicao.id, predicao)
    
    return predicao
  }

  // Processar predição baseado no modelo
  private async processarPredicao(
    modelo: ModeloML, 
    dados: Record<string, any>,
    contexto?: any
  ): Promise<PredicaoIA> {
    const predicaoId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    switch (modelo.id) {
      case 'abandono_predictor':
        return this.preverAbandono(predicaoId, dados, modelo, contexto)
      
      case 'conversao_campanha':
        return this.preverConversaoCampanha(predicaoId, dados, modelo, contexto)
      
      case 'otimizacao_horarios':
        return this.otimizarHorarios(predicaoId, dados, modelo, contexto)
      
      default:
        throw new Error(`Modelo ${modelo.id} não implementado`)
    }
  }

  // Predição específica de abandono
  private async preverAbandono(
    id: string, 
    dados: any, 
    modelo: ModeloML, 
    contexto?: any
  ): Promise<PredicaoIA> {
    const { paciente } = dados as { paciente: PacienteRisco }
    
    // Simular algoritmo Random Forest para predição de abandono
    let score = 0
    let features: Record<string, number> = {}
    
    // Feature: Dias sem consulta (peso 35%)
    const diasSemConsulta = Math.floor(
      (new Date().getTime() - new Date(paciente.ultimaConsulta).getTime()) / (1000 * 60 * 60 * 24)
    )
    const scoreIdiasSemConsulta = Math.min(35, diasSemConsulta / 3)
    score += scoreIdiasSemConsulta
    features.dias_sem_consulta = diasSemConsulta
    
    // Feature: Histórico de faltas (peso 25%)
    const taxaFaltas = (paciente.historico.faltas / paciente.historico.totalConsultas) * 100
    const scoreFaltas = Math.min(25, taxaFaltas * 0.8)
    score += scoreFaltas
    features.historico_faltas = taxaFaltas
    
    // Feature: Taxa de adesão (peso 20%)
    const scoreAdesao = Math.max(0, 20 - (paciente.historico.taxaAdesao * 0.2))
    score += scoreAdesao
    features.taxa_adesao = paciente.historico.taxaAdesao
    
    // Feature: Progresso das metas (peso 15%)
    const progressoMetas = paciente.metas.peso?.progresso || 50
    const scoreProgresso = Math.max(0, 15 - (progressoMetas * 0.15))
    score += scoreProgresso
    features.progresso_metas = progressoMetas
    
    // Feature: Patologias críticas (peso 5%)
    const patologiasCriticas = ['diabetes', 'hipertensao', 'obesidade']
    const temPatologiaCritica = paciente.patologias.some(p => patologiasCriticas.includes(p))
    const scorePatologia = temPatologiaCritica ? -5 : 0 // Patologia crítica diminui chance de abandono
    score += scorePatologia
    features.patologias_criticas = temPatologiaCritica ? 1 : 0
    
    const probabilidadeAbandono = Math.min(100, Math.max(0, score)) / 100
    const confianca = modelo.performance.acuracia / 100
    
    return {
      id,
      modelo: modelo.id,
      timestamp: new Date(),
      input: { pacienteId: paciente.id, contexto, features },
      predicao: {
        valor: probabilidadeAbandono,
        probabilidade: probabilidadeAbandono,
        confianca,
        categoria: probabilidadeAbandono > 0.7 ? 'alto_risco' : 
                   probabilidadeAbandono > 0.4 ? 'medio_risco' : 'baixo_risco',
        explicacao: [
          `${diasSemConsulta} dias sem consulta (impacto: ${scoreIdiasSemConsulta.toFixed(1)})`,
          `${taxaFaltas.toFixed(1)}% taxa de faltas (impacto: ${scoreFaltas.toFixed(1)})`,
          `${paciente.historico.taxaAdesao}% taxa de adesão (impacto: ${scoreAdesao.toFixed(1)})`,
          `${progressoMetas}% progresso das metas (impacto: ${scoreProgresso.toFixed(1)})`
        ]
      }
    }
  }

  // Predição de conversão de campanha
  private async preverConversaoCampanha(
    id: string,
    dados: any,
    modelo: ModeloML,
    contexto?: any
  ): Promise<PredicaoIA> {
    const { campanha, segmento } = dados
    
    // Simular rede neural para predição de conversão
    let taxaConversaoBase = 0.15 // 15% base
    let features: Record<string, number> = {}
    
    // Feature: Horário de envio
    const horario = new Date().getHours()
    let multiplicadorHorario = 1.0
    if (horario >= 9 && horario <= 11) multiplicadorHorario = 1.3 // Manhã
    else if (horario >= 14 && horario <= 16) multiplicadorHorario = 1.2 // Tarde
    else if (horario >= 18 && horario <= 20) multiplicadorHorario = 1.4 // Noite
    features.horario_envio = horario
    
    // Feature: Dia da semana
    const diaSemana = new Date().getDay()
    let multiplicadorDia = 1.0
    if (diaSemana >= 1 && diaSemana <= 4) multiplicadorDia = 1.2 // Seg-Qui
    else if (diaSemana === 5) multiplicadorDia = 0.9 // Sexta
    features.dia_semana = diaSemana
    
    // Feature: Tipo e valor do desconto
    const desconto = campanha.desconto || 0
    let multiplicadorDesconto = 1.0
    if (desconto >= 20) multiplicadorDesconto = 1.5
    else if (desconto >= 10) multiplicadorDesconto = 1.3
    else if (desconto > 0) multiplicadorDesconto = 1.1
    features.valor_desconto = desconto
    
    // Feature: Segmento
    const segmentoBonus = segmento === 'vip' ? 1.4 : 
                         segmento === 'regular' ? 1.0 : 
                         segmento === 'inativo' ? 0.7 : 1.0
    features.segmento_tipo = segmentoBonus
    
    const taxaConversaoFinal = taxaConversaoBase * multiplicadorHorario * multiplicadorDia * multiplicadorDesconto * segmentoBonus
    const confianca = modelo.performance.acuracia / 100
    
    return {
      id,
      modelo: modelo.id,
      timestamp: new Date(),
      input: { campanha, segmento, contexto, features },
      predicao: {
        valor: Math.min(0.8, taxaConversaoFinal), // Cap em 80%
        probabilidade: Math.min(0.8, taxaConversaoFinal),
        confianca,
        categoria: taxaConversaoFinal > 0.3 ? 'alta_conversao' :
                   taxaConversaoFinal > 0.15 ? 'media_conversao' : 'baixa_conversao',
        explicacao: [
          `Horário ${horario}h (multiplicador: ${multiplicadorHorario.toFixed(2)})`,
          `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][diaSemana]} (multiplicador: ${multiplicadorDia.toFixed(2)})`,
          `Desconto ${desconto}% (multiplicador: ${multiplicadorDesconto.toFixed(2)})`,
          `Segmento ${segmento} (multiplicador: ${segmentoBonus.toFixed(2)})`
        ]
      }
    }
  }

  // Otimização de horários
  private async otimizarHorarios(
    id: string,
    dados: any,
    modelo: ModeloML,
    contexto?: any
  ): Promise<PredicaoIA> {
    const { agenda, pacientes } = dados
    
    // Simular K-means clustering para otimização
    const horariosOtimos = [
      { horario: '09:00', score: 0.92, cluster: 'manha_prime' },
      { horario: '10:00', score: 0.88, cluster: 'manha_prime' },
      { horario: '14:00', score: 0.85, cluster: 'tarde_produtiva' },
      { horario: '15:00', score: 0.82, cluster: 'tarde_produtiva' },
      { horario: '16:00', score: 0.78, cluster: 'tarde' }
    ]
    
    const melhorHorario = horariosOtimos[0]
    const confianca = modelo.performance.acuracia / 100
    
    return {
      id,
      modelo: modelo.id,
      timestamp: new Date(),
      input: { agenda, pacientes: pacientes?.length || 0, contexto },
      predicao: {
        valor: melhorHorario.score,
        probabilidade: melhorHorario.score,
        confianca,
        categoria: melhorHorario.cluster,
        explicacao: [
          `${horariosOtimos.length} horários analisados`,
          `Melhor horário: ${melhorHorario.horario} (score: ${melhorHorario.score})`,
          `Cluster identificado: ${melhorHorario.cluster}`,
          `Baseado em ${pacientes?.length || 'N/A'} pacientes`
        ]
      }
    }
  }

  // Retreinar modelo baseado em novos dados
  async retreinarModelo(modeloId: string, novosDados?: any[]): Promise<boolean> {
    const modelo = this.modelos.get(modeloId)
    if (!modelo) return false
    
    // Simular processo de retreinamento
    modelo.treinamento.status = 'treinando'
    
    // Simular tempo de treinamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular melhoria na acurácia (nem sempre melhora)
    const melhoria = (Math.random() - 0.3) * 5 // Entre -1.5% e +3.5%
    const novaAcuracia = Math.max(60, Math.min(95, modelo.treinamento.acuracia! + melhoria))
    
    // Atualizar modelo
    modelo.treinamento.status = 'treinado'
    modelo.treinamento.dataUltimoTreino = new Date()
    modelo.treinamento.acuracia = novaAcuracia
    modelo.performance.acuracia = novaAcuracia
    
    // Adicionar nova versão
    const novaVersao = `1.${modelo.versoes.length}.0`
    modelo.versoes.push({
      versao: novaVersao,
      data: new Date(),
      acuracia: novaAcuracia,
      mudancas: ['Retreinamento automático', `Acurácia: ${novaAcuracia.toFixed(1)}%`]
    })
    
    console.log(`Modelo ${modeloId} retreinado. Nova acurácia: ${novaAcuracia.toFixed(1)}%`)
    return true
  }

  // Gerar insights avançados baseado em análise de dados
  async gerarInsightsAvancados(): Promise<InsightAvancado[]> {
    const insights: InsightAvancado[] = []
    
    // Insight 1: Análise preditiva de abandono
    const insightAbandono = await this.analisarRiscoAbandono()
    if (insightAbandono) insights.push(insightAbandono)
    
    // Insight 2: Otimização de campanhas
    const insightCampanhas = await this.analisarOportunidadesCampanhas()
    if (insightCampanhas) insights.push(insightCampanhas)
    
    // Insight 3: Padrões temporais de agendamento
    const insightHorarios = await this.analisarPadroesHorarios()
    if (insightHorarios) insights.push(insightHorarios)
    
    // Insight 4: Anomalias no comportamento
    const insightAnomalias = await this.detectarAnomalias()
    if (insightAnomalias) insights.push(insightAnomalias)
    
    return insights
  }

  // Análise preditiva de risco de abandono
  private async analisarRiscoAbandono(): Promise<InsightAvancado | null> {
    const pacientesAltoRisco = 4 // Mock data
    const receitaEmRisco = 2400 // Mock data
    
    return {
      id: `insight_abandono_${Date.now()}`,
      tipo: 'predicao',
      categoria: 'pacientes',
      insight: {
        titulo: `${pacientesAltoRisco} pacientes com 85%+ chance de abandono`,
        descricao: `Modelo ML identifica pacientes com alta probabilidade de abandono nas próximas 4 semanas`,
        confianca: 0.875,
        impactoEstimado: receitaEmRisco,
        urgencia: 'alta',
        validadeAte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
      },
      evidencias: [
        {
          tipo: 'predicao',
          descricao: 'Modelo Random Forest com 87.5% acurácia',
          dados: { acuracia: 87.5, predicoes: pacientesAltoRisco },
          peso: 0.4
        },
        {
          tipo: 'dados',
          descricao: 'Padrão de 30+ dias sem consulta',
          dados: { dias_media: 45, pacientes_afetados: pacientesAltoRisco },
          peso: 0.35
        },
        {
          tipo: 'comparativo',
          descricao: 'Taxa abandono 15% acima da média histórica',
          dados: { atual: 23, historica: 20 },
          peso: 0.25
        }
      ],
      recomendacoes: [
        {
          acao: 'Campanha de reativação urgente',
          configuracao: { tipo: 'whatsapp', desconto: 25, urgencia: 'alta' },
          impactoEstimado: 1680, // 70% de 2400
          esforcoEstimado: 2,
          prioridade: 9,
          automavel: true
        },
        {
          acao: 'Ligação personalizada para pacientes VIP',
          configuracao: { canal: 'telefone', script: 'reativacao_vip' },
          impactoEstimado: 960, // 40% de 2400
          esforcoEstimado: 6,
          prioridade: 7,
          automavel: false
        }
      ]
    }
  }

  // Análise de oportunidades de campanhas
  private async analisarOportunidadesCampanhas(): Promise<InsightAvancado | null> {
    return {
      id: `insight_campanhas_${Date.now()}`,
      tipo: 'oportunidade',
      categoria: 'financeiro',
      insight: {
        titulo: 'Janela ótima para campanha de final de mês',
        descricao: 'Modelo prevê 42% conversão para campanha em horários específicos',
        confianca: 0.823,
        impactoEstimado: 1850,
        urgencia: 'media',
        validadeAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      },
      evidencias: [
        {
          tipo: 'predicao',
          descricao: 'Neural Network prevê alta conversão',
          dados: { conversao_esperada: 42, confianca: 82.3 },
          peso: 0.5
        },
        {
          tipo: 'padrao',
          descricao: 'Padrão sazonal de final de mês',
          dados: { historico: '35% mais conversões', periodo: 'últimos 6 meses' },
          peso: 0.3
        },
        {
          tipo: 'dados',
          descricao: '28 pacientes no segmento ideal',
          dados: { segmento: 'inativos_alto_valor', tamanho: 28 },
          peso: 0.2
        }
      ],
      recomendacoes: [
        {
          acao: 'Campanha "Volta ao Cuidado"',
          configuracao: { 
            desconto: 20, 
            horario: '18:00-20:00',
            segmento: 'inativos_alto_valor',
            canais: ['whatsapp', 'email']
          },
          impactoEstimado: 1850,
          esforcoEstimado: 3,
          prioridade: 8,
          automavel: true
        }
      ]
    }
  }

  // Análise de padrões de horários
  private async analisarPadroesHorarios(): Promise<InsightAvancado | null> {
    return {
      id: `insight_horarios_${Date.now()}`,
      tipo: 'otimizacao',
      categoria: 'operacional',
      insight: {
        titulo: 'Reagrupamento de horários pode gerar 3.2h extras/semana',
        descricao: 'Clustering ML identifica oportunidades de otimização na agenda',
        confianca: 0.912,
        impactoEstimado: 640, // 3.2h * R$200/h
        urgencia: 'media',
        validadeAte: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 dias
      },
      evidencias: [
        {
          tipo: 'predicao',
          descricao: 'K-means clustering com 91.2% precisão',
          dados: { clusters_identificados: 8, precisao: 91.2 },
          peso: 0.4
        },
        {
          tipo: 'dados',
          descricao: '6 horários com <40% ocupação',
          dados: { horarios_vazios: 6, ocupacao_media: 32 },
          peso: 0.35
        },
        {
          tipo: 'padrao',
          descricao: 'Preferência por manhãs em 72% dos casos',
          dados: { preferencia_manha: 72, amostra: 150 },
          peso: 0.25
        }
      ],
      recomendacoes: [
        {
          acao: 'Reagrupar consultas por perfil',
          configuracao: { 
            cluster_manha: ['09:00', '10:00', '11:00'],
            cluster_tarde: ['14:00', '15:00'],
            criterio: 'perfil_paciente'
          },
          impactoEstimado: 480, // 75% de 640
          esforcoEstimado: 4,
          prioridade: 7,
          automavel: true
        },
        {
          acao: 'Bloco de avaliações nas manhãs de quinta',
          configuracao: { dia: 'quinta', horario: '08:00-12:00', tipo: 'avaliacao' },
          impactoEstimado: 320, // 50% de 640
          esforcoEstimado: 2,
          prioridade: 6,
          automavel: false
        }
      ]
    }
  }

  // Detectar anomalias no comportamento
  private async detectarAnomalias(): Promise<InsightAvancado | null> {
    return {
      id: `insight_anomalia_${Date.now()}`,
      tipo: 'anomalia',
      categoria: 'operacional',
      insight: {
        titulo: 'Spike anômalo de cancelamentos às sextas-feiras',
        descricao: 'Detecção de anomalia: 340% mais cancelamentos que o normal',
        confianca: 0.89,
        impactoEstimado: -480, // Impacto negativo
        urgencia: 'alta',
        validadeAte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias
      },
      evidencias: [
        {
          tipo: 'anomalia',
          descricao: 'Padrão anômalo detectado via análise estatística',
          dados: { desvio_padrao: 3.4, significancia: 99.1 },
          peso: 0.5
        },
        {
          tipo: 'dados',
          descricao: '12 cancelamentos vs média de 2.8',
          dados: { atual: 12, media_historica: 2.8, periodo: 'últimas 4 sextas' },
          peso: 0.3
        },
        {
          tipo: 'comparativo',
          descricao: 'Outros dias da semana normais',
          dados: { seg_qui_normal: true, anomalia_especifica: 'sexta' },
          peso: 0.2
        }
      ],
      recomendacoes: [
        {
          acao: 'Investigar causa raiz dos cancelamentos',
          configuracao: { 
            foco: 'sextas_feiras',
            metodos: ['survey_pacientes', 'analise_horarios', 'feedback_staff']
          },
          impactoEstimado: 360, // Recuperação de 75%
          esforcoEstimado: 5,
          prioridade: 9,
          automavel: false
        },
        {
          acao: 'Implementar confirmação prévia às sextas',
          configuracao: { 
            dia: 'quinta',
            horario: '17:00',
            canal: 'whatsapp',
            mensagem: 'confirmacao_sexta'
          },
          impactoEstimado: 240, // Redução de 50% cancelamentos
          esforcoEstimado: 2,
          prioridade: 8,
          automavel: true
        }
      ]
    }
  }

  // Obter estatísticas de performance dos modelos
  getPerformanceModelos() {
    const stats = Array.from(this.modelos.values()).map(modelo => ({
      id: modelo.id,
      nome: modelo.nome,
      acuracia: modelo.performance.acuracia,
      ultimoTreino: modelo.treinamento.dataUltimoTreino,
      versaoAtual: modelo.versoes[modelo.versoes.length - 1]?.versao || '1.0.0',
      predicoesRealizadas: Array.from(this.predicoesCache.values())
        .filter(p => p.modelo === modelo.id).length,
      status: modelo.treinamento.status
    }))
    
    const acuraciaMedia = stats.reduce((sum, s) => sum + s.acuracia, 0) / stats.length
    const totalPredicoes = Array.from(this.predicoesCache.values()).length
    
    return {
      modelos: stats,
      resumo: {
        totalModelos: this.modelos.size,
        acuraciaMedia: acuraciaMedia.toFixed(1),
        totalPredicoes,
        modeloMelhorPerformance: stats.sort((a, b) => b.acuracia - a.acuracia)[0]
      }
    }
  }

  // Obter modelo específico
  getModelo(modeloId: string): ModeloML | null {
    return this.modelos.get(modeloId) || null
  }

  // Listar todas as predições realizadas
  getHistoricoPredicoes(limite: number = 50): PredicaoIA[] {
    return Array.from(this.predicoesCache.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limite)
  }

  // Carregar dados mockados para demonstração
  private carregarDadosMock(): void {
    // Em produção, carregaria dados reais do banco
    this.dadosTreinamento = [
      { paciente_id: 'p1', dias_sem_consulta: 45, taxa_faltas: 20, abandono: 1 },
      { paciente_id: 'p2', dias_sem_consulta: 12, taxa_faltas: 5, abandono: 0 },
      // ... mais dados de treinamento
    ]
  }

  // Métodos para Dashboard Analytics
  async obterEstadoSistema(): Promise<EstadoSistemaML> {
    const agora = new Date()
    
    return {
      status: 'ativo',
      estatisticas: {
        totalFeedbacks: 45,
        totalPredicoes: 234,
        acuraciaGeral: 0.873,
        padrzoesDetectados: 12,
        workflowsAtivos: 3,
        ultimoTreino: new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
      },
      performance: {
        'predicao_abandono': {
          predicoes: 150,
          acertos: 131,
          taxa_acerto: 0.873,
          tempo_resposta_medio: 45
        },
        'otimizacao_agenda': {
          predicoes: 50,
          acertos: 46,
          taxa_acerto: 0.92,
          tempo_resposta_medio: 120
        },
        'conversao_campanha': {
          predicoes: 34,
          acertos: 28,
          taxa_acerto: 0.824,
          tempo_resposta_medio: 89
        }
      },
      alertas: [
        {
          tipo: 'performance',
          mensagem: 'Modelo de abandono apresentou queda de 2% na acurácia',
          severidade: 'warning',
          timestamp: new Date(agora.getTime() - 3 * 60 * 60 * 1000), // 3 horas atrás
          resolvido: false
        },
        {
          tipo: 'dados',
          mensagem: 'Dados de treinamento atualizados com sucesso',
          severidade: 'info',
          timestamp: new Date(agora.getTime() - 1 * 60 * 60 * 1000), // 1 hora atrás
          resolvido: true
        }
      ],
      configuracao: {
        geral: {
          coletarFeedback: true,
          retreinarAutomaticamente: true,
          intervalوReTreino: 7,
          minDadosParaTreino: 100,
          backupModelos: true
        },
        modelos: {},
        feedback: {
          solicitarAvaliacaoUsuario: true,
          coletarMetricasAutomaticamente: true,
          analisarPadroesComportamento: true,
          gerarInsightsAutomaticos: true
        },
        privacy: {
          anonimizarDados: true,
          retencaoDados: 365,
          compartilharDadosAgregados: false,
          logTodasPredicoes: true
        }
      }
    }
  }

  async listarModelos(): Promise<ModeloML[]> {
    return Array.from(this.modelos.values())
  }

  async obterPredicoesRecentes(limite: number = 50): Promise<PredicaoIA[]> {
    const predicoes: PredicaoIA[] = []
    const agora = new Date()
    
    for (let i = 0; i < Math.min(limite, 20); i++) {
      const timestamp = new Date(agora.getTime() - i * 15 * 60 * 1000) // A cada 15 minutos
      const probabilidade = Math.random()
      
      predicoes.push({
        id: `pred-${i}`,
        modelo: ['abandono_predictor', 'conversion_optimizer', 'schedule_optimizer'][i % 3],
        timestamp,
        input: {
          pacienteId: `paciente-${i}`,
          contexto: { timestamp },
          features: {
            diasSemConsulta: Math.floor(Math.random() * 90),
            taxaAdesao: Math.random() * 100,
            progressoMetas: Math.random() * 100
          }
        },
        predicao: {
          valor: probabilidade,
          probabilidade,
          confianca: 0.7 + Math.random() * 0.3,
          categoria: probabilidade > 0.8 ? 'Alto Risco' : probabilidade > 0.5 ? 'Médio Risco' : 'Baixo Risco',
          explicacao: ['Histórico de faltas elevado', 'Progresso lento nas metas']
        }
      })
    }
    
    return predicoes
  }

  async obterInsightsRecentes(limite: number = 20): Promise<InsightAvancado[]> {
    const insights: InsightAvancado[] = []
    const agora = new Date()
    
    const tiposInsight = ['predicao', 'anomalia', 'oportunidade', 'risco', 'otimizacao'] as const
    const categorias = ['pacientes', 'agenda', 'financeiro', 'operacional'] as const
    const urgencias = ['baixa', 'media', 'alta', 'critica'] as const
    
    for (let i = 0; i < Math.min(limite, 10); i++) {
      insights.push({
        id: `insight-${i}`,
        tipo: tiposInsight[i % tiposInsight.length],
        categoria: categorias[i % categorias.length],
        insight: {
          titulo: [
            'Pacientes em risco de abandono identificados',
            'Oportunidade de otimização de agenda detectada',
            'Anomalia no padrão de agendamentos',
            'Campanha com potencial de alta conversão',
            'Risco de sobrecarga em horários específicos'
          ][i % 5],
          descricao: 'IA identificou padrão que requer atenção baseado em dados históricos',
          confianca: 0.7 + Math.random() * 0.3,
          impactoEstimado: Math.floor(Math.random() * 100),
          urgencia: urgencias[i % urgencias.length],
          validadeAte: new Date(agora.getTime() + (7 + i) * 24 * 60 * 60 * 1000)
        },
        evidencias: [
          {
            tipo: 'dados',
            descricao: 'Análise de 90 dias de histórico',
            dados: { amostras: 150, confianca: 0.85 },
            peso: 0.4
          },
          {
            tipo: 'padrao',
            descricao: 'Padrão recorrente detectado',
            dados: { frequencia: 0.7, similaridade: 0.9 },
            peso: 0.6
          }
        ],
        recomendacoes: [
          {
            acao: 'Enviar lembretes personalizados',
            configuracao: { canal: 'whatsapp', timing: '48h_antes' },
            impactoEstimado: 15,
            esforcoEstimado: 2,
            prioridade: i % 3 + 1,
            automavel: true
          },
          {
            acao: 'Criar campanha direcionada',
            configuracao: { desconto: 15, segmento: 'inativos' },
            impactoEstimado: 25,
            esforcoEstimado: 5,
            prioridade: i % 3 + 1,
            automavel: false
          }
        ],
        implementacao: i % 3 === 0 ? {
          implementado: true,
          dataImplementacao: new Date(agora.getTime() - i * 24 * 60 * 60 * 1000),
          efetividade: 0.7 + Math.random() * 0.3,
          comentarios: 'Implementação bem-sucedida com resultados positivos'
        } : undefined
      })
    }
    
    return insights
  }

  async executarPredicao(modeloId: string, dados: any): Promise<PredicaoIA> {
    const modelo = this.modelos.get(modeloId)
    if (!modelo) {
      throw new Error(`Modelo ${modeloId} não encontrado`)
    }

    const probabilidade = Math.random()
    const confianca = 0.7 + Math.random() * 0.3

    return {
      id: `pred-${Date.now()}`,
      modelo: modeloId,
      timestamp: new Date(),
      input: {
        contexto: dados,
        features: dados
      },
      predicao: {
        valor: probabilidade,
        probabilidade,
        confianca,
        categoria: probabilidade > 0.8 ? 'Alto' : probabilidade > 0.5 ? 'Médio' : 'Baixo',
        explicacao: ['Baseado em padrões históricos', 'Análise de múltiplos fatores']
      }
    }
  }

  async detectarPadroes(config: {
    pacientes: any[]
    janelaTemporal: number
    tiposAnalise: string[]
  }): Promise<PadraoComportamento[]> {
    const padroes: PadraoComportamento[] = []
    
    // Simular detecção de padrões
    const tiposDetectados = config.tiposAnalise
    
    for (let i = 0; i < tiposDetectados.length; i++) {
      const tipo = tiposDetectados[i] as 'temporal' | 'demografico' | 'comportamental'
      
      padroes.push({
        id: `padrao-${tipo}-${i}`,
        tipo,
        padrao: {
          nome: `Padrão ${tipo} #${i + 1}`,
          descricao: `Comportamento recorrente detectado na categoria ${tipo}`,
          confianca: 0.7 + Math.random() * 0.3,
          frequencia: Math.floor(Math.random() * 50) + 10,
          ultimaOcorrencia: new Date()
        },
        dados: tipo === 'temporal' ? {
          horarios: ['09:00', '14:00', '18:00'],
          diasSemana: [1, 2, 3, 4, 5]
        } : tipo === 'demografico' ? {
          idades: { min: 25, max: 45 },
          categorias: ['profissional', 'estudante']
        } : {
          valores: { min: 50, max: 200 }
        },
        acoesSugeridas: [
          {
            tipo: 'lembrete',
            configuracao: { canal: 'whatsapp', antecedencia: '24h' },
            impactoEstimado: 15,
            prioridade: 3
          }
        ],
        performance: {
          vezesAplicado: Math.floor(Math.random() * 20),
          sucessoMedio: 0.7 + Math.random() * 0.3,
          roiMedio: 1.5 + Math.random() * 2,
          ultimaAplicacao: new Date()
        }
      })
    }
    
    return padroes
  }

  async gerarInsightsAvancados(config: {
    predicoes: PredicaoIA[]
    padroes: PadraoComportamento[]
    configuracoes: any
  }): Promise<InsightAvancado[]> {
    return this.obterInsightsRecentes(5) // Reutilizar método existente
  }

  async otimizarParametros(config: {
    configuracaoAtual: any
    historicoPerfomance: any
    objetivos: string[]
  }): Promise<{
    novaConfiguracao: any
    melhoriaEstimada: number
  }> {
    // Simular otimização de parâmetros
    const melhoriaEstimada = Math.random() * 0.2 // Até 20% de melhoria
    
    return {
      novaConfiguracao: {
        lembretes: {
          ...config.configuracaoAtual.lembretes,
          criteriosAutomaticos: {
            ...config.configuracaoAtual.lembretes?.criteriosAutomaticos,
            scoreMinimo: Math.max(30, (config.configuracaoAtual.lembretes?.criteriosAutomaticos?.scoreMinimo || 50) - 5)
          }
        }
      },
      melhoriaEstimada
    }
  }
}

// Instância global do motor ML
export const mlEngine = new MLEngine()