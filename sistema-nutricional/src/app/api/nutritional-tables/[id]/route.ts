import { NextRequest, NextResponse } from 'next/server'
import tacoData from '@/data/taco-expanded.json'
import ibgeData from '@/data/ibge-pof.json'

interface FoodDetailResponse {
  success: boolean
  data?: {
    food: any
    source: 'TACO' | 'IBGE'
    relatedFoods?: any[]
    nutritionalAnalysis?: {
      classification: {
        calories: 'baixa' | 'moderada' | 'alta'
        protein: 'baixo' | 'moderado' | 'alto'
        fiber: 'baixo' | 'moderado' | 'alto'
      }
      highlights: string[]
      warnings: string[]
    }
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const foodId = parseInt(params.id)
    
    if (isNaN(foodId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do alimento inválido'
      }, { status: 400 })
    }

    // Buscar o alimento nas duas bases
    let foundFood: any = null
    let source: 'TACO' | 'IBGE' | null = null

    // Primeiro procurar na TACO
    const tacoFood = tacoData.alimentos.find(food => food.id === foodId)
    if (tacoFood) {
      foundFood = { ...tacoFood, fonte: 'TACO' }
      source = 'TACO'
    }

    // Se não encontrar na TACO, procurar na IBGE
    if (!foundFood) {
      const ibgeFood = ibgeData.alimentos.find(food => food.id === foodId)
      if (ibgeFood) {
        foundFood = { ...ibgeFood, fonte: 'IBGE' }
        source = 'IBGE'
      }
    }

    if (!foundFood || !source) {
      return NextResponse.json({
        success: false,
        error: 'Alimento não encontrado'
      }, { status: 404 })
    }

    // Buscar alimentos relacionados (mesma categoria)
    const allFoods = [
      ...tacoData.alimentos.map(food => ({ ...food, fonte: 'TACO' })),
      ...ibgeData.alimentos.map(food => ({ ...food, fonte: 'IBGE' }))
    ]

    const relatedFoods = allFoods
      .filter(food => 
        food.categoria === foundFood.categoria && 
        food.id !== foundFood.id
      )
      .sort((a, b) => {
        // Ordenar por similaridade nutricional (diferença em calorias)
        const diffA = Math.abs(a.energia_kcal - foundFood.energia_kcal)
        const diffB = Math.abs(b.energia_kcal - foundFood.energia_kcal)
        return diffA - diffB
      })
      .slice(0, 5) // Limitar a 5 alimentos relacionados

    // Análise nutricional
    const nutritionalAnalysis = analyzeFood(foundFood)

