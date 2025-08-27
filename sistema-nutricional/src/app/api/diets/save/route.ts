import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Interface para dados completos da dieta
interface SaveDietRequest {
  patientId: string
  name: string
  description?: string
  targetNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  meals: {
    id: string
    meal: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper'
    time?: string
    food: {
      id: number
      nome: string
      categoria: string
      energia: number
      proteina: number
      carboidrato: number
      lipidios: number
      fibra: number
    }
    quantity: number
    notes?: string
  }[]
  patientGender: 'male' | 'female'
  activeMeals: {[key: string]: boolean}
  mealTimes: {[key: string]: string}
}

// POST - Salvar nova dieta completa
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: SaveDietRequest = await request.json()
    
    // Validações básicas
    if (!data.patientId || !data.name || !data.meals || data.meals.length === 0) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: patientId, name, meals' 
      }, { status: 400 })
    }

    // Calcular totais nutricionais reais com base nos alimentos
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0

    data.meals.forEach(meal => {
      const factor = meal.quantity / 100 // Fator de conversão para gramas
      totalCalories += meal.food.energia * factor
      totalProtein += meal.food.proteina * factor
      totalCarbs += meal.food.carboidrato * factor
      totalFat += meal.food.lipidios * factor
      totalFiber += meal.food.fibra * factor
    })

    // Desativar dieta anterior se existir
    await prisma.diet.updateMany({
      where: {
        patientId: data.patientId,
        isActive: true
      },
      data: {
        isActive: false,
        endDate: new Date()
      }
    })

    // Criar nova dieta
    const diet = await prisma.diet.create({
      data: {
        patientId: data.patientId,
        nutritionistId: session.user.id,
        name: data.name,
        description: data.description || '',
        
        // Metas nutricionais
        targetCalories: data.targetNutrition.calories,
        targetProtein: data.targetNutrition.protein,
        targetCarbs: data.targetNutrition.carbs,
        targetFat: data.targetNutrition.fat,
        
        // Valores reais calculados
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        
        // Status
        isActive: true,
        startDate: new Date(),
        
        // Configurações da dieta
        patientGender: data.patientGender,
        activeMeals: JSON.stringify(data.activeMeals),
        mealTimes: JSON.stringify(data.mealTimes),
        
        // Criar refeições relacionadas
        meals: {
          create: groupMealsByType(data.meals).map(mealGroup => ({
            mealType: mealGroup.type.toUpperCase(),
            name: getMealName(mealGroup.type),
            description: mealGroup.foods.map(f => f.food.nome).join(', '),
            time: data.mealTimes[mealGroup.type] || '12:00',
            calories: Math.round(mealGroup.calories),
            protein: Math.round(mealGroup.protein * 10) / 10,
            carbs: Math.round(mealGroup.carbs * 10) / 10,
            fat: Math.round(mealGroup.fat * 10) / 10,
            fiber: Math.round(mealGroup.fiber * 10) / 10,
            
            // Criar alimentos da refeição
            foods: {
              create: mealGroup.foods.map(item => ({
                foodId: item.food.id.toString(),
                name: item.food.nome,
                category: item.food.categoria,
                quantity: item.quantity,
                calories: Math.round(item.food.energia * (item.quantity / 100)),
                protein: Math.round(item.food.proteina * (item.quantity / 100) * 10) / 10,
                carbs: Math.round(item.food.carboidrato * (item.quantity / 100) * 10) / 10,
                fat: Math.round(item.food.lipidios * (item.quantity / 100) * 10) / 10,
                fiber: Math.round(item.food.fibra * (item.quantity / 100) * 10) / 10,
                notes: item.notes || ''
              }))
            }
          }))
        }
      },
      include: {
        meals: {
          include: {
            foods: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      diet: diet,
      message: 'Dieta salva com sucesso!'
    })

  } catch (error) {
    console.error('Error saving diet:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// Função auxiliar para agrupar alimentos por tipo de refeição
function groupMealsByType(meals: SaveDietRequest['meals']) {
  const grouped = meals.reduce((acc, meal) => {
    if (!acc[meal.meal]) {
      acc[meal.meal] = {
        type: meal.meal,
        foods: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      }
    }
    
    const factor = meal.quantity / 100
    acc[meal.meal].foods.push(meal)
    acc[meal.meal].calories += meal.food.energia * factor
    acc[meal.meal].protein += meal.food.proteina * factor
    acc[meal.meal].carbs += meal.food.carboidrato * factor
    acc[meal.meal].fat += meal.food.lipidios * factor
    acc[meal.meal].fiber += meal.food.fibra * factor
    
    return acc
  }, {} as any)
  
  return Object.values(grouped)
}

// Função auxiliar para obter nome da refeição
function getMealName(mealType: string): string {
  const mealNames = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    supper: 'Ceia'
  }
  
  return mealNames[mealType as keyof typeof mealNames] || mealType
}