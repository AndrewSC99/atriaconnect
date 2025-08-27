// Utility functions for energy expenditure calculations

export type TMBEquation = 'MIFFLIN_ST_JEOR' | 'HARRIS_BENEDICT_ORIGINAL' | 'HARRIS_BENEDICT_REVISED' | 'KATCH_MCARDLE'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'INTENSE' | 'EXTREME'
export type NutritionalObjective = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'WEIGHT_GAIN' | 'MUSCLE_GAIN'

interface TMBParams {
  weight: number // kg
  height: number // cm
  age: number
  gender: 'MALE' | 'FEMALE'
  bodyFat?: number // percentage
  muscleMass?: number // kg
}

interface SpecialConditions {
  isPregnant?: boolean
  pregnancyTrimester?: 1 | 2 | 3
  pregnancyWeeks?: number
  isLactating?: boolean
  lactationType?: 'EXCLUSIVE' | 'PARTIAL'
  hasThyroidIssues?: boolean
  hasDiabetes?: boolean
  hasMetabolicDisorder?: boolean
}

// TMB Calculations
export const calculateTMB = (params: TMBParams, equation: TMBEquation): number => {
  const { weight, height, age, gender, bodyFat, muscleMass } = params

  switch (equation) {
    case 'MIFFLIN_ST_JEOR':
      return gender === 'MALE'
        ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

    case 'HARRIS_BENEDICT_ORIGINAL':
      return gender === 'MALE'
        ? 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age)
        : 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age)

    case 'HARRIS_BENEDICT_REVISED':
      return gender === 'MALE'
        ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

    case 'KATCH_MCARDLE':
      if (!bodyFat || !muscleMass) {
        // Fall back to Mifflin if body composition not available
        return calculateTMB(params, 'MIFFLIN_ST_JEOR')
      }
      const leanBodyMass = weight * (1 - bodyFat / 100)
      return 370 + (21.6 * leanBodyMass)

    default:
      return calculateTMB(params, 'MIFFLIN_ST_JEOR')
  }
}

// Activity multipliers
export const getActivityMultiplier = (level: ActivityLevel): number => {
  const multipliers = {
    SEDENTARY: 1.2,   // Little or no exercise
    LIGHT: 1.375,     // Light exercise 1-3 days/week
    MODERATE: 1.55,   // Moderate exercise 3-5 days/week
    INTENSE: 1.725,   // Heavy exercise 6-7 days/week
    EXTREME: 1.9      // Very heavy exercise + physical job
  }
  return multipliers[level]
}

// Special condition adjustments
export const applySpecialConditionAdjustments = (
  tmb: number,
  conditions: SpecialConditions
): number => {
  let adjustedTMB = tmb

  // Pregnancy adjustments
  if (conditions.isPregnant && conditions.pregnancyTrimester) {
    switch (conditions.pregnancyTrimester) {
      case 1:
        adjustedTMB += 0 // No additional calories in first trimester
        break
      case 2:
        adjustedTMB += 340 // Additional 340 kcal in second trimester
        break
      case 3:
        adjustedTMB += 450 // Additional 450 kcal in third trimester
        break
    }
  }

  // Lactation adjustments
  if (conditions.isLactating) {
    const lactationCalories = conditions.lactationType === 'EXCLUSIVE' ? 500 : 300
    adjustedTMB += lactationCalories
  }

  // Metabolic condition adjustments
  if (conditions.hasThyroidIssues) {
    adjustedTMB *= 0.9 // 10% reduction for hypothyroidism (common case)
  }

  if (conditions.hasMetabolicDisorder) {
    adjustedTMB *= 0.95 // 5% reduction for general metabolic disorders
  }

  return adjustedTMB
}

// Calculate Total Energy Expenditure (TEE)
export const calculateTEE = (
  tmb: number,
  activityLevel: ActivityLevel,
  specialConditions?: SpecialConditions
): number => {
  let adjustedTMB = tmb
  
  if (specialConditions) {
    adjustedTMB = applySpecialConditionAdjustments(tmb, specialConditions)
  }
  
  return adjustedTMB * getActivityMultiplier(activityLevel)
}

// Calculate target calories based on objective
export const calculateTargetCalories = (
  tee: number,
  objective: NutritionalObjective
): number => {
  const adjustments = {
    WEIGHT_LOSS: 0.85,    // 15% deficit
    MAINTENANCE: 1.0,     // No change
    WEIGHT_GAIN: 1.15,    // 15% surplus
    MUSCLE_GAIN: 1.20     // 20% surplus for muscle gain
  }
  
  return tee * adjustments[objective]
}

// Calculate macronutrient distribution
export const calculateMacronutrients = (
  calories: number,
  carbPercentage: number,
  proteinPercentage: number,
  fatPercentage: number
) => {
  return {
    carbGrams: Math.round((calories * carbPercentage / 100) / 4),
    proteinGrams: Math.round((calories * proteinPercentage / 100) / 4),
    fatGrams: Math.round((calories * fatPercentage / 100) / 9)
  }
}

// Get equation information for UI
export const getEquationInfo = (equation: TMBEquation) => {
  const info = {
    MIFFLIN_ST_JEOR: {
      name: 'Mifflin-St Jeor',
      description: 'Mais precisa para população geral (1990)',
      accuracy: 'Alta',
      bestFor: 'População geral, sobrepeso e obesidade',
      requirements: 'Peso, altura, idade, sexo'
    },
    HARRIS_BENEDICT_ORIGINAL: {
      name: 'Harris-Benedict Original',
      description: 'Equação clássica (1919)',
      accuracy: 'Moderada',
      bestFor: 'Referência histórica',
      requirements: 'Peso, altura, idade, sexo'
    },
    HARRIS_BENEDICT_REVISED: {
      name: 'Harris-Benedict Revisada',
      description: 'Versão atualizada (1984)',
      accuracy: 'Boa',
      bestFor: 'Comparação com Mifflin',
      requirements: 'Peso, altura, idade, sexo'
    },
    KATCH_MCARDLE: {
      name: 'Katch-McArdle',
      description: 'Baseada na massa magra',
      accuracy: 'Muito Alta',
      bestFor: 'Atletas e pessoas com % gordura conhecido',
      requirements: 'Peso, % gordura corporal'
    }
  }
  
  return info[equation]
}

// Validate body composition for Katch-McArdle
export const canUseKatchMcArdle = (bodyFat?: number, muscleMass?: number): boolean => {
  return typeof bodyFat === 'number' && bodyFat > 0 && bodyFat < 50
}