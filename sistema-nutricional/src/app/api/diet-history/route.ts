// TESTE: API para histórico de dietas (reversível)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar histórico de dietas de um paciente
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
        history: createMockDietHistory(parseInt(patientId)),
        stats: {
          totalDiets: 3,
          averageAdherence: 8.2,
          currentDiet: 'Dieta Hipocalórica',
          averageCalories: 1850
        }
      })
    }

    // Buscar histórico de dietas ordenado por data
    const dietHistory = await prisma.diet.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        meals: {
          include: {
            foods: true
          }
        },
        nutritionist: {
          select: {
            user: {
              select: {
                name: true
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
      totalDiets: dietHistory.length,
      averageAdherence: dietHistory.length > 0 
        ? dietHistory.reduce((acc, curr) => acc + (curr.adherenceScore || 0), 0) / dietHistory.length
        : 0,
      currentDiet: dietHistory.find(d => d.isActive)?.name || 'Nenhuma',
      averageCalories: dietHistory.length > 0 
        ? dietHistory.reduce((acc, curr) => acc + (curr.calories || 0), 0) / dietHistory.length
        : 0
    }

    return NextResponse.json({
      history: dietHistory,
      stats: stats
    })
  } catch (error) {
    console.error('Error fetching diet history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// TESTE: Função para criar histórico mockado de dietas (reversível)
function createMockDietHistory(patientId: number) {
  const baseDate = new Date()
  const patientNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira']
  const patientName = patientNames[patientId - 1] || 'Paciente Teste'
  
  // Dados base por paciente
  const patientsData = {
    1: { // João Silva
      diets: [
        {
          name: 'Dieta Hipocalórica Inicial',
          calories: 1800,
          protein: 120,
          carbs: 180,
          fat: 60,
          adherence: 85,
          objective: 'Perda de peso inicial'
        },
        {
          name: 'Dieta Moderada',
          calories: 1900,
          protein: 130,
          carbs: 190,
          fat: 63,
          adherence: 78,
          objective: 'Manutenção da perda'
        },
        {
          name: 'Dieta de Manutenção',
          calories: 2000,
          protein: 135,
          carbs: 200,
          fat: 67,
          adherence: 92,
          objective: 'Manutenção do peso'
        }
      ]
    },
    2: { // Maria Santos
      diets: [
        {
          name: 'Dieta Baixa em Carboidratos',
          calories: 1600,
          protein: 110,
          carbs: 120,
          fat: 80,
          adherence: 88,
          objective: 'Redução rápida'
        },
        {
          name: 'Dieta Balanceada',
          calories: 1700,
          protein: 115,
          carbs: 150,
          fat: 70,
          adherence: 82,
          objective: 'Perda sustentável'
        },
        {
          name: 'Dieta para Ganho Muscular',
          calories: 1850,
          protein: 140,
          carbs: 160,
          fat: 72,
          adherence: 89,
          objective: 'Ganho de massa muscular'
        }
      ]
    },
    3: { // Carlos Oliveira
      diets: [
        {
          name: 'Dieta Hipocalórica Restritiva',
          calories: 1700,
          protein: 125,
          carbs: 140,
          fat: 65,
          adherence: 75,
          objective: 'Perda de peso agressiva'
        },
        {
          name: 'Dieta Moderada',
          calories: 1850,
          protein: 130,
          carbs: 160,
          fat: 70,
          adherence: 80,
          objective: 'Perda moderada'
        },
        {
          name: 'Dieta Flexível',
          calories: 2000,
          protein: 135,
          carbs: 180,
          fat: 75,
          adherence: 85,
          objective: 'Transição para manutenção'
        }
      ]
    }
  }
  
  const data = patientsData[patientId as keyof typeof patientsData] || patientsData[1]
  
  return [
    {
      id: `mock-diet-${patientId}-1`,
      name: data.diets[0].name,
      description: `Primeira dieta prescrita para ${patientName}. Foco em ${data.diets[0].objective.toLowerCase()}.`,
      startDate: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      endDate: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
      targetCalories: data.diets[0].calories,
      targetProtein: data.diets[0].protein,
      targetCarbs: data.diets[0].carbs,
      targetFat: data.diets[0].fat,
      calories: data.diets[0].calories,
      protein: data.diets[0].protein,
      carbs: data.diets[0].carbs,
      fat: data.diets[0].fat,
      fiber: 25,
      isActive: false,
      adherenceScore: data.diets[0].adherence,
      notes: `Dieta inicial com objetivo de ${data.diets[0].objective}. Paciente apresentou boa aceitação inicial.`,
      createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
      meals: [
        {
          id: `mock-meal-${patientId}-1-1`,
          mealType: 'BREAKFAST',
          name: 'Café da Manhã',
          description: 'Café da manhã balanceado com carboidratos complexos e proteína',
          calories: Math.round(data.diets[0].calories * 0.25),
          protein: Math.round(data.diets[0].protein * 0.20),
          carbs: Math.round(data.diets[0].carbs * 0.30),
          fat: Math.round(data.diets[0].fat * 0.25),
          fiber: 8,
          time: '07:00',
          foods: [
            {
              id: `mock-food-${patientId}-1-1-1`,
              name: 'Pão integral',
              category: 'Cereais e derivados',
              quantity: 50,
              calories: 120,
              protein: 4.0,
              carbs: 22.0,
              fat: 2.0,
              fiber: 3.5
            },
            {
              id: `mock-food-${patientId}-1-1-2`,
              name: 'Ovos mexidos (2 unidades)',
              category: 'Ovos e derivados',
              quantity: 100,
              calories: 155,
              protein: 12.0,
              carbs: 1.0,
              fat: 11.0,
              fiber: 0
            },
            {
              id: `mock-food-${patientId}-1-1-3`,
              name: 'Banana',
              category: 'Frutas e derivados',
              quantity: 100,
              calories: 89,
              protein: 1.1,
              carbs: 23.0,
              fat: 0.3,
              fiber: 2.6
            }
          ]
        },
        {
          id: `mock-meal-${patientId}-1-2`,
          mealType: 'LUNCH',
          name: 'Almoço',
          description: 'Refeição completa com carboidrato, proteína e vegetais',
          calories: Math.round(data.diets[0].calories * 0.35),
          protein: Math.round(data.diets[0].protein * 0.40),
          carbs: Math.round(data.diets[0].carbs * 0.35),
          fat: Math.round(data.diets[0].fat * 0.35),
          fiber: 10,
          time: '12:00',
          foods: [
            {
              id: `mock-food-${patientId}-1-2-1`,
              name: 'Arroz integral',
              category: 'Cereais e derivados',
              quantity: 100,
              calories: 123,
              protein: 2.6,
              carbs: 23.0,
              fat: 1.0,
              fiber: 2.7
            },
            {
              id: `mock-food-${patientId}-1-2-2`,
              name: 'Peito de frango grelhado',
              category: 'Carnes e derivados',
              quantity: 120,
              calories: 195,
              protein: 36.0,
              carbs: 0,
              fat: 4.0,
              fiber: 0
            },
            {
              id: `mock-food-${patientId}-1-2-3`,
              name: 'Salada mista',
              category: 'Hortaliças e derivados',
              quantity: 150,
              calories: 45,
              protein: 2.0,
              carbs: 8.0,
              fat: 0.5,
              fiber: 4.0
            },
            {
              id: `mock-food-${patientId}-1-2-4`,
              name: 'Feijão carioca',
              category: 'Leguminosas e derivados',
              quantity: 80,
              calories: 76,
              protein: 4.8,
              carbs: 14.0,
              fat: 0.5,
              fiber: 8.5
            }
          ]
        },
        {
          id: `mock-meal-${patientId}-1-3`,
          mealType: 'DINNER',
          name: 'Jantar',
          description: 'Jantar leve com proteína magra e vegetais',
          calories: Math.round(data.diets[0].calories * 0.30),
          protein: Math.round(data.diets[0].protein * 0.30),
          carbs: Math.round(data.diets[0].carbs * 0.25),
          fat: Math.round(data.diets[0].fat * 0.30),
          fiber: 6,
          time: '19:00',
          foods: [
            {
              id: `mock-food-${patientId}-1-3-1`,
              name: 'Filé de tilápia assado',
              category: 'Peixes e frutos do mar',
              quantity: 150,
              calories: 128,
              protein: 26.0,
              carbs: 0,
              fat: 3.0,
              fiber: 0
            },
            {
              id: `mock-food-${patientId}-1-3-2`,
              name: 'Batata doce',
              category: 'Hortaliças e derivados',
              quantity: 100,
              calories: 77,
              protein: 1.3,
              carbs: 18.0,
              fat: 0.1,
              fiber: 2.2
            },
            {
              id: `mock-food-${patientId}-1-3-3`,
              name: 'Brócolis refogado',
              category: 'Hortaliças e derivados',
              quantity: 100,
              calories: 25,
              protein: 3.0,
              carbs: 4.0,
              fat: 0.4,
              fiber: 3.4
            }
          ]
        }
      ]
    },
    {
      id: `mock-diet-${patientId}-2`,
      name: data.diets[1].name,
      description: `Segunda dieta para ${patientName}. Ajustes baseados na evolução. ${data.diets[1].objective}.`,
      startDate: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
      endDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      targetCalories: data.diets[1].calories,
      targetProtein: data.diets[1].protein,
      targetCarbs: data.diets[1].carbs,
      targetFat: data.diets[1].fat,
      calories: data.diets[1].calories,
      protein: data.diets[1].protein,
      carbs: data.diets[1].carbs,
      fat: data.diets[1].fat,
      fiber: 28,
      isActive: false,
      adherenceScore: data.diets[1].adherence,
      notes: `Ajuste na dieta anterior. ${data.diets[1].objective}. Aderência ${data.diets[1].adherence}%.`,
      createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      meals: [
        {
          id: `mock-meal-${patientId}-2-1`,
          mealType: 'BREAKFAST',
          name: 'Café da Manhã Reforçado',
          description: 'Aveia, frutas vermelhas, castanhas',
          calories: Math.round(data.diets[1].calories * 0.25),
          time: '07:30'
        },
        {
          id: `mock-meal-${patientId}-2-2`,
          mealType: 'LUNCH',
          name: 'Almoço Balanceado',
          description: 'Quinoa, salmão, legumes refogados',
          calories: Math.round(data.diets[1].calories * 0.35),
          time: '12:30'
        },
        {
          id: `mock-meal-${patientId}-2-3`,
          mealType: 'DINNER',
          name: 'Jantar Leve',
          description: 'Salada completa, proteína magra',
          calories: Math.round(data.diets[1].calories * 0.30),
          time: '19:30'
        }
      ]
    },
    {
      id: `mock-diet-${patientId}-3`,
      name: data.diets[2].name,
      description: `Dieta atual de ${patientName}. ${data.diets[2].objective}. Excelente aderência.`,
      startDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      endDate: null,
      targetCalories: data.diets[2].calories,
      targetProtein: data.diets[2].protein,
      targetCarbs: data.diets[2].carbs,
      targetFat: data.diets[2].fat,
      calories: data.diets[2].calories,
      protein: data.diets[2].protein,
      carbs: data.diets[2].carbs,
      fat: data.diets[2].fat,
      fiber: 30,
      isActive: true,
      adherenceScore: data.diets[2].adherence,
      notes: `Dieta atual otimizada. ${data.diets[2].objective}. Paciente muito satisfeito com resultados.`,
      createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      meals: [
        {
          id: `mock-meal-${patientId}-3-1`,
          mealType: 'BREAKFAST',
          name: 'Café da Manhã Completo',
          description: 'Iogurte grego, granola, frutas frescas',
          calories: Math.round(data.diets[2].calories * 0.25),
          time: '07:00'
        },
        {
          id: `mock-meal-${patientId}-3-2`,
          mealType: 'MORNING_SNACK',
          name: 'Lanche da Manhã',
          description: 'Castanhas, água de coco',
          calories: Math.round(data.diets[2].calories * 0.10),
          time: '10:00'
        },
        {
          id: `mock-meal-${patientId}-3-3`,
          mealType: 'LUNCH',
          name: 'Almoço Nutritivo',
          description: 'Arroz integral, proteína, salada colorida',
          calories: Math.round(data.diets[2].calories * 0.35),
          time: '12:00'
        },
        {
          id: `mock-meal-${patientId}-3-4`,
          mealType: 'AFTERNOON_SNACK',
          name: 'Lanche da Tarde',
          description: 'Smoothie de proteína e frutas',
          calories: Math.round(data.diets[2].calories * 0.10),
          time: '15:30'
        },
        {
          id: `mock-meal-${patientId}-3-5`,
          mealType: 'DINNER',
          name: 'Jantar Equilibrado',
          description: 'Peixe, batata doce, vegetais grelhados',
          calories: Math.round(data.diets[2].calories * 0.20),
          time: '19:00'
        }
      ]
    }
  ]
}