// Fórmula de Harris-Benedict para calcular TMB (Taxa Metabólica Basal)
export const calculateBMR = (
  weight: number, // em kg
  height: number, // em cm
  age: number,
  gender: 'MALE' | 'FEMALE'
): number => {
  if (gender === 'MALE') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

// Níveis de atividade física
export const activityLevels = {
  sedentary: 1.2,        // Pouco ou nenhum exercício
  light: 1.375,          // Exercício leve 1-3 dias/semana
  moderate: 1.55,        // Exercício moderado 3-5 dias/semana
  active: 1.725,         // Exercício pesado 6-7 dias/semana
  veryActive: 1.9        // Exercício muito pesado ou trabalho físico
}

// Calcular necessidade calórica diária
export const calculateDailyCalories = (
  bmr: number,
  activityLevel: keyof typeof activityLevels,
  goal: 'maintain' | 'lose' | 'gain' = 'maintain'
): number => {
  const maintenance = bmr * activityLevels[activityLevel]
  
  switch (goal) {
    case 'lose':
      return maintenance - 500 // Déficit de 500 kcal para perder ~0.5kg/semana
    case 'gain':
      return maintenance + 500 // Superávit de 500 kcal para ganhar ~0.5kg/semana
    default:
      return maintenance
  }
}

// Distribuição de macronutrientes (% das calorias totais)
export const macroDistribution = {
  balanced: { protein: 20, carbs: 50, fat: 30 },
  lowCarb: { protein: 30, carbs: 20, fat: 50 },
  highProtein: { protein: 35, carbs: 35, fat: 30 },
  ketogenic: { protein: 20, carbs: 5, fat: 75 }
}

// Calcular gramas de macronutrientes
export const calculateMacros = (
  calories: number,
  distribution: keyof typeof macroDistribution
) => {
  const dist = macroDistribution[distribution]
  
  return {
    protein: Math.round((calories * dist.protein / 100) / 4), // 4 kcal/g
    carbs: Math.round((calories * dist.carbs / 100) / 4),     // 4 kcal/g
    fat: Math.round((calories * dist.fat / 100) / 9)         // 9 kcal/g
  }
}

// Necessidade de água (ml/dia)
export const calculateWaterNeeds = (weight: number, activityLevel: string): number => {
  const base = weight * 35 // 35ml por kg
  const activityBonus = activityLevel === 'active' || activityLevel === 'veryActive' ? 500 : 0
  return base + activityBonus
}

// Validar valores nutricionais
export const validateNutritionData = (data: {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}) => {
  const errors: string[] = []
  
  if (data.calories && data.calories < 0) {
    errors.push('Calorias não podem ser negativas')
  }
  
  if (data.protein && data.protein < 0) {
    errors.push('Proteína não pode ser negativa')
  }
  
  if (data.carbs && data.carbs < 0) {
    errors.push('Carboidratos não podem ser negativos')
  }
  
  if (data.fat && data.fat < 0) {
    errors.push('Gordura não pode ser negativa')
  }
  
  return errors
}