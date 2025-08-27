// TESTE: API para histórico de consultas (reversível)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar histórico de consultas de um paciente
export async function GET(request: NextRequest) {
  try {
    // TESTE: Autenticação desabilitada temporariamente (reversível)
    // const session = await getServerSession(authOptions)
    
    // if (!session || session.user.role !== 'NUTRITIONIST') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }

    // TESTE: Se for ID mockado (numérico), criar dados fake (reversível)
    if (['1', '2', '3'].includes(patientId)) {
      return NextResponse.json({
        history: createMockHistory(parseInt(patientId)),
        stats: {
          totalConsultations: 3,
          averageAdherence: 7.5,
          improvingTrend: 2,
          stableTrend: 1,
          decliningTrend: 0
        }
      })
    }

    // Buscar histórico de consultas ordenado por data
    const consultationHistory = await prisma.consultationHistory.findMany({
      where: {
        patientId: patientId,
        // nutritionistId: session?.user?.id || 'mock-nutritionist'
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            date: true,
            weight: true,
            height: true,
            bloodPressure: true,
            heartRate: true,
            observations: true,
            recommendations: true,
            // Campos expandidos
            chiefComplaint: true,
            currentIllness: true,
            bodyFat: true,
            muscleMass: true,
            waist: true,
            hip: true,
            shortTermGoals: true,
            longTermGoals: true,
            progressNotes: true
          }
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estatísticas do histórico
    const stats = {
      totalConsultations: consultationHistory.length,
      averageAdherence: consultationHistory.length > 0 
        ? consultationHistory.reduce((acc, curr) => acc + (curr.adherenceRating || 0), 0) / consultationHistory.length
        : 0,
      improvingTrend: consultationHistory.filter(c => c.trend === 'IMPROVING').length,
      stableTrend: consultationHistory.filter(c => c.trend === 'STABLE').length,
      decliningTrend: consultationHistory.filter(c => c.trend === 'DECLINING').length
    }

    return NextResponse.json({
      history: consultationHistory,
      stats: stats
    })
  } catch (error) {
    console.error('Error fetching consultation history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar novo registro no histórico
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      medicalRecordId,
      patientId,
      sessionNumber,
      sessionType,
      duration,
      previousWeight,
      previousBodyFat,
      previousMuscle,
      previousWaist,
      weightChange,
      bodyFatChange,
      muscleChange,
      waistChange,
      goalsAchieved,
      goalsRemaining,
      progressRate,
      adherenceRating,
      sessionObjectives,
      interventions,
      dietAdjustments,
      exerciseChanges,
      nextSessionGoals,
      homeworkTasks,
      followUpItems,
      trend,
      riskFactors,
      positiveChanges,
      concerns
    } = body

    // Validação básica
    if (!medicalRecordId || !patientId || !sessionNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar se o medical record existe e pertence ao nutricionista
    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        id: medicalRecordId,
        nutritionistId: session.user.id
      }
    })

    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 })
    }

    // Criar histórico da consulta
    const consultationHistory = await prisma.consultationHistory.create({
      data: {
        medicalRecordId,
        patientId,
        nutritionistId: session.user.id,
        sessionNumber,
        sessionType: sessionType || 'FOLLOW_UP',
        duration,
        previousWeight,
        previousBodyFat,
        previousMuscle,
        previousWaist,
        weightChange,
        bodyFatChange,
        muscleChange,
        waistChange,
        goalsAchieved: goalsAchieved ? JSON.stringify(goalsAchieved) : null,
        goalsRemaining: goalsRemaining ? JSON.stringify(goalsRemaining) : null,
        progressRate,
        adherenceRating,
        sessionObjectives,
        interventions,
        dietAdjustments,
        exerciseChanges,
        nextSessionGoals,
        homeworkTasks: homeworkTasks ? JSON.stringify(homeworkTasks) : null,
        followUpItems,
        trend: trend || 'STABLE',
        riskFactors,
        positiveChanges,
        concerns
      },
      include: {
        medicalRecord: true,
        patient: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(consultationHistory)
  } catch (error) {
    console.error('Error creating consultation history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Atualizar registro do histórico
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Consultation history ID required' }, { status: 400 })
    }

    // Verificar se o registro pertence ao nutricionista
    const existingRecord = await prisma.consultationHistory.findFirst({
      where: {
        id: id,
        nutritionistId: session.user.id
      }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'Consultation history not found' }, { status: 404 })
    }

    // Processar campos JSON
    if (updateData.goalsAchieved && typeof updateData.goalsAchieved !== 'string') {
      updateData.goalsAchieved = JSON.stringify(updateData.goalsAchieved)
    }
    if (updateData.goalsRemaining && typeof updateData.goalsRemaining !== 'string') {
      updateData.goalsRemaining = JSON.stringify(updateData.goalsRemaining)
    }
    if (updateData.homeworkTasks && typeof updateData.homeworkTasks !== 'string') {
      updateData.homeworkTasks = JSON.stringify(updateData.homeworkTasks)
    }

    const updatedRecord = await prisma.consultationHistory.update({
      where: { id },
      data: updateData,
      include: {
        medicalRecord: true,
        patient: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error('Error updating consultation history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// TESTE: Função para criar dados mockados de histórico (reversível)
function createMockHistory(patientId: number) {
  const baseDate = new Date()
  const patientNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira']
  const patientName = patientNames[patientId - 1] || 'Paciente Teste'
  
  return [
    {
      id: `mock-${patientId}-1`,
      sessionNumber: 1,
      sessionType: 'INITIAL',
      duration: 60,
      adherenceRating: 8.0,
      trend: 'IMPROVING',
      progressRate: 85,
      weightChange: -2.5,
      bodyFatChange: -1.2,
      muscleChange: 0.8,
      waistChange: -3.0,
      medicalRecord: {
        id: `mock-record-${patientId}-1`,
        date: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        weight: 82.0,
        height: 1.75,
        imc: 26.8,
        bodyFat: 18.5,
        muscleMass: 35.2,
        bodyWater: 58.5,
        bmr: 1680,
        waist: 85.0,
        hip: 98.0,
        neck: 38.0,
        chest: 98.0,
        abdomen: 88.0,
        shoulder: 105.0,
        armRight: 32.0,
        armLeft: 31.8,
        forearmRight: 28.5,
        forearmLeft: 28.2,
        wristRight: 17.5,
        wristLeft: 17.3,
        thighProximalRight: 58.0,
        thighProximalLeft: 57.8,
        thighDistalRight: 45.0,
        thighDistalLeft: 44.8,
        calfRight: 35.5,
        calfLeft: 35.2,
        triceps: 12.5,
        biceps: 8.2,
        thoracic: 15.0,
        subscapular: 18.5,
        midaxillary: 16.2,
        supraspinal: 14.8,
        suprailiac: 20.5,
        abdominal: 22.0,
        thighSkinfold: 18.5,
        calfSkinfold: 10.2,
        bloodPressure: '120/80',
        heartRate: 72,
        observations: `Primeira consulta com ${patientName}. Paciente motivado e receptivo às orientações. Estabelecidos objetivos de perda de peso de 5kg em 3 meses.`,
        recommendations: 'Dieta hipocalórica com aumento da atividade física. Monitoramento semanal do peso.',
        chiefComplaint: 'Desejo de perder peso e melhorar condicionamento físico',
        currentIllness: 'Sedentarismo e ganho de peso nos últimos 2 anos',
        shortTermGoals: 'Perder 2kg no primeiro mês',
        longTermGoals: 'Alcançar peso ideal de 77kg e manter',
        progressNotes: 'Paciente demonstra boa compreensão das orientações nutricionais'
      },
      patient: {
        user: {
          name: patientName,
          email: `${patientName.toLowerCase().replace(' ', '.')}@email.com`
        }
      },
      createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: `mock-${patientId}-2`,
      sessionNumber: 2,
      sessionType: 'FOLLOW_UP',
      duration: 45,
      adherenceRating: 7.5,
      trend: 'IMPROVING',
      progressRate: 78,
      weightChange: -1.8,
      bodyFatChange: -0.8,
      muscleChange: 0.3,
      waistChange: -2.0,
      medicalRecord: {
        id: `mock-record-${patientId}-2`,
        date: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
        weight: 80.2,
        height: 1.75,
        imc: 26.2,
        bodyFat: 17.7,
        muscleMass: 35.5,
        bodyWater: 59.2,
        bmr: 1695,
        waist: 83.0,
        hip: 97.0,
        neck: 37.5,
        chest: 97.0,
        abdomen: 86.5,
        shoulder: 104.5,
        armRight: 32.2,
        armLeft: 32.0,
        forearmRight: 28.8,
        forearmLeft: 28.5,
        wristRight: 17.5,
        wristLeft: 17.3,
        thighProximalRight: 57.2,
        thighProximalLeft: 57.0,
        thighDistalRight: 44.5,
        thighDistalLeft: 44.3,
        calfRight: 35.8,
        calfLeft: 35.5,
        triceps: 11.8,
        biceps: 7.8,
        thoracic: 14.2,
        subscapular: 17.8,
        midaxillary: 15.5,
        supraspinal: 14.0,
        suprailiac: 19.8,
        abdominal: 21.2,
        thighSkinfold: 17.8,
        calfSkinfold: 9.8,
        bloodPressure: '118/78',
        heartRate: 70,
        observations: `${patientName} apresentou boa evolução. Perda de peso dentro do esperado. Relatou maior disposição e energia.`,
        recommendations: 'Manter o plano atual. Incluir exercícios de resistência 2x por semana.',
        progressNotes: 'Aderência satisfatória à dieta. Paciente relatou algumas dificuldades nos finais de semana.'
      },
      patient: {
        user: {
          name: patientName,
          email: `${patientName.toLowerCase().replace(' ', '.')}@email.com`
        }
      },
      createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: `mock-${patientId}-3`,
      sessionNumber: 3,
      sessionType: 'FOLLOW_UP',
      duration: 30,
      adherenceRating: 8.5,
      trend: 'STABLE',
      progressRate: 92,
      weightChange: -0.7,
      bodyFatChange: -0.3,
      muscleChange: 0.5,
      waistChange: -1.0,
      medicalRecord: {
        id: `mock-record-${patientId}-3`,
        date: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        weight: 79.5,
        height: 1.75,
        imc: 26.0,
        bodyFat: 17.4,
        muscleMass: 36.0,
        bodyWater: 59.8,
        bmr: 1705,
        waist: 82.0,
        hip: 96.5,
        neck: 37.2,
        chest: 96.5,
        abdomen: 85.0,
        shoulder: 104.0,
        armRight: 32.5,
        armLeft: 32.3,
        forearmRight: 29.0,
        forearmLeft: 28.8,
        wristRight: 17.5,
        wristLeft: 17.3,
        thighProximalRight: 56.8,
        thighProximalLeft: 56.5,
        thighDistalRight: 44.2,
        thighDistalLeft: 44.0,
        calfRight: 36.0,
        calfLeft: 35.8,
        triceps: 11.2,
        biceps: 7.5,
        thoracic: 13.8,
        subscapular: 17.2,
        midaxillary: 15.0,
        supraspinal: 13.5,
        suprailiac: 19.2,
        abdominal: 20.5,
        thighSkinfold: 17.2,
        calfSkinfold: 9.5,
        bloodPressure: '115/75',
        heartRate: 68,
        observations: `Excelente progresso do ${patientName}. Meta de perda de peso quase alcançada. Paciente demonstra mudança consistente de hábitos.`,
        recommendations: 'Transição para fase de manutenção. Ajustar plano para sustentabilidade a longo prazo.',
        progressNotes: 'Paciente muito satisfeito com os resultados. Demonstra autonomia nas escolhas alimentares.'
      },
      patient: {
        user: {
          name: patientName,
          email: `${patientName.toLowerCase().replace(' ', '.')}@email.com`
        }
      },
      createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    }
  ]
}