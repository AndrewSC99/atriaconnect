// Utility functions for advanced nutritional calculations

import { Alimento } from '@/hooks/useTaco'

export interface NutritionalSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugar: number
  
  // Micronutrientes
  calcium: number
  iron: number
  magnesium: number
  phosphorus: number
  potassium: number
  zinc: number
  vitaminC: number
  vitaminA: number
  vitaminE: number
  vitaminB12: number
  folate: number
}

export interface FoodPortion {
  food: Alimento
  quantity: number // em gramas
  unit?: string
}

export interface NutritionalAdequacy {
  nutrient: string
  value: number
  rda: number // Recommended Daily Allowance
  percentage: number
  status: 'deficient' | 'adequate' | 'excessive'
  recommendation?: string
}

export interface MealAnalysis {
  totalNutrition: NutritionalSummary
  adequacyAnalysis: NutritionalAdequacy[]
  glycemicLoad: number
  proteinQuality: number
  diversityScore: number
  recommendations: string[]
}

// RDA (Recommended Daily Allowance) para adultos
export const RDA_VALUES = {
  // Macronutrientes (g)
  protein: { male: 56, female: 46 },
  fiber: { male: 38, female: 25 },
  
  // Minerais (mg)
  calcium: { male: 1000, female: 1000 },
  iron: { male: 8, female: 18 },
  magnesium: { male: 400, female: 310 },
  phosphorus: { male: 700, female: 700 },
  potassium: { male: 3500, female: 2600 },
  zinc: { male: 11, female: 8 },
  sodium: { male: 2300, female: 2300 }, // limite máximo
  
  // Vitaminas
  vitaminC: { male: 90, female: 75 }, // mg
  vitaminA: { male: 900, female: 700 }, // μg RAE
  vitaminE: { male: 15, female: 15 }, // mg
  vitaminB12: { male: 2.4, female: 2.4 }, // μg
  folate: { male: 400, female: 400 } // μg
}

// Índice glicêmico aproximado por categoria (simplificado)
const GLYCEMIC_INDEX = {
  'Cereais e derivados': 70,
  'Verduras, hortaliças e derivados': 15,
  'Frutas e derivados': 35,
  'Gorduras e óleos': 0,
  'Pescados e frutos do mar': 0,
  'Carnes e derivados': 0,
  'Leite e derivados': 30,
  'Bebidas (alcoólicas e não alcoólicas)': 25,
  'Ovos e derivados': 0,
  'Produtos açucarados': 85,
  'Miscelâneas': 40,
  'outros': 50
}

// Calcular porção personalizada de um alimento
export const calculateFoodPortion = (food: Alimento, grams: number): NutritionalSummary => {
  const multiplier = grams / 100 // base é 100g
  
  return {
    calories: food.energia_kcal * multiplier,
    protein: food.proteina_g * multiplier,
    carbs: food.carboidrato_g * multiplier,
    fat: food.lipidios_g * multiplier,
    fiber: food.fibra_alimentar_g * multiplier,
    sodium: food.sodio_mg * multiplier,
    sugar: food.carboidrato_g * multiplier * 0.3, // estimativa
    
    // Micronutrientes
    calcium: food.calcio_mg * multiplier,
    iron: food.ferro_mg * multiplier,
    magnesium: food.magnesio_mg * multiplier,
    phosphorus: food.fosforo_mg * multiplier,
    potassium: food.potassio_mg * multiplier,
    zinc: food.zinco_mg * multiplier,
    vitaminC: food.vitamina_c_mg * multiplier,
    vitaminA: food.rae_mcg * multiplier,
    vitaminE: food.vitamina_e_mg * multiplier,
    vitaminB12: food.vitamina_b12_mcg * multiplier,
    folate: food.folato_mcg * multiplier
  }
}