    const response: FoodDetailResponse = {
      success: true,
      data: {
        food: foundFood,
        source,
        relatedFoods,
        nutritionalAnalysis
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar alimento:', error)
    
    const response: FoodDetailResponse = {
      success: false,
      error: 'Erro interno do servidor'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

function analyzeFood(food: any) {
  const analysis = {
    classification: {
      calories: 'moderada' as 'baixa' | 'moderada' | 'alta',
      protein: 'moderado' as 'baixo' | 'moderado' | 'alto',
      fiber: 'moderado' as 'baixo' | 'moderado' | 'alto'
    },
    highlights: [] as string[],
    warnings: [] as string[]
  }

  // Classificação calórica
  if (food.energia_kcal < 100) {
    analysis.classification.calories = 'baixa'
  } else if (food.energia_kcal > 300) {
    analysis.classification.calories = 'alta'
  }

  // Classificação proteica
  if (food.proteina_g < 5) {
    analysis.classification.protein = 'baixo'
  } else if (food.proteina_g > 15) {
    analysis.classification.protein = 'alto'
  }

  // Classificação de fibras
  if (food.fibra_alimentar_g < 3) {
    analysis.classification.fiber = 'baixo'
  } else if (food.fibra_alimentar_g > 6) {
    analysis.classification.fiber = 'alto'
  }

  // Destaques nutricionais
  if (food.proteina_g > 20) {
    analysis.highlights.push('Rico em proteínas')
  }
  if (food.fibra_alimentar_g > 5) {
    analysis.highlights.push('Rica fonte de fibras')
  }
  if (food.ferro_mg > 3) {
    analysis.highlights.push('Rica fonte de ferro')
  }
  if (food.calcio_mg > 100) {
    analysis.highlights.push('Rica fonte de cálcio')
  }
  if (food.vitamina_c_mg > 30) {
    analysis.highlights.push('Rica fonte de vitamina C')
  }
  if (food.energia_kcal < 50) {
    analysis.highlights.push('Baixas calorias')
  }

  // Alertas
  if (food.sodio_mg > 600) {
    analysis.warnings.push('Alto teor de sódio')
  }
  if (food.lipidios_saturados_g > 5) {
    analysis.warnings.push('Alto teor de gorduras saturadas')
  }
  if (food.colesterol_mg > 100) {
    analysis.warnings.push('Alto teor de colesterol')
  }
  if (food.acidos_graxos_trans_g > 0.5) {
    analysis.warnings.push('Contém gorduras trans')
  }

  return analysis
}

// Endpoint para comparar dois alimentos
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { compareWithId } = body
    
    const foodId1 = parseInt(params.id)
    const foodId2 = parseInt(compareWithId)

    if (isNaN(foodId1) || isNaN(foodId2)) {
      return NextResponse.json({
        success: false,
        error: 'IDs dos alimentos inválidos'
      }, { status: 400 })
    }

    // Buscar ambos os alimentos
    const allFoods = [
      ...tacoData.alimentos.map(food => ({ ...food, fonte: 'TACO' })),
      ...ibgeData.alimentos.map(food => ({ ...food, fonte: 'IBGE' }))
    ]

    const food1 = allFoods.find(food => food.id === foodId1)
    const food2 = allFoods.find(food => food.id === foodId2)

    if (!food1 || !food2) {
      return NextResponse.json({
        success: false,
        error: 'Um ou ambos os alimentos não foram encontrados'
      }, { status: 404 })
    }

    // Comparar nutrientes principais
    const comparison = {
      food1,
      food2,
      differences: {
        energia_kcal: {
          food1: food1.energia_kcal,
          food2: food2.energia_kcal,
          difference: food1.energia_kcal - food2.energia_kcal,
          percentageDiff: ((food1.energia_kcal - food2.energia_kcal) / food2.energia_kcal) * 100
        },
        proteina_g: {
          food1: food1.proteina_g,
          food2: food2.proteina_g,
          difference: food1.proteina_g - food2.proteina_g,
          percentageDiff: food2.proteina_g > 0 ? ((food1.proteina_g - food2.proteina_g) / food2.proteina_g) * 100 : 0
        },
        carboidrato_g: {
          food1: food1.carboidrato_g,
          food2: food2.carboidrato_g,
          difference: food1.carboidrato_g - food2.carboidrato_g,
          percentageDiff: food2.carboidrato_g > 0 ? ((food1.carboidrato_g - food2.carboidrato_g) / food2.carboidrato_g) * 100 : 0
        },
        lipidios_g: {
          food1: food1.lipidios_g,
          food2: food2.lipidios_g,
          difference: food1.lipidios_g - food2.lipidios_g,
          percentageDiff: food2.lipidios_g > 0 ? ((food1.lipidios_g - food2.lipidios_g) / food2.lipidios_g) * 100 : 0
        },
        fibra_alimentar_g: {
          food1: food1.fibra_alimentar_g,
          food2: food2.fibra_alimentar_g,
          difference: food1.fibra_alimentar_g - food2.fibra_alimentar_g,
          percentageDiff: food2.fibra_alimentar_g > 0 ? ((food1.fibra_alimentar_g - food2.fibra_alimentar_g) / food2.fibra_alimentar_g) * 100 : 0
        }
      },
      summary: generateComparisonSummary(food1, food2)
    }

    return NextResponse.json({
      success: true,
      data: comparison
    })

  } catch (error) {
    console.error('Erro ao comparar alimentos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function generateComparisonSummary(food1: any, food2: any): string[] {
  const summary = []

  // Comparar calorias
  const calorieDiff = Math.abs(food1.energia_kcal - food2.energia_kcal)
  if (calorieDiff > 50) {
    const higher = food1.energia_kcal > food2.energia_kcal ? food1.nome : food2.nome
    summary.push(`${higher} tem significativamente mais calorias`)
  }

  // Comparar proteínas
  const proteinDiff = Math.abs(food1.proteina_g - food2.proteina_g)
  if (proteinDiff > 5) {
    const higher = food1.proteina_g > food2.proteina_g ? food1.nome : food2.nome
    summary.push(`${higher} é mais rico em proteínas`)
  }

  // Comparar fibras
  const fiberDiff = Math.abs(food1.fibra_alimentar_g - food2.fibra_alimentar_g)
  if (fiberDiff > 2) {
    const higher = food1.fibra_alimentar_g > food2.fibra_alimentar_g ? food1.nome : food2.nome
    summary.push(`${higher} contém mais fibras`)
  }

  // Comparar gorduras
  const lipidDiff = Math.abs(food1.lipidios_g - food2.lipidios_g)
  if (lipidDiff > 3) {
    const higher = food1.lipidios_g > food2.lipidios_g ? food1.nome : food2.nome
    const lower = food1.lipidios_g < food2.lipidios_g ? food1.nome : food2.nome
    summary.push(`${lower} tem menos gorduras que ${higher}`)
  }

  if (summary.length === 0) {
    summary.push('Os alimentos têm perfis nutricionais similares')
  }

  return summary
}