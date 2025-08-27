// TESTE: API para histórico de gasto energético (reversível)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar histórico de gasto energético de um paciente
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
        history: createMockEnergyHistory(parseInt(patientId)),
        stats: {
          totalCalculations: 3,
          averageTMB: 1650,
          averageGET: 2145,
          mostUsedActivity: 'moderado'
        }
      })
    }

    // Buscar histórico de gasto energético ordenado por data
    const energyHistory = await prisma.energyExpenditure.findMany({
      where: {
        patientId: patientId,
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calcular estatísticas do histórico
    const stats = {
      totalCalculations: energyHistory.length,
      averageTMB: energyHistory.length > 0 
        ? energyHistory.reduce((acc, curr) => acc + curr.tmb, 0) / energyHistory.length
        : 0,
      averageGET: energyHistory.length > 0 
        ? energyHistory.reduce((acc, curr) => acc + curr.get, 0) / energyHistory.length
        : 0,
      mostUsedActivity: getMostUsedActivity(energyHistory)
    }

    return NextResponse.json({
      history: energyHistory,
      stats: stats
    })
  } catch (error) {
    console.error('Error fetching energy expenditure history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar novo registro de gasto energético
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      patientId,
      weight,
      height,
      age,
      gender,
      bodyFat,
      muscleMass,
      equation,
      activityLevel,
      objective,
      isPregnant,
      pregnancyTrimester,
      pregnancyWeeks,
      isLactating,
      lactationType,
      hasThyroidIssues,
      hasDiabetes,
      hasMetabolicDisorder,
      medicationsAffectingMetabolism,
      tmb,
      get,
      targetCalories,
      carbPercentage,
      proteinPercentage,
      fatPercentage,
      carbGrams,
      proteinGrams,
      fatGrams,
      notes
    } = body

    // Validação básica
    if (!patientId || !weight || !height || !age || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Criar registro de gasto energético
    const energyExpenditure = await prisma.energyExpenditure.create({
      data: {
        patientId,
        weight,
        height,
        age,
        gender,
        bodyFat,
        muscleMass,
        equation: equation || 'MIFFLIN_ST_JEOR',
        activityLevel: activityLevel || 'SEDENTARY',
        objective: objective || 'MAINTENANCE',
        isPregnant: isPregnant || false,
        pregnancyTrimester,
        pregnancyWeeks,
        isLactating: isLactating || false,
        lactationType,
        hasThyroidIssues: hasThyroidIssues || false,
        hasDiabetes: hasDiabetes || false,
        hasMetabolicDisorder: hasMetabolicDisorder || false,
        medicationsAffectingMetabolism,
        tmb,
        get,
        targetCalories,
        carbPercentage: carbPercentage || 50,
        proteinPercentage: proteinPercentage || 25,
        fatPercentage: fatPercentage || 25,
        carbGrams,
        proteinGrams,
        fatGrams,
        date: new Date(),
        notes
      }
    })

    return NextResponse.json(energyExpenditure)
  } catch (error) {
    console.error('Error creating energy expenditure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Função auxiliar para encontrar o nível de atividade mais usado
function getMostUsedActivity(history: any[]) {
  if (history.length === 0) return 'sedentario'
  
  const activityCounts = history.reduce((acc, curr) => {
    acc[curr.activityLevel] = (acc[curr.activityLevel] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(activityCounts).reduce((a, b) => 
    activityCounts[a] > activityCounts[b] ? a : b
  )
}

// TESTE: Função para criar histórico mockado de gasto energético (reversível)
function createMockEnergyHistory(patientId: number) {
  const baseDate = new Date()
  const patientNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira']
  const patientName = patientNames[patientId - 1] || 'Paciente Teste'
  
  // Dados base por paciente
  const patientsData = {
    1: { // João Silva
      weight: [82.0, 80.2, 79.5],
      height: 1.75,
      age: 34,
      gender: 'MALE',
      activities: ['sedentario', 'leve', 'moderado'],
      objectives: ['WEIGHT_LOSS', 'WEIGHT_LOSS', 'MAINTENANCE']
    },
    2: { // Maria Santos
      weight: [68.5, 67.2, 66.8],
      height: 1.63,
      age: 28,
      gender: 'FEMALE',
      activities: ['leve', 'moderado', 'moderado'],
      objectives: ['WEIGHT_LOSS', 'WEIGHT_LOSS', 'MUSCLE_GAIN']
    },
    3: { // Carlos Oliveira
      weight: [95.2, 94.1, 93.5],
      height: 1.82,
      age: 42,
      gender: 'MALE',
      activities: ['sedentario', 'sedentario', 'leve'],
      objectives: ['WEIGHT_LOSS', 'WEIGHT_LOSS', 'WEIGHT_LOSS']
    }
  }
  
  const data = patientsData[patientId as keyof typeof patientsData] || patientsData[1]
  
  return [
    {
      id: `mock-energy-${patientId}-1`,
      patientId: patientId.toString(),
      weight: data.weight[0],
      height: data.height,
      age: data.age,
      gender: data.gender,
      bodyFat: 18.5,
      muscleMass: 35.2,
      equation: 'MIFFLIN_ST_JEOR',
      activityLevel: data.activities[0],
      objective: data.objectives[0],
      isPregnant: false,
      isLactating: false,
      hasThyroidIssues: false,
      hasDiabetes: false,
      hasMetabolicDisorder: false,
      tmb: data.gender === 'MALE' 
        ? Math.round(88.362 + (13.397 * data.weight[0]) + (4.799 * (data.height * 100)) - (5.677 * data.age))
        : Math.round(447.593 + (9.247 * data.weight[0]) + (3.098 * (data.height * 100)) - (4.330 * data.age)),
      get: 0, // Será calculado
      targetCalories: 0, // Será calculado
      carbPercentage: 50,
      proteinPercentage: 20,
      fatPercentage: 30,
      carbGrams: 0, // Será calculado
      proteinGrams: 0, // Será calculado
      fatGrams: 0, // Será calculado
      date: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      notes: `Primeira avaliação de gasto energético para ${patientName}. Paciente com estilo de vida ${data.activities[0]}.`,
      createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: `mock-energy-${patientId}-2`,
      patientId: patientId.toString(),
      weight: data.weight[1],
      height: data.height,
      age: data.age,
      gender: data.gender,
      bodyFat: 17.7,
      muscleMass: 35.5,
      equation: 'MIFFLIN_ST_JEOR',
      activityLevel: data.activities[1],
      objective: data.objectives[1],
      isPregnant: false,
      isLactating: false,
      hasThyroidIssues: false,
      hasDiabetes: false,
      hasMetabolicDisorder: false,
      tmb: data.gender === 'MALE' 
        ? Math.round(88.362 + (13.397 * data.weight[1]) + (4.799 * (data.height * 100)) - (5.677 * data.age))
        : Math.round(447.593 + (9.247 * data.weight[1]) + (3.098 * (data.height * 100)) - (4.330 * data.age)),
      get: 0, // Será calculado
      targetCalories: 0, // Será calculado
      carbPercentage: 45,
      proteinPercentage: 25,
      fatPercentage: 30,
      carbGrams: 0, // Será calculado
      proteinGrams: 0, // Será calculado
      fatGrams: 0, // Será calculado
      date: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
      notes: `Reavaliação com perda de peso. Aumento do nível de atividade física para ${data.activities[1]}.`,
      createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: `mock-energy-${patientId}-3`,
      patientId: patientId.toString(),
      weight: data.weight[2],
      height: data.height,
      age: data.age,
      gender: data.gender,
      bodyFat: 17.4,
      muscleMass: 36.0,
      equation: 'MIFFLIN_ST_JEOR',
      activityLevel: data.activities[2],
      objective: data.objectives[2],
      isPregnant: false,
      isLactating: false,
      hasThyroidIssues: false,
      hasDiabetes: false,
      hasMetabolicDisorder: false,
      tmb: data.gender === 'MALE' 
        ? Math.round(88.362 + (13.397 * data.weight[2]) + (4.799 * (data.height * 100)) - (5.677 * data.age))
        : Math.round(447.593 + (9.247 * data.weight[2]) + (3.098 * (data.height * 100)) - (4.330 * data.age)),
      get: 0, // Será calculado
      targetCalories: 0, // Será calculado
      carbPercentage: 40,
      proteinPercentage: 30,
      fatPercentage: 30,
      carbGrams: 0, // Será calculado
      proteinGrams: 0, // Será calculado
      fatGrams: 0, // Será calculado
      date: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      notes: `Terceira avaliação com boa evolução. ${data.objectives[2] === 'MAINTENANCE' ? 'Transição para manutenção do peso.' : 'Continuidade do processo de emagrecimento.'}`,
      createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    }
  ].map(record => {
    // Calcular valores derivados
    const activityMultipliers = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'extremo': 1.9
    }
    
    const objectiveAdjustments = {
      'WEIGHT_LOSS': -500,
      'MAINTENANCE': 0,
      'WEIGHT_GAIN': 300,
      'MUSCLE_GAIN': 200
    }
    
    const get = Math.round(record.tmb * activityMultipliers[record.activityLevel as keyof typeof activityMultipliers])
    const targetCalories = get + objectiveAdjustments[record.objective as keyof typeof objectiveAdjustments]
    
    return {
      ...record,
      get,
      targetCalories,
      carbGrams: Math.round(targetCalories * record.carbPercentage / 100 / 4),
      proteinGrams: Math.round(targetCalories * record.proteinPercentage / 100 / 4),
      fatGrams: Math.round(targetCalories * record.fatPercentage / 100 / 9)
    }
  })
}