export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}

export const formatTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)} kg`
}

export const formatHeight = (height: number): string => {
  return `${height.toFixed(0)} cm`
}

export const formatCalories = (calories: number): string => {
  return `${calories} kcal`
}

export const formatMacros = (grams: number): string => {
  return `${grams.toFixed(1)}g`
}

export const calculateAge = (birthDate: Date | string): number => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Abaixo do peso'
  if (bmi < 25) return 'Peso normal'
  if (bmi < 30) return 'Sobrepeso'
  return 'Obesidade'
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Formatação específica para valores nutricionais da Tabela TACO
export const formatNutrient = (value: number, decimals: number = 2): string => {
  if (value === 0 || value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return value.toFixed(decimals)
}

export const formatEnergy = (value: number, unit: 'kcal' | 'kj' = 'kcal'): string => {
  const formatted = formatNutrient(value, 0) // Sem casas decimais para calorias
  return `${formatted} ${unit}`
}

export const formatMacro = (value: number, unit: string = 'g'): string => {
  const formatted = formatNutrient(value, 1) // 1 casa decimal para macronutrientes
  return `${formatted}${unit}`
}

export const formatMineral = (value: number, unit: string = 'mg'): string => {
  const formatted = formatNutrient(value, 2)
  return `${formatted}${unit}`
}

export const formatVitamin = (value: number, unit: string): string => {
  const formatted = formatNutrient(value, 2)
  return `${formatted}${unit}`
}

export const formatPercentage = (value: number): string => {
  const formatted = formatNutrient(value, 1)
  return `${formatted}%`
}