// Somar valores nutricionais de múltiplos alimentos
export const sumNutritionalValues = (portions: FoodPortion[]): NutritionalSummary => {
  return portions.reduce((total, portion) => {
    const portionNutrition = calculateFoodPortion(portion.food, portion.quantity)
    
    return {
      calories: total.calories + portionNutrition.calories,
      protein: total.protein + portionNutrition.protein,
      carbs: total.carbs + portionNutrition.carbs,
      fat: total.fat + portionNutrition.fat,
      fiber: total.fiber + portionNutrition.fiber,
      sodium: total.sodium + portionNutrition.sodium,
      sugar: total.sugar + portionNutrition.sugar,
      
      calcium: total.calcium + portionNutrition.calcium,
      iron: total.iron + portionNutrition.iron,
      magnesium: total.magnesium + portionNutrition.magnesium,
      phosphorus: total.phosphorus + portionNutrition.phosphorus,
      potassium: total.potassium + portionNutrition.potassium,
      zinc: total.zinc + portionNutrition.zinc,
      vitaminC: total.vitaminC + portionNutrition.vitaminC,
      vitaminA: total.vitaminA + portionNutrition.vitaminA,
      vitaminE: total.vitaminE + portionNutrition.vitaminE,
      vitaminB12: total.vitaminB12 + portionNutrition.vitaminB12,
      folate: total.folate + portionNutrition.folate
    }
  }, {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0,
    calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, zinc: 0,
    vitaminC: 0, vitaminA: 0, vitaminE: 0, vitaminB12: 0, folate: 0
  })
}

// Calcular carga glicêmica
export const calculateGlycemicLoad = (portions: FoodPortion[]): number => {
  return portions.reduce((total, portion) => {
    const gi = GLYCEMIC_INDEX[portion.food.categoria as keyof typeof GLYCEMIC_INDEX] || 50
    const carbGrams = portion.food.carboidrato_g * (portion.quantity / 100)
    const gl = (gi * carbGrams) / 100
    return total + gl
  }, 0)
}

// Analisar adequação nutricional
export const analyzeNutritionalAdequacy = (
  nutrition: NutritionalSummary, 
  gender: 'male' | 'female' = 'female'
): NutritionalAdequacy[] => {
  const analysis: NutritionalAdequacy[] = []
  
  // Analisar cada nutriente
  Object.entries(RDA_VALUES).forEach(([nutrient, rdaValues]) => {
    const rda = rdaValues[gender]
    const value = nutrition[nutrient as keyof NutritionalSummary]
    const percentage = (value / rda) * 100
    
    let status: 'deficient' | 'adequate' | 'excessive' = 'adequate'
    let recommendation = ''
    
    if (nutrient === 'sodium') {
      // Para sódio, RDA é limite máximo
      if (percentage > 100) {
        status = 'excessive'
        recommendation = 'Reduzir consumo de alimentos processados e sal'
      } else if (percentage > 75) {
        status = 'adequate'
        recommendation = 'Monitorar consumo de sódio'
      } else {
        status = 'adequate'
      }
    } else {
      // Para outros nutrientes, RDA é mínimo
      if (percentage < 70) {
        status = 'deficient'
        recommendation = getDeficiencyRecommendation(nutrient)
      } else if (percentage > 300) {
        status = 'excessive'
        recommendation = 'Considerar reduzir suplementação ou alimentos fortificados'
      } else {
        status = 'adequate'
      }
    }
    
    analysis.push({
      nutrient: getNutrientDisplayName(nutrient),
      value: Number(value.toFixed(2)),
      rda,
      percentage: Number(percentage.toFixed(1)),
      status,
      recommendation
    })
  })
  
  return analysis.sort((a, b) => {
    // Priorizar deficiências e excessos
    if (a.status === 'deficient' && b.status !== 'deficient') return -1
    if (b.status === 'deficient' && a.status !== 'deficient') return 1
    if (a.status === 'excessive' && b.status !== 'excessive') return -1
    if (b.status === 'excessive' && a.status !== 'excessive') return 1
    return 0
  })
}

// Calcular qualidade proteica (baseado na diversidade de fontes)
export const calculateProteinQuality = (portions: FoodPortion[]): number => {
  const proteinSources = new Set()
  let totalProtein = 0
  
  portions.forEach(portion => {
    const proteinGrams = portion.food.proteina_g * (portion.quantity / 100)
    if (proteinGrams > 5) { // Só considerar fontes significativas
      proteinSources.add(portion.food.categoria)
      totalProtein += proteinGrams
    }
  })
  
  // Score baseado na diversidade e quantidade
  const diversityScore = Math.min(proteinSources.size / 3, 1) // até 3 fontes diferentes
  const quantityScore = Math.min(totalProtein / 50, 1) // até 50g de proteína
  
  return (diversityScore * 0.6 + quantityScore * 0.4) * 100
}

