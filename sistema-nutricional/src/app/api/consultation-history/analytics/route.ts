// TESTE: API para análise e comparativos do histórico (reversível)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // TESTE: Autenticação desabilitada temporariamente (reversível)
    // const session = await getServerSession(authOptions)
    
    // if (!session || session.user.role !== 'NUTRITIONIST') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const period = searchParams.get('period') || '6months' // 3months, 6months, 1year, all
    
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }

    // TESTE: Se for ID mockado (numérico), criar analytics fake (reversível)
    if (['1', '2', '3'].includes(patientId)) {
      return NextResponse.json(createMockAnalytics(parseInt(patientId), period))
    }

    // Calcular data de início baseada no período
    let startDate = new Date()
    switch (period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0) // Desde o início
        break
    }

    // Buscar consultas no período
    const consultations = await prisma.consultationHistory.findMany({
      where: {
        patientId: patientId,
        // nutritionistId: session?.user?.id || 'mock-nutritionist',
        createdAt: {
          gte: startDate
        }
      },
      include: {
        medicalRecord: {
          select: {
            date: true,
            weight: true,
            height: true,
            bodyFat: true,
            muscleMass: true,
            waist: true,
            hip: true,
            bloodPressure: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (consultations.length === 0) {
      return NextResponse.json({
        message: 'No consultations found in the specified period',
        analytics: null
      })
    }

    // Primeira e última consulta para comparações
    const firstConsultation = consultations[0]
    const lastConsultation = consultations[consultations.length - 1]

    // Calcular mudanças totais
    const totalChanges = {
      weight: lastConsultation.medicalRecord.weight && firstConsultation.medicalRecord.weight 
        ? lastConsultation.medicalRecord.weight - firstConsultation.medicalRecord.weight 
        : null,
      bodyFat: lastConsultation.medicalRecord.bodyFat && firstConsultation.medicalRecord.bodyFat 
        ? lastConsultation.medicalRecord.bodyFat - firstConsultation.medicalRecord.bodyFat 
        : null,
      muscleMass: lastConsultation.medicalRecord.muscleMass && firstConsultation.medicalRecord.muscleMass 
        ? lastConsultation.medicalRecord.muscleMass - firstConsultation.medicalRecord.muscleMass 
        : null,
      waist: lastConsultation.medicalRecord.waist && firstConsultation.medicalRecord.waist 
        ? lastConsultation.medicalRecord.waist - firstConsultation.medicalRecord.waist 
        : null,
      hip: lastConsultation.medicalRecord.hip && firstConsultation.medicalRecord.hip 
        ? lastConsultation.medicalRecord.hip - firstConsultation.medicalRecord.hip 
        : null
    }

    // Calcular tendências
    const trends = {
      weight: calculateTrend(consultations, 'weight'),
      bodyFat: calculateTrend(consultations, 'bodyFat'),
      muscleMass: calculateTrend(consultations, 'muscleMass'),
      waist: calculateTrend(consultations, 'waist'),
      adherence: calculateAdherenceTrend(consultations)
    }

    // Estatísticas de aderência
    const adherenceStats = {
      average: consultations.reduce((acc, curr) => acc + (curr.adherenceRating || 0), 0) / consultations.length,
      best: Math.max(...consultations.map(c => c.adherenceRating || 0)),
      worst: Math.min(...consultations.map(c => c.adherenceRating || 10)),
      improving: consultations.filter(c => c.trend === 'IMPROVING').length,
      stable: consultations.filter(c => c.trend === 'STABLE').length,
      declining: consultations.filter(c => c.trend === 'DECLINING').length
    }

    // Dados para gráficos
    const chartData = consultations.map(consultation => ({
      date: consultation.medicalRecord.date,
      weight: consultation.medicalRecord.weight,
      bodyFat: consultation.medicalRecord.bodyFat,
      muscleMass: consultation.medicalRecord.muscleMass,
      waist: consultation.medicalRecord.waist,
      adherence: consultation.adherenceRating,
      sessionNumber: consultation.sessionNumber
    }))

    // Objetivos alcançados vs pendentes
    const goalsAnalysis = analyzeGoals(consultations)

    // Identificar padrões
    const patterns = identifyPatterns(consultations)

    const analytics = {
      period: period,
      totalConsultations: consultations.length,
      dateRange: {
        start: firstConsultation.medicalRecord.date,
        end: lastConsultation.medicalRecord.date
      },
      totalChanges,
      trends,
      adherenceStats,
      chartData,
      goalsAnalysis,
      patterns,
      recommendations: generateRecommendations(totalChanges, trends, adherenceStats, patterns)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error generating consultation analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Função auxiliar para calcular tendência
function calculateTrend(consultations: any[], metric: string) {
  if (consultations.length < 2) return 'insufficient_data'
  
  const values = consultations
    .map(c => c.medicalRecord[metric])
    .filter(v => v !== null && v !== undefined)
    
  if (values.length < 2) return 'insufficient_data'
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (Math.abs(change) < 2) return 'stable'
  return change > 0 ? 'increasing' : 'decreasing'
}

// Função auxiliar para calcular tendência de aderência
function calculateAdherenceTrend(consultations: any[]) {
  const adherenceValues = consultations
    .map(c => c.adherenceRating)
    .filter(v => v !== null && v !== undefined)
    
  if (adherenceValues.length < 2) return 'insufficient_data'
  
  // Calcular se a aderência está melhorando, piorando ou estável
  const recent = adherenceValues.slice(-3) // últimas 3 consultas
  const older = adherenceValues.slice(0, -3) // consultas anteriores
  
  if (older.length === 0) return 'insufficient_data'
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  
  const improvement = recentAvg - olderAvg
  
  if (Math.abs(improvement) < 0.5) return 'stable'
  return improvement > 0 ? 'improving' : 'declining'
}

// Função auxiliar para analisar objetivos
function analyzeGoals(consultations: any[]) {
  const allGoals = {
    achieved: [],
    pending: []
  }
  
  consultations.forEach(consultation => {
    try {
      if (consultation.goalsAchieved) {
        const achieved = JSON.parse(consultation.goalsAchieved)
        allGoals.achieved.push(...achieved)
      }
      if (consultation.goalsRemaining) {
        const pending = JSON.parse(consultation.goalsRemaining)
        allGoals.pending.push(...pending)
      }
    } catch (e) {
      console.warn('Error parsing goals JSON:', e)
    }
  })
  
  return {
    totalAchieved: allGoals.achieved.length,
    totalPending: allGoals.pending.length,
    achievementRate: allGoals.achieved.length / (allGoals.achieved.length + allGoals.pending.length) * 100 || 0,
    recentGoals: consultations.slice(-3).map(c => ({
      date: c.medicalRecord.date,
      achieved: c.goalsAchieved ? JSON.parse(c.goalsAchieved) : [],
      pending: c.goalsRemaining ? JSON.parse(c.goalsRemaining) : []
    }))
  }
}

// Função auxiliar para identificar padrões
function identifyPatterns(consultations: any[]) {
  const patterns = []
  
  // Padrão de peso
  const weights = consultations.map(c => c.medicalRecord.weight).filter(w => w)
  if (weights.length >= 3) {
    const isConsistentLoss = weights.every((w, i) => i === 0 || w <= weights[i-1])
    const isConsistentGain = weights.every((w, i) => i === 0 || w >= weights[i-1])
    
    if (isConsistentLoss) patterns.push({ type: 'weight', pattern: 'consistent_loss', severity: 'positive' })
    if (isConsistentGain) patterns.push({ type: 'weight', pattern: 'consistent_gain', severity: 'attention' })
  }
  
  // Padrão de aderência
  const adherence = consultations.map(c => c.adherenceRating).filter(a => a !== null)
  if (adherence.length >= 3) {
    const lowAdherence = adherence.filter(a => a < 5).length
    if (lowAdherence > adherence.length / 2) {
      patterns.push({ type: 'adherence', pattern: 'consistently_low', severity: 'warning' })
    }
  }
  
  // Padrão de progresso
  const improvingTrends = consultations.filter(c => c.trend === 'IMPROVING').length
  const decliningTrends = consultations.filter(c => c.trend === 'DECLINING').length
  
  if (improvingTrends > consultations.length * 0.7) {
    patterns.push({ type: 'progress', pattern: 'excellent_progress', severity: 'positive' })
  } else if (decliningTrends > consultations.length * 0.5) {
    patterns.push({ type: 'progress', pattern: 'concerning_decline', severity: 'warning' })
  }
  
  return patterns
}

// Função auxiliar para gerar recomendações
function generateRecommendations(totalChanges: any, trends: any, adherenceStats: any, patterns: any[]) {
  const recommendations = []
  
  // Recomendações baseadas em mudanças
  if (totalChanges.weight && totalChanges.weight < -10) {
    recommendations.push({
      type: 'success',
      message: 'Excelente perda de peso! Continue com o plano atual.',
      priority: 'low'
    })
  } else if (totalChanges.weight && totalChanges.weight > 5) {
    recommendations.push({
      type: 'warning',
      message: 'Ganho de peso observado. Revisar plano alimentar e atividade física.',
      priority: 'high'
    })
  }
  
  // Recomendações baseadas em aderência
  if (adherenceStats.average < 5) {
    recommendations.push({
      type: 'warning',
      message: 'Baixa aderência ao tratamento. Considerar ajustes no plano ou maior acompanhamento.',
      priority: 'high'
    })
  }
  
  // Recomendações baseadas em padrões
  patterns.forEach(pattern => {
    if (pattern.severity === 'warning') {
      recommendations.push({
        type: 'warning',
        message: `Padrão identificado: ${pattern.pattern}. Atenção necessária.`,
        priority: 'medium'
      })
    }
  })
  
  // Recomendação geral se tudo está bem
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'Paciente apresenta evolução satisfatória. Manter acompanhamento regular.',
      priority: 'low'
    })
  }
  
  return recommendations
}

// TESTE: Função para criar analytics mockados (reversível)
function createMockAnalytics(patientId: number, period: string) {
  const patientNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira']
  const patientName = patientNames[patientId - 1] || 'Paciente Teste'
  
  return {
    period: period,
    totalConsultations: 3,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    totalChanges: {
      weight: -2.5,
      bodyFat: -1.1,
      muscleMass: 0.8,
      waist: -3.0,
      hip: -1.5
    },
    trends: {
      weight: 'decreasing',
      bodyFat: 'decreasing',
      muscleMass: 'increasing',
      waist: 'decreasing',
      adherence: 'improving'
    },
    adherenceStats: {
      average: 8.0,
      best: 8.5,
      worst: 7.5,
      improving: 3,
      stable: 0,
      declining: 0
    },
    chartData: [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        weight: 82.0,
        bodyFat: 18.5,
        muscleMass: 35.2,
        waist: 85.0,
        adherence: 8.0,
        sessionNumber: 1
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        weight: 80.2,
        bodyFat: 17.7,
        muscleMass: 35.5,
        waist: 83.0,
        adherence: 7.5,
        sessionNumber: 2
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        weight: 79.5,
        bodyFat: 17.4,
        muscleMass: 36.0,
        waist: 82.0,
        adherence: 8.5,
        sessionNumber: 3
      }
    ],
    goalsAnalysis: {
      totalAchieved: 5,
      totalPending: 2,
      achievementRate: 71.4,
      recentGoals: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          achieved: ['Perder 2kg', 'Reduzir gordura corporal', 'Melhorar condicionamento'],
          pending: ['Alcançar peso meta', 'Manter hábitos alimentares']
        }
      ]
    },
    patterns: [
      {
        type: 'weight',
        pattern: 'consistent_loss',
        severity: 'positive'
      },
      {
        type: 'progress',
        pattern: 'excellent_progress',
        severity: 'positive'
      }
    ],
    recommendations: [
      {
        type: 'success',
        message: `${patientName} apresenta excelente evolução! Continue com o plano atual.`,
        priority: 'low'
      },
      {
        type: 'info',
        message: 'Considerar transição para fase de manutenção em breve.',
        priority: 'medium'
      }
    ]
  }
}