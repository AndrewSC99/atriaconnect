'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TacoFoodSearchAdvanced } from './taco-food-search-advanced'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  Utensils,
  Clock,
  Share2,
  Save,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Settings,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Users,
  AlertCircle
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { 
  calculateFoodPortion, 
  sumNutritionalValues, 
  analyzeMeal,
  calculateMealCalorieDistribution,
  isMealBalanced,
  suggestSubstitutions,
  NutritionalSummary,
  FoodPortion,
  MealAnalysis
} from '@/utils/nutritionalCalculations'

interface MealItem extends FoodPortion {
  id: string
  meal: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper'
  notes?: string
}

interface DietPlan {
  name: string
  description?: string
  targetNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  meals: MealItem[]
  patientGender: 'male' | 'female'
}

interface AdvancedDietCreatorProps {
  targetNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  patientData?: {
    name: string
    gender: 'male' | 'female'
    age: number
    weight: number
    height: number
  }
  isInsideConsultation?: boolean
  onDietChange?: (dietData: DietPlan, activeMeals: {[key: string]: boolean}, mealTimes: {[key: string]: string}) => void
}

export function AdvancedDietCreator({ targetNutrition, patientData, isInsideConsultation, onDietChange }: AdvancedDietCreatorProps) {
  const { foods, calculatePortion } = useTaco()
  
  // Estados para salvamento
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const [dietPlan, setDietPlan] = useState<DietPlan>({
    name: 'Novo Plano Alimentar',
    description: '',
    targetNutrition: targetNutrition || {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 67
    },
    meals: [],
    patientGender: patientData?.gender || 'female'
  })

  const [selectedMeal, setSelectedMeal] = useState<keyof typeof mealLabels>('breakfast')
  const [activeTab, setActiveTab] = useState('creator')
  const [showAnalysis, setShowAnalysis] = useState(false)
  
  // Estados para configuração de refeições
  const [activeMeals, setActiveMeals] = useState<{[key: string]: boolean}>({
    breakfast: true,
    morning_snack: true,
    lunch: true,
    afternoon_snack: true,
    dinner: true,
    supper: false
  })
  
  const [mealTimes, setMealTimes] = useState<{[key: string]: string}>({
    breakfast: '07:00',
    morning_snack: '10:00',
    lunch: '12:30',
    afternoon_snack: '15:30',
    dinner: '19:00',
    supper: '22:00'
  })
  
  const [showMealConfig, setShowMealConfig] = useState(false)

  // Estados para personalização de distribuição calórica
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)
  const [distributionProfile, setDistributionProfile] = useState<string>('default')
  const [customDistribution, setCustomDistribution] = useState<{[key: string]: number}>({})
  
  // Perfis pré-definidos de distribuição calórica
  const distributionProfiles = {
    default: {
      name: 'Padrão do Sistema',
      description: 'Distribuição equilibrada padrão',
      distributions: {
        3: { breakfast: 30, lunch: 40, dinner: 30 },
        4: { breakfast: 25, lunch: 35, afternoon_snack: 15, dinner: 25 },
        5: { breakfast: 25, morning_snack: 10, lunch: 35, afternoon_snack: 10, dinner: 20 },
        6: { breakfast: 20, morning_snack: 10, lunch: 30, afternoon_snack: 10, dinner: 20, supper: 10 }
      }
    },
    brazilian: {
      name: 'Padrão Brasileiro',
      description: 'Almoço reforçado, jantar mais leve',
      distributions: {
        3: { breakfast: 25, lunch: 45, dinner: 30 },
        4: { breakfast: 25, lunch: 40, afternoon_snack: 10, dinner: 25 },
        5: { breakfast: 20, morning_snack: 10, lunch: 40, afternoon_snack: 10, dinner: 20 },
        6: { breakfast: 20, morning_snack: 8, lunch: 35, afternoon_snack: 12, dinner: 20, supper: 5 }
      }
    },
    athlete_morning: {
      name: 'Atleta Matutino',
      description: 'Café da manhã reforçado para treino',
      distributions: {
        3: { breakfast: 35, lunch: 35, dinner: 30 },
        4: { breakfast: 30, lunch: 35, afternoon_snack: 15, dinner: 20 },
        5: { breakfast: 30, morning_snack: 15, lunch: 30, afternoon_snack: 10, dinner: 15 },
        6: { breakfast: 25, morning_snack: 15, lunch: 25, afternoon_snack: 15, dinner: 15, supper: 5 }
      }
    },
    night_worker: {
      name: 'Trabalhador Noturno',
      description: 'Jantar e ceia reforçados',
      distributions: {
        3: { breakfast: 25, lunch: 30, dinner: 45 },
        4: { breakfast: 20, lunch: 30, afternoon_snack: 15, dinner: 35 },
        5: { breakfast: 20, morning_snack: 10, lunch: 25, afternoon_snack: 15, dinner: 30 },
        6: { breakfast: 15, morning_snack: 10, lunch: 25, afternoon_snack: 15, dinner: 20, supper: 15 }
      }
    },
    diabetic: {
      name: 'Diabético',
      description: 'Distribuição uniforme para controle glicêmico',
      distributions: {
        3: { breakfast: 33, lunch: 34, dinner: 33 },
        4: { breakfast: 25, lunch: 25, afternoon_snack: 25, dinner: 25 },
        5: { breakfast: 20, morning_snack: 20, lunch: 20, afternoon_snack: 20, dinner: 20 },
        6: { breakfast: 17, morning_snack: 17, lunch: 16, afternoon_snack: 17, dinner: 16, supper: 17 }
      }
    },
    custom: {
      name: 'Personalizado',
      description: 'Ajuste manual das porcentagens',
      distributions: {} // Será preenchido com customDistribution
    }
  }

  const mealLabels = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    supper: 'Ceia'
  }

  // Calcular distribuição ideal de calorias por refeição
  const idealDistribution = useMemo(() => {
    if (distributionProfile !== 'default') {
      const activeCount = Object.values(activeMeals).filter(Boolean).length
      const profile = distributionProfiles[distributionProfile as keyof typeof distributionProfiles]
      
      if (distributionProfile === 'custom' && Object.keys(customDistribution).length > 0) {
        // Usar distribuição personalizada
        const result: {[key: string]: number} = {}
        Object.keys(activeMeals).forEach(key => {
          if (activeMeals[key]) {
            result[key] = Math.round(dietPlan.targetNutrition.calories * (customDistribution[key] || 0) / 100)
          } else {
            result[key] = 0
          }
        })
        return result
      } else if (profile?.distributions[activeCount as keyof typeof profile.distributions]) {
        // Usar perfil pré-definido
        const distribution = profile.distributions[activeCount as keyof typeof profile.distributions]
        const result: {[key: string]: number} = {}
        Object.keys(activeMeals).forEach(key => {
          if (activeMeals[key]) {
            result[key] = Math.round(dietPlan.targetNutrition.calories * (distribution[key as keyof typeof distribution] || 0) / 100)
          } else {
            result[key] = 0
          }
        })
        return result
      }
    }
    
    // Usar distribuição padrão
    return calculateMealCalorieDistribution(dietPlan.targetNutrition.calories, activeMeals)
  }, [dietPlan.targetNutrition.calories, activeMeals, distributionProfile, customDistribution])

  // Calcular nutrição atual por refeição
  const mealNutrition = useMemo(() => {
    const nutrition: { [key: string]: NutritionalSummary } = {}
    
    Object.keys(mealLabels).forEach(mealType => {
      const mealItems = dietPlan.meals.filter(item => item.meal === mealType)
      nutrition[mealType] = sumNutritionalValues(mealItems)
    })
    
    return nutrition
  }, [dietPlan.meals])

  // Calcular nutrição total do dia
  const totalNutrition = useMemo(() => 
    sumNutritionalValues(dietPlan.meals), 
    [dietPlan.meals]
  )

  // Análise completa da dieta
  const dietAnalysis = useMemo(() => 
    analyzeMeal(dietPlan.meals, dietPlan.patientGender), 
    [dietPlan.meals, dietPlan.patientGender]
  )

  // Calcular progresso em relação às metas
  const nutritionProgress = useMemo(() => {
    const target = dietPlan.targetNutrition
    const current = totalNutrition
    
    return {
      calories: {
        current: current.calories,
        target: target.calories,
        percentage: Math.min((current.calories / target.calories) * 100, 100),
        status: getProgressStatus(current.calories, target.calories)
      },
      protein: {
        current: current.protein,
        target: target.protein,
        percentage: Math.min((current.protein / target.protein) * 100, 100),
        status: getProgressStatus(current.protein, target.protein)
      },
      carbs: {
        current: current.carbs,
        target: target.carbs,
        percentage: Math.min((current.carbs / target.carbs) * 100, 100),
        status: getProgressStatus(current.carbs, target.carbs)
      },
      fat: {
        current: current.fat,
        target: target.fat,
        percentage: Math.min((current.fat / target.fat) * 100, 100),
        status: getProgressStatus(current.fat, target.fat)
      }
    }
  }, [totalNutrition, dietPlan.targetNutrition])

  const addFoodToMeal = (food: Alimento, quantity: number = 100) => {
    const newItem: MealItem = {
      id: `${food.id}-${Date.now()}`,
      food,
      quantity,
      meal: selectedMeal
    }

    setDietPlan(prev => ({
      ...prev,
      meals: [...prev.meals, newItem]
    }))
  }

  const removeFoodFromMeal = (itemId: string) => {
    setDietPlan(prev => ({
      ...prev,
      meals: prev.meals.filter(item => item.id !== itemId)
    }))
  }

  const updateFoodQuantity = (itemId: string, quantity: number) => {
    setDietPlan(prev => ({
      ...prev,
      meals: prev.meals.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    }))
  }

  const getMealItems = (mealType: keyof typeof mealLabels) => {
    return dietPlan.meals.filter(item => item.meal === mealType)
  }

  const getMealBalance = (mealType: keyof typeof mealLabels) => {
    const mealItems = getMealItems(mealType)
    return isMealBalanced(mealItems)
  }

  // Sugestões inteligentes para complementar refeição
  const getMealSuggestions = (mealType: keyof typeof mealLabels) => {
    const mealItems = getMealItems(mealType)
    const mealNut = mealNutrition[mealType]
    const idealCalories = idealDistribution[mealType as keyof typeof idealDistribution] || 400
    const remaining = idealCalories - mealNut.calories

    if (remaining <= 50) return []

    // Lógica simplificada de sugestões baseada no tipo de refeição e calories restantes
    const suggestions = []
    
    if (mealType === 'breakfast' && remaining > 100) {
      suggestions.push('Adicione uma fruta rica em vitaminas')
      suggestions.push('Inclua uma fonte de proteína (ovo, iogurte)')
    } else if (mealType === 'lunch' && remaining > 150) {
      suggestions.push('Adicione uma porção de vegetais')
      suggestions.push('Inclua uma fonte de carboidrato integral')
    }

    return suggestions
  }

  function getProgressStatus(current: number, target: number): 'low' | 'good' | 'high' {
    const percentage = (current / target) * 100
    if (percentage < 80) return 'low'
    if (percentage > 120) return 'high'
    return 'good'
  }

  const getProgressColor = (status: 'low' | 'good' | 'high') => {
    switch (status) {
      case 'low': return 'bg-red-500'
      case 'high': return 'bg-yellow-500'
      case 'good': return 'bg-green-500'
    }
  }

  // Funções para gerenciar refeições ativas
  const toggleMealActive = (mealKey: string) => {
    const activeCount = Object.values(activeMeals).filter(Boolean).length
    
    // Impedir desativar se já há apenas 3 refeições ativas
    if (activeMeals[mealKey] && activeCount <= 3) {
      alert('É necessário manter pelo menos 3 refeições ativas.')
      return
    }
    
    setActiveMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }))
    
    // Se desativando uma refeição, remover alimentos dela
    if (activeMeals[mealKey]) {
      setDietPlan(prev => ({
        ...prev,
        meals: prev.meals.filter(item => item.meal !== mealKey)
      }))
    }
  }

  const updateMealTime = (mealKey: string, time: string) => {
    setMealTimes(prev => ({
      ...prev,
      [mealKey]: time
    }))
  }

  const getActiveMealCount = () => {
    return Object.values(activeMeals).filter(Boolean).length
  }

  const resetMealConfig = () => {
    setActiveMeals({
      breakfast: true,
      morning_snack: true,
      lunch: true,
      afternoon_snack: true,
      dinner: true,
      supper: false
    })
    setMealTimes({
      breakfast: '07:00',
      morning_snack: '10:00',
      lunch: '12:30',
      afternoon_snack: '15:30',
      dinner: '19:00',
      supper: '22:00'
    })
  }


  const updateCustomDistribution = (mealKey: string, percentage: number) => {
    setCustomDistribution(prev => ({
      ...prev,
      [mealKey]: percentage
    }))
  }

  const calculateCustomTotal = () => {
    const activeKeys = Object.keys(activeMeals).filter(key => activeMeals[key])
    return activeKeys.reduce((total, key) => total + (customDistribution[key] || 0), 0)
  }

  const autoBalanceDistribution = () => {
    const activeKeys = Object.keys(activeMeals).filter(key => activeMeals[key])
    const evenPercentage = Math.floor(100 / activeKeys.length)
    const remainder = 100 - (evenPercentage * activeKeys.length)
    
    const balanced: {[key: string]: number} = {}
    activeKeys.forEach((key, index) => {
      balanced[key] = evenPercentage + (index < remainder ? 1 : 0)
    })
    
    setCustomDistribution(balanced)
  }

  // UseEffect para garantir que a refeição selecionada seja sempre ativa
  useEffect(() => {
    if (!activeMeals[selectedMeal]) {
      const firstActiveMeal = Object.keys(activeMeals).find(key => activeMeals[key]) as keyof typeof mealLabels
      if (firstActiveMeal) {
        setSelectedMeal(firstActiveMeal)
      }
    }
  }, [activeMeals, selectedMeal])

  // UseEffect para limpar mensagens de salvamento
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  // UseEffect para notificar mudanças na dieta quando dentro da consulta
  useEffect(() => {
    if (isInsideConsultation && onDietChange) {
      onDietChange(dietPlan, activeMeals, mealTimes)
    }
  }, [dietPlan, activeMeals, mealTimes, isInsideConsultation, onDietChange])

  // Função para salvar dieta
  const saveDietPlan = async () => {
    if (!patientData?.name) {
      setSaveMessage({type: 'error', text: 'Dados do paciente não encontrados'})
      return
    }

    if (dietPlan.meals.length === 0) {
      setSaveMessage({type: 'error', text: 'Adicione pelo menos um alimento à dieta'})
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/diets/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: patientData.name, // Usar nome como ID temporariamente para dados mockados
          name: dietPlan.name,
          description: dietPlan.description,
          targetNutrition: dietPlan.targetNutrition,
          meals: dietPlan.meals,
          patientGender: dietPlan.patientGender,
          activeMeals: activeMeals,
          mealTimes: mealTimes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSaveMessage({type: 'success', text: data.message || 'Dieta salva com sucesso!'})
        // Opcional: Limpar formulário ou redirecionar
      } else {
        setSaveMessage({type: 'error', text: data.error || 'Erro ao salvar dieta'})
      }
    } catch (error) {
      console.error('Error saving diet:', error)
      setSaveMessage({type: 'error', text: 'Erro de conexão. Tente novamente.'})
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="h-5 w-5" />
                <span>Criador de Dieta Avançado</span>
              </CardTitle>
              {patientData && (
                <p className="text-sm text-muted-foreground mt-1">
                  Para: {patientData.name} • {patientData.age} anos • {patientData.gender === 'male' ? 'Masculino' : 'Feminino'}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              {!isInsideConsultation && (
                <Button size="sm" onClick={saveDietPlan} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Plano'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mensagem de salvamento */}
          {saveMessage && (
            <Alert className={`mb-4 ${saveMessage.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {saveMessage.text}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Resumo rápido das metas vs atual */}
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(nutritionProgress).map(([nutrient, data]) => (
              <div key={nutrient} className="text-center">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{nutrient}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.current.toFixed(0)}/{data.target}
                  </span>
                </div>
                <Progress 
                  value={data.percentage} 
                  className="h-2"
                />
                <Badge 
                  variant={data.status === 'good' ? 'default' : 'destructive'} 
                  className="text-xs mt-1"
                >
                  {data.percentage.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Refeições */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuração de Refeições</span>
              <Badge variant="outline" className="ml-2">
                {getActiveMealCount()} refeições
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMealConfig(!showMealConfig)}
            >
              {showMealConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showMealConfig && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecione quais refeições farão parte da dieta do paciente. Mínimo: 3 refeições.
              </p>
              <Button variant="outline" size="sm" onClick={resetMealConfig}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(mealLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`meal-${key}`}
                      checked={activeMeals[key]}
                      onChange={() => toggleMealActive(key)}
                      className="rounded"
                    />
                    <label htmlFor={`meal-${key}`} className="text-sm font-medium">
                      {label}
                    </label>
                  </div>
                  {activeMeals[key] && (
                    <div className="flex-1">
                      <input
                        type="time"
                        value={mealTimes[key]}
                        onChange={(e) => updateMealTime(key, e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Distribuição de calorias */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Distribuição Calórica por Refeição</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(idealDistribution).map(([key, calories]) => {
                  if (!activeMeals[key] || calories === 0) return null
                  
                  const percentage = Math.round((calories / dietPlan.targetNutrition.calories) * 100)
                  return (
                    <div key={key} className="text-center p-2 bg-white rounded border">
                      <div className="text-xs text-muted-foreground">{mealLabels[key as keyof typeof mealLabels]}</div>
                      <div className="font-semibold text-blue-700">{calories} kcal</div>
                      <div className="text-xs text-blue-600">{percentage}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Distribuição Calórica Inteligente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sliders className="h-5 w-5" />
              <span>Distribuição Calórica Inteligente</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            >
              {showAdvancedConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>
            Configure a distribuição calórica com perfis profissionais baseados em evidências científicas.
          </CardDescription>
        </CardHeader>
        {showAdvancedConfig && (
          <CardContent className="space-y-6">
            {/* Seletor de Perfil */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <h4 className="font-medium">Perfis Profissionais</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(distributionProfiles).map(([key, profile]) => {
                  if (key === 'default') return null
                  return (
                    <div
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        distributionProfile === key
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                      onClick={() => setDistributionProfile(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{profile.name}</h5>
                          <p className="text-xs text-muted-foreground">{profile.description}</p>
                        </div>
                        <input
                          type="radio"
                          checked={distributionProfile === key}
                          onChange={() => setDistributionProfile(key)}
                          className="text-primary"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Personalização Manual */}
            {distributionProfile === 'custom' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ajuste Manual</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={autoBalanceDistribution}>
                      Distribuir Igualmente
                    </Button>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                      calculateCustomTotal() === 100 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Total: {calculateCustomTotal()}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(mealLabels)
                    .filter(([key]) => activeMeals[key])
                    .map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">{label}</label>
                          <span className="text-sm text-primary">
                            {customDistribution[key] || 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={customDistribution[key] || 0}
                          onChange={(e) => updateCustomDistribution(key, parseInt(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <div className="text-xs text-muted-foreground text-center">
                          {Math.round(dietPlan.targetNutrition.calories * (customDistribution[key] || 0) / 100)} kcal
                        </div>
                      </div>
                    ))}
                </div>

                {calculateCustomTotal() !== 100 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-100 border border-red-300 rounded">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      O total deve somar 100%. Faltam/sobram {100 - calculateCustomTotal()}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preview da Distribuição Atual */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Preview da Distribuição Atual</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(idealDistribution).map(([key, calories]) => {
                  if (!activeMeals[key] || calories === 0) return null
                  
                  const percentage = Math.round((calories / dietPlan.targetNutrition.calories) * 100)
                  return (
                    <div key={key} className="text-center p-2 bg-background rounded border">
                      <div className="text-xs text-muted-foreground">{mealLabels[key as keyof typeof mealLabels]}</div>
                      <div className="font-semibold">{calories} kcal</div>
                      <div className="text-xs text-primary">{percentage}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="creator" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Criador</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Análise</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Criador */}
        <TabsContent value="creator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Busca de alimentos */}
            <div>
              <TacoFoodSearchAdvanced
                onFoodSelect={addFoodToMeal}
                selectedMealType={selectedMeal}
                nutritionalTarget={dietPlan.targetNutrition}
                currentMealNutrition={mealNutrition[selectedMeal]}
              />
            </div>

            {/* Plano de refeições */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Plano de Refeições</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Seletor de refeição */}
                  <div className={`grid gap-2 mb-6 ${getActiveMealCount() <= 3 ? 'grid-cols-3' : getActiveMealCount() <= 4 ? 'grid-cols-4' : getActiveMealCount() <= 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                    {Object.entries(mealLabels)
                      .filter(([key]) => activeMeals[key])
                      .map(([key, label]) => {
                        const mealItems = getMealItems(key as keyof typeof mealLabels)
                        const nutrition = mealNutrition[key]
                        const balance = getMealBalance(key as keyof typeof mealLabels)
                        
                        return (
                          <Button
                            key={key}
                            variant={selectedMeal === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedMeal(key as keyof typeof mealLabels)}
                            className="flex flex-col h-auto p-3"
                          >
                            <span className="font-medium text-xs">{label}</span>
                            <span className="text-xs opacity-70">
                              {mealTimes[key]} • {nutrition.calories.toFixed(0)} kcal
                            </span>
                            {!balance.isBalanced && mealItems.length > 0 && (
                              <AlertTriangle className="h-3 w-3 text-yellow-500 mt-1" />
                            )}
                            {balance.isBalanced && mealItems.length > 0 && (
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                            )}
                          </Button>
                        )
                      })}
                  </div>

                  {/* Itens da refeição selecionada */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">
                        {mealLabels[selectedMeal]}
                      </h4>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {mealNutrition[selectedMeal].calories.toFixed(0)} kcal
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Meta: {idealDistribution[selectedMeal as keyof typeof idealDistribution]} kcal
                        </Badge>
                      </div>
                    </div>

                    {/* Status da refeição */}
                    {(() => {
                      const balance = getMealBalance(selectedMeal)
                      const suggestions = getMealSuggestions(selectedMeal)
                      
                      return (
                        <>
                          {!balance.isBalanced && balance.issues.length > 0 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Atenção:</strong> {balance.issues.join(', ')}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {suggestions.length > 0 && (
                            <Alert>
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Sugestões:</strong> {suggestions.join(' • ')}
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      )
                    })()}

                    {/* Lista de alimentos */}
                    <div className="space-y-3">
                      {getMealItems(selectedMeal).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum alimento adicionado</p>
                          <p className="text-xs">Use a busca ao lado para adicionar alimentos</p>
                        </div>
                      ) : (
                        getMealItems(selectedMeal).map((item) => {
                          const portion = calculateFoodPortion(item.food, item.quantity)
                          
                          return (
                            <Card key={item.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium">{item.food.nome}</h5>
                                  <p className="text-sm text-muted-foreground">{item.food.categoria}</p>
                                  
                                  <div className="flex items-center space-x-4 mt-2">
                                    {/* Controle de quantidade */}
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateFoodQuantity(item.id, item.quantity - 10)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateFoodQuantity(item.id, Number(e.target.value))}
                                        className="w-16 text-center text-sm"
                                        min="0"
                                      />
                                      <span className="text-sm">g</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateFoodQuantity(item.id, item.quantity + 10)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Informações nutricionais da porção */}
                                  <div className="flex space-x-3 mt-3">
                                    <Badge variant="secondary" className="text-xs">
                                      <Zap className="h-3 w-3 mr-1" />
                                      {portion.calories.toFixed(0)} kcal
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <Beef className="h-3 w-3 mr-1" />
                                      {portion.protein.toFixed(1)}g
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <Wheat className="h-3 w-3 mr-1" />
                                      {portion.carbs.toFixed(1)}g
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <Droplets className="h-3 w-3 mr-1" />
                                      {portion.fat.toFixed(1)}g
                                    </Badge>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFoodFromMeal(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Análise */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adequação nutricional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Adequação Nutricional</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dietAnalysis.adequacyAnalysis.slice(0, 8).map((analysis) => (
                    <div key={analysis.nutrient} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{analysis.nutrient}</span>
                          <span className="text-xs text-muted-foreground">
                            {analysis.value} / {analysis.rda}
                          </span>
                        </div>
                        <Progress value={Math.min(analysis.percentage, 100)} className="h-2 mt-1" />
                      </div>
                      <Badge 
                        variant={analysis.status === 'adequate' ? 'default' : 'destructive'}
                        className="ml-3 text-xs"
                      >
                        {analysis.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de qualidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Métricas de Qualidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {dietAnalysis.glycemicLoad.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Carga Glicêmica</div>
                    <Badge variant={dietAnalysis.glycemicLoad > 20 ? 'destructive' : 'default'} className="text-xs mt-1">
                      {dietAnalysis.glycemicLoad > 20 ? 'Alta' : dietAnalysis.glycemicLoad < 10 ? 'Baixa' : 'Moderada'}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {dietAnalysis.proteinQuality.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Qualidade Proteica</div>
                    <Badge variant={dietAnalysis.proteinQuality > 70 ? 'default' : 'destructive'} className="text-xs mt-1">
                      {dietAnalysis.proteinQuality > 70 ? 'Boa' : 'Baixa'}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {dietAnalysis.diversityScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Diversidade</div>
                    <Badge variant={dietAnalysis.diversityScore > 60 ? 'default' : 'destructive'} className="text-xs mt-1">
                      {dietAnalysis.diversityScore > 60 ? 'Alta' : 'Baixa'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Recomendações */}
                {dietAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Recomendações
                    </h4>
                    <div className="space-y-2">
                      {dietAnalysis.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <AlertDescription className="text-sm">
                            {recommendation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo por refeição */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Refeição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mealLabels)
                    .filter(([mealKey]) => activeMeals[mealKey])
                    .map(([mealKey, mealLabel]) => {
                      const nutrition = mealNutrition[mealKey]
                      const idealCal = idealDistribution[mealKey as keyof typeof idealDistribution]
                      const items = getMealItems(mealKey as keyof typeof mealLabels)
                      
                      return (
                        <div key={mealKey} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{mealLabel}</h5>
                            <p className="text-sm text-muted-foreground">
                              {mealTimes[mealKey]} • {items.length} {items.length === 1 ? 'alimento' : 'alimentos'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {nutrition.calories.toFixed(0)} / {idealCal} kcal
                            </div>
                            <div className="text-sm text-muted-foreground">
                              P: {nutrition.protein.toFixed(1)}g • 
                              C: {nutrition.carbs.toFixed(1)}g • 
                              G: {nutrition.fat.toFixed(1)}g
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Resumo total */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Total do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {totalNutrition.calories.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">kcal totais</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Meta: {dietPlan.targetNutrition.calories}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Proteína</span>
                      <span className="font-medium">
                        {totalNutrition.protein.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carboidratos</span>
                      <span className="font-medium">
                        {totalNutrition.carbs.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gorduras</span>
                      <span className="font-medium">
                        {totalNutrition.fat.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fibras</span>
                      <span className="font-medium">
                        {totalNutrition.fiber.toFixed(1)}g
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="mb-4" />

                {!isInsideConsultation && (
                  <div className="text-center">
                    <Button className="w-full" size="lg" onClick={saveDietPlan} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Salvando Plano...' : 'Salvar Plano Alimentar'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}