// Calcular score de diversidade alimentar
export const calculateDiversityScore = (portions: FoodPortion[]): number => {
  const categories = new Set()
  const foods = new Set()
  
  portions.forEach(portion => {
    categories.add(portion.food.categoria)
    foods.add(portion.food.id)
  })
  
  // Score baseado no número de categorias e alimentos diferentes
  const categoryScore = Math.min(categories.size / 6, 1) // até 6 categorias
  const foodScore = Math.min(foods.size / 10, 1) // até 10 alimentos
  
  return (categoryScore * 0.7 + foodScore * 0.3) * 100
}

// Gerar recomendações baseadas na análise
export const generateRecommendations = (analysis: MealAnalysis): string[] => {
  const recommendations: string[] = []
  
  // Recomendações baseadas em deficiências
  const deficiencies = analysis.adequacyAnalysis.filter(a => a.status === 'deficient')
  deficiencies.forEach(def => {
    if (def.recommendation) {
      recommendations.push(def.recommendation)
    }
  })
  
  // Recomendações baseadas na carga glicêmica
  if (analysis.glycemicLoad > 20) {
    recommendations.push('Considere reduzir alimentos de alto índice glicêmico')
  } else if (analysis.glycemicLoad < 5) {
    recommendations.push('Considere adicionar uma fonte de carboidratos de digestão lenta')
  }
  
  // Recomendações baseadas na qualidade proteica
  if (analysis.proteinQuality < 60) {
    recommendations.push('Diversifique as fontes de proteína (animal + vegetal)')
  }
  
  // Recomendações baseadas na diversidade
  if (analysis.diversityScore < 50) {
    recommendations.push('Aumente a variedade de alimentos e grupos alimentares')
  }
  
  return recommendations
}

// Análise completa de uma refeição
export const analyzeMeal = (
  portions: FoodPortion[], 
  gender: 'male' | 'female' = 'female'
): MealAnalysis => {
  const totalNutrition = sumNutritionalValues(portions)
  const adequacyAnalysis = analyzeNutritionalAdequacy(totalNutrition, gender)
  const glycemicLoad = calculateGlycemicLoad(portions)
  const proteinQuality = calculateProteinQuality(portions)
  const diversityScore = calculateDiversityScore(portions)
  
  const analysis: MealAnalysis = {
    totalNutrition,
    adequacyAnalysis,
    glycemicLoad,
    proteinQuality,
    diversityScore,
    recommendations: []
  }
  
  analysis.recommendations = generateRecommendations(analysis)
  
  return analysis
}

// Sugerir substituições para melhorar o perfil nutricional
export const suggestSubstitutions = (
  currentFood: Alimento,
  targetNutrient: keyof NutritionalSummary,
  foods: Alimento[]
): Alimento[] => {
  const currentValue = currentFood[targetNutrient as keyof Alimento] as number || 0
  
  return foods
    .filter(food => 
      food.categoria === currentFood.categoria && 
      food.id !== currentFood.id
    )
    .map(food => ({
      food,
      improvement: (food[targetNutrient as keyof Alimento] as number || 0) - currentValue
    }))
    .filter(item => item.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5)
    .map(item => item.food)
}

// Funções auxiliares
function getNutrientDisplayName(nutrient: string): string {
  const names: {[key: string]: string} = {
    protein: 'Proteína',
    fiber: 'Fibra',
    calcium: 'Cálcio',
    iron: 'Ferro',
    magnesium: 'Magnésio',
    phosphorus: 'Fósforo',
    potassium: 'Potássio',
    zinc: 'Zinco',
    sodium: 'Sódio',
    vitaminC: 'Vitamina C',
    vitaminA: 'Vitamina A',
    vitaminE: 'Vitamina E',
    vitaminB12: 'Vitamina B12',
    folate: 'Folato'
  }
  return names[nutrient] || nutrient
}

function getDeficiencyRecommendation(nutrient: string): string {
  const recommendations: {[key: string]: string} = {
    protein: 'Inclua mais carnes magras, ovos, leguminosas ou laticínios',
    fiber: 'Adicione mais frutas, verduras, legumes e cereais integrais',
    calcium: 'Consuma mais laticínios, vegetais verde-escuros ou sardinha',
    iron: 'Inclua carnes vermelhas, feijão, espinafre ou combine com vitamina C',
    magnesium: 'Adicione castanhas, sementes, vegetais verdes ou cereais integrais',
    potassium: 'Consuma mais frutas (banana, laranja) e vegetais',
    zinc: 'Inclua carnes, castanhas, sementes ou leguminosas',
    vitaminC: 'Adicione frutas cítricas, morango, kiwi ou pimentão',
    vitaminA: 'Consuma cenoura, batata-doce, espinafre ou fígado',
    folate: 'Inclua vegetais verde-escuros, leguminosas ou fígado'
  }
  return recommendations[nutrient] || `Considere alimentos ricos em ${getNutrientDisplayName(nutrient)}`
}

// Calcular distribuição calórica ideal por refeição
export const calculateMealCalorieDistribution = (totalCalories: number, activeMeals?: {[key: string]: boolean}) => {
  // Se não for fornecido activeMeals, usar padrão de 5 refeições
  if (!activeMeals) {
    return {
      breakfast: Math.round(totalCalories * 0.25), // 25%
      morning_snack: Math.round(totalCalories * 0.10), // 10%
      lunch: Math.round(totalCalories * 0.35), // 35%
      afternoon_snack: Math.round(totalCalories * 0.10), // 10%
      dinner: Math.round(totalCalories * 0.20) // 20%
    }
  }

  // Filtrar apenas refeições ativas
  const activeKeys = Object.keys(activeMeals).filter(key => activeMeals[key])
  const activeCount = activeKeys.length

  // Distribuições personalizadas baseadas no número de refeições ativas
  const distributions: {[key: number]: {[key: string]: number}} = {
    3: {
      breakfast: 0.30,
      lunch: 0.40,
      dinner: 0.30
    },
    4: {
      breakfast: 0.25,
      lunch: 0.35,
      afternoon_snack: 0.15,
      dinner: 0.25
    },
    5: {
      breakfast: 0.25,
      morning_snack: 0.10,
      lunch: 0.35,
      afternoon_snack: 0.10,
      dinner: 0.20
    },
    6: {
      breakfast: 0.20,
      morning_snack: 0.10,
      lunch: 0.30,
      afternoon_snack: 0.10,
      dinner: 0.20,
      supper: 0.10
    }
  }

  const distribution = distributions[activeCount] || distributions[5]
  const result: {[key: string]: number} = {}

  // Aplicar distribuição apenas para refeições ativas
  activeKeys.forEach(key => {
    const percentage = distribution[key] || (1 / activeCount) // Fallback para distribuição igual
    result[key] = Math.round(totalCalories * percentage)
  })

  // Garantir que refeições inativas tenham 0 calorias
  Object.keys(activeMeals).forEach(key => {
    if (!activeMeals[key]) {
      result[key] = 0
    }
  })

  return result
}

// Verificar se uma refeição está balanceada
export const isMealBalanced = (portions: FoodPortion[]): {
  isBalanced: boolean
  issues: string[]
  suggestions: string[]
} => {
  const nutrition = sumNutritionalValues(portions)
  const totalCalories = nutrition.calories
  
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Verificar distribuição de macronutrientes
  const proteinCalories = nutrition.protein * 4
  const carbCalories = nutrition.carbs * 4
  const fatCalories = nutrition.fat * 9
  
  const proteinPercent = (proteinCalories / totalCalories) * 100
  const carbPercent = (carbCalories / totalCalories) * 100
  const fatPercent = (fatCalories / totalCalories) * 100
  
  if (proteinPercent < 10) {
    issues.push('Baixo teor de proteína')
    suggestions.push('Adicione uma fonte de proteína (carne, ovo, leguminosa)')
  }
  
  if (carbPercent < 45) {
    issues.push('Baixo teor de carboidratos')
    suggestions.push('Inclua cereais, frutas ou tubérculos')
  } else if (carbPercent > 65) {
    issues.push('Alto teor de carboidratos')
    suggestions.push('Reduza carboidratos simples e aumente proteínas')
  }
  
  if (fatPercent > 35) {
    issues.push('Alto teor de gordura')
    suggestions.push('Reduza frituras e alimentos gordurosos')
  } else if (fatPercent < 20) {
    issues.push('Baixo teor de gordura')
    suggestions.push('Adicione gorduras saudáveis (azeite, castanhas, abacate)')
  }
  
  // Verificar fibras
  if (nutrition.fiber < 5) {
    issues.push('Baixo teor de fibras')
    suggestions.push('Adicione frutas, verduras ou cereais integrais')
  }
  
  return {
    isBalanced: issues.length === 0,
    issues,
    suggestions
  }
}