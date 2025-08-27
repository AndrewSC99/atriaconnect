'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Heart,
  Shield,
  Brain,
  Plus,
  Minus,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Alimento } from '@/hooks/useTaco'
import { 
  NutritionalSummary, 
  FoodPortion, 
  analyzeMeal,
  suggestSubstitutions 
} from '@/utils/nutritionalCalculations'

interface SmartSuggestionsProps {
  currentMeals: FoodPortion[]
  targetNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  currentNutrition: NutritionalSummary
  patientData?: {
    age: number
    gender: 'male' | 'female'
    weight: number
    height: number
    medicalConditions?: string[]
    allergies?: string[]
  }
  availableFoods: Alimento[]
  onFoodSuggestionSelect: (food: Alimento, quantity: number, action: 'add' | 'replace', originalFood?: Alimento) => void
}

interface Suggestion {
  id: string
  type: 'add' | 'replace' | 'remove' | 'adjust'
  priority: 'high' | 'medium' | 'low'
  category: 'nutrition' | 'balance' | 'health' | 'optimization'
  title: string
  description: string
  reason: string
  targetFood?: Alimento
  suggestedFood?: Alimento
  suggestedQuantity?: number
  originalFood?: Alimento
  nutritionalImpact: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  healthBenefits?: string[]
}

export function SmartSuggestions({
  currentMeals,
  targetNutrition,
  currentNutrition,
  patientData,
  availableFoods,
  onFoodSuggestionSelect
}: SmartSuggestionsProps) {
  
  // Analisar a dieta atual
  const analysis = useMemo(() => 
    analyzeMeal(currentMeals, patientData?.gender || 'female'), 
    [currentMeals, patientData?.gender]
  )

  // Gerar sugestões inteligentes
  const suggestions = useMemo(() => {
    const suggestions: Suggestion[] = []
    
    // Calcular diferenças nutricionais
    const caloriesDiff = targetNutrition.calories - currentNutrition.calories
    const proteinDiff = targetNutrition.protein - currentNutrition.protein
    const carbsDiff = targetNutrition.carbs - currentNutrition.carbs
    const fatDiff = targetNutrition.fat - currentNutrition.fat

    // 1. Sugestões para atingir metas calóricas
    if (Math.abs(caloriesDiff) > 50) {
      if (caloriesDiff > 0) {
        // Precisa adicionar calorias
        const suitableFoods = availableFoods
          .filter(food => food.energia_kcal > 200 && food.energia_kcal < caloriesDiff * 1.5)
          .sort((a, b) => {
            // Priorizar alimentos balanceados
            const ratioA = (a.proteina_g + a.fibra_alimentar_g) / a.energia_kcal
            const ratioB = (b.proteina_g + b.fibra_alimentar_g) / b.energia_kcal
            return ratioB - ratioA
          })
          .slice(0, 3)

        suitableFoods.forEach((food, index) => {
          const suggestedQuantity = Math.round((caloriesDiff / food.energia_kcal) * 100)
          
          suggestions.push({
            id: `add-calories-${index}`,
            type: 'add',
            priority: index === 0 ? 'high' : 'medium',
            category: 'nutrition',
            title: `Adicionar ${food.nome}`,
            description: `Adicione ${suggestedQuantity}g para completar ${caloriesDiff.toFixed(0)} kcal restantes`,
            reason: 'Meta calórica não atingida',
            suggestedFood: food,
            suggestedQuantity,
            nutritionalImpact: {
              calories: food.energia_kcal * (suggestedQuantity / 100),
              protein: food.proteina_g * (suggestedQuantity / 100),
              carbs: food.carboidrato_g * (suggestedQuantity / 100),
              fat: food.lipidios_g * (suggestedQuantity / 100)
            },
            healthBenefits: getHealthBenefits(food)
          })
        })
      } else {
        // Precisa reduzir calorias
        const highCalorieFoods = currentMeals
          .filter(meal => meal.food.energia_kcal > 200)
          .sort((a, b) => (b.food.energia_kcal * b.quantity) - (a.food.energia_kcal * a.quantity))
          .slice(0, 2)

        highCalorieFoods.forEach((meal, index) => {
          const reductionNeeded = Math.abs(caloriesDiff)
          const currentCalories = meal.food.energia_kcal * (meal.quantity / 100)
          const newQuantity = Math.max(50, meal.quantity - (reductionNeeded / meal.food.energia_kcal * 100))
          
          suggestions.push({
            id: `reduce-calories-${index}`,
            type: 'adjust',
            priority: 'high',
            category: 'nutrition',
            title: `Reduzir ${meal.food.nome}`,
            description: `Reduza para ${newQuantity.toFixed(0)}g (${(meal.quantity - newQuantity).toFixed(0)}g menos)`,
            reason: 'Excesso calórico detectado',
            targetFood: meal.food,
            suggestedQuantity: newQuantity,
            nutritionalImpact: {
              calories: -(currentCalories - (meal.food.energia_kcal * (newQuantity / 100))),
              protein: -(meal.food.proteina_g * ((meal.quantity - newQuantity) / 100)),
              carbs: -(meal.food.carboidrato_g * ((meal.quantity - newQuantity) / 100)),
              fat: -(meal.food.lipidios_g * ((meal.quantity - newQuantity) / 100))
            }
          })
        })
      }
    }

    // 2. Sugestões para melhorar distribuição de macronutrientes
    if (proteinDiff > 10) {
      const highProteinFoods = availableFoods
        .filter(food => food.proteina_g > 20)
        .sort((a, b) => b.proteina_g - a.proteina_g)
        .slice(0, 3)

      highProteinFoods.forEach((food, index) => {
        const suggestedQuantity = Math.round((proteinDiff / food.proteina_g) * 100)
        
        suggestions.push({
          id: `add-protein-${index}`,
          type: 'add',
          priority: index === 0 ? 'high' : 'medium',
          category: 'nutrition',
          title: `Aumentar proteína com ${food.nome}`,
          description: `Adicione ${suggestedQuantity}g para completar ${proteinDiff.toFixed(1)}g de proteína`,
          reason: 'Meta de proteína não atingida',
          suggestedFood: food,
          suggestedQuantity,
          nutritionalImpact: {
            calories: food.energia_kcal * (suggestedQuantity / 100),
            protein: food.proteina_g * (suggestedQuantity / 100),
            carbs: food.carboidrato_g * (suggestedQuantity / 100),
            fat: food.lipidios_g * (suggestedQuantity / 100)
          },
          healthBenefits: ['Manutenção muscular', 'Saciedade', 'Recuperação']
        })
      })
    }

    // 3. Sugestões baseadas em deficiências nutricionais
    const deficiencies = analysis.adequacyAnalysis.filter(a => a.status === 'deficient')
    deficiencies.slice(0, 3).forEach((deficiency, index) => {
      const nutrientFoods = getNutrientRichFoods(deficiency.nutrient, availableFoods)
      
      if (nutrientFoods.length > 0) {
        const bestFood = nutrientFoods[0]
        
        suggestions.push({
          id: `fix-deficiency-${index}`,
          type: 'add',
          priority: 'high',
          category: 'health',
          title: `Corrigir deficiência de ${deficiency.nutrient}`,
          description: `Adicione ${bestFood.nome} para aumentar ${deficiency.nutrient}`,
          reason: `Baixo consumo de ${deficiency.nutrient} (${deficiency.percentage.toFixed(0)}% da RDA)`,
          suggestedFood: bestFood,
          suggestedQuantity: 100,
          nutritionalImpact: {
            calories: bestFood.energia_kcal,
            protein: bestFood.proteina_g,
            carbs: bestFood.carboidrato_g,
            fat: bestFood.lipidios_g
          },
          healthBenefits: getDeficiencyBenefits(deficiency.nutrient)
        })
      }
    })

    // 4. Sugestões de substituições para melhorar qualidade nutricional
    const lowQualityFoods = currentMeals.filter(meal => 
      meal.food.energia_kcal > 300 && 
      meal.food.proteina_g < 10 && 
      meal.food.fibra_alimentar_g < 3
    )

    lowQualityFoods.slice(0, 2).forEach((meal, index) => {
      const betterAlternatives = availableFoods
        .filter(food => 
          food.categoria === meal.food.categoria &&
          food.proteina_g > meal.food.proteina_g &&
          food.fibra_alimentar_g > meal.food.fibra_alimentar_g
        )
        .sort((a, b) => 
          (b.proteina_g + b.fibra_alimentar_g) - (a.proteina_g + a.fibra_alimentar_g)
        )

      if (betterAlternatives.length > 0) {
        const alternative = betterAlternatives[0]
        
        suggestions.push({
          id: `substitute-quality-${index}`,
          type: 'replace',
          priority: 'medium',
          category: 'optimization',
          title: `Substituir ${meal.food.nome}`,
          description: `Trocar por ${alternative.nome} para melhor perfil nutricional`,
          reason: 'Melhoria da qualidade nutricional',
          originalFood: meal.food,
          suggestedFood: alternative,
          suggestedQuantity: meal.quantity,
          nutritionalImpact: {
            calories: (alternative.energia_kcal - meal.food.energia_kcal) * (meal.quantity / 100),
            protein: (alternative.proteina_g - meal.food.proteina_g) * (meal.quantity / 100),
            carbs: (alternative.carboidrato_g - meal.food.carboidrato_g) * (meal.quantity / 100),
            fat: (alternative.lipidios_g - meal.food.lipidios_g) * (meal.quantity / 100)
          },
          healthBenefits: ['Mais proteína', 'Mais fibras', 'Melhor saciedade']
        })
      }
    })

    // 5. Sugestões baseadas em condições médicas (se disponível)
    if (patientData?.medicalConditions) {
      patientData.medicalConditions.forEach(condition => {
        const conditionSuggestions = getConditionSpecificSuggestions(condition, currentMeals, availableFoods)
        suggestions.push(...conditionSuggestions)
      })
    }

    // 6. Sugestões para melhorar diversidade
    if (analysis.diversityScore < 60) {
      const usedCategories = new Set(currentMeals.map(meal => meal.food.categoria))
      const missingCategories = availableFoods
        .map(food => food.categoria)
        .filter(cat => !usedCategories.has(cat))
        .slice(0, 2)

      missingCategories.forEach((category, index) => {
        const categoryFoods = availableFoods
          .filter(food => food.categoria === category)
          .sort((a, b) => (b.proteina_g + b.fibra_alimentar_g) - (a.proteina_g + a.fibra_alimentar_g))

        if (categoryFoods.length > 0) {
          const suggestedFood = categoryFoods[0]
          
          suggestions.push({
            id: `diversity-${index}`,
            type: 'add',
            priority: 'low',
            category: 'balance',
            title: `Adicionar variedade: ${suggestedFood.nome}`,
            description: `Inclua ${category.toLowerCase()} para maior diversidade`,
            reason: `Baixa diversidade alimentar (${analysis.diversityScore.toFixed(0)}%)`,
            suggestedFood,
            suggestedQuantity: 80,
            nutritionalImpact: {
              calories: suggestedFood.energia_kcal * 0.8,
              protein: suggestedFood.proteina_g * 0.8,
              carbs: suggestedFood.carboidrato_g * 0.8,
              fat: suggestedFood.lipidios_g * 0.8
            },
            healthBenefits: ['Maior variedade de nutrientes', 'Melhor adesão à dieta']
          })
        }
      })
    }

    // Ordenar sugestões por prioridade e impacto
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 8) // Limitar a 8 sugestões principais

  }, [currentMeals, targetNutrition, currentNutrition, analysis, availableFoods, patientData])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return Target
      case 'balance': return TrendingUp
      case 'health': return Heart
      case 'optimization': return Sparkles
      default: return Lightbulb
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'add': return Plus
      case 'remove': return Minus
      case 'replace': return ArrowRight
      case 'adjust': return TrendingUp
      default: return Lightbulb
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Sugestões Inteligentes</span>
            <Badge variant="secondary">{suggestions.length} sugestões</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-700">Dieta bem balanceada!</p>
              <p className="text-sm text-muted-foreground">
                Não há sugestões de melhoria no momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const CategoryIcon = getCategoryIcon(suggestion.category)
                const ActionIcon = getActionIcon(suggestion.type)
                
                return (
                  <Alert key={suggestion.id} className={getPriorityColor(suggestion.priority)}>
                    <div className="flex items-start space-x-3">
                      <CategoryIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <AlertDescription className="text-sm">
                          {suggestion.description}
                        </AlertDescription>
                        
                        <div className="text-xs text-muted-foreground">
                          <strong>Motivo:</strong> {suggestion.reason}
                        </div>

                        {/* Impacto nutricional */}
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            {suggestion.nutritionalImpact.calories > 0 ? '+' : ''}
                            {suggestion.nutritionalImpact.calories.toFixed(0)} kcal
                          </span>
                          <span className="flex items-center">
                            <Beef className="h-3 w-3 mr-1" />
                            {suggestion.nutritionalImpact.protein > 0 ? '+' : ''}
                            {suggestion.nutritionalImpact.protein.toFixed(1)}g prot
                          </span>
                          <span className="flex items-center">
                            <Wheat className="h-3 w-3 mr-1" />
                            {suggestion.nutritionalImpact.carbs > 0 ? '+' : ''}
                            {suggestion.nutritionalImpact.carbs.toFixed(1)}g carb
                          </span>
                          <span className="flex items-center">
                            <Droplets className="h-3 w-3 mr-1" />
                            {suggestion.nutritionalImpact.fat > 0 ? '+' : ''}
                            {suggestion.nutritionalImpact.fat.toFixed(1)}g gord
                          </span>
                        </div>

                        {/* Benefícios para a saúde */}
                        {suggestion.healthBenefits && suggestion.healthBenefits.length > 0 && (
                          <div className="text-xs">
                            <strong>Benefícios:</strong> {suggestion.healthBenefits.join(' • ')}
                          </div>
                        )}

                        {/* Ação */}
                        {suggestion.suggestedFood && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => onFoodSuggestionSelect(
                              suggestion.suggestedFood!,
                              suggestion.suggestedQuantity || 100,
                              suggestion.type as 'add' | 'replace',
                              suggestion.originalFood
                            )}
                          >
                            <ActionIcon className="h-3 w-3 mr-2" />
                            {suggestion.type === 'add' ? 'Adicionar' :
                             suggestion.type === 'replace' ? 'Substituir' :
                             suggestion.type === 'adjust' ? 'Ajustar' : 'Aplicar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Funções auxiliares
function getHealthBenefits(food: Alimento): string[] {
  const benefits: string[] = []
  
  if (food.proteina_g > 15) benefits.push('Rico em proteína')
  if (food.fibra_alimentar_g > 5) benefits.push('Rico em fibras')
  if (food.ferro_mg > 2) benefits.push('Fonte de ferro')
  if (food.calcio_mg > 100) benefits.push('Fonte de cálcio')
  if (food.vitamina_c_mg > 20) benefits.push('Rico em vitamina C')
  if (food.energia_kcal < 100) benefits.push('Baixas calorias')
  
  return benefits
}

function getNutrientRichFoods(nutrient: string, foods: Alimento[]): Alimento[] {
  const nutrientMapping: {[key: string]: keyof Alimento} = {
    'Ferro': 'ferro_mg',
    'Cálcio': 'calcio_mg',
    'Vitamina C': 'vitamina_c_mg',
    'Proteína': 'proteina_g',
    'Fibra': 'fibra_alimentar_g'
  }
  
  const key = nutrientMapping[nutrient]
  if (!key) return []
  
  return foods
    .filter(food => (food[key] as number) > 0)
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, 3)
}

function getDeficiencyBenefits(nutrient: string): string[] {
  const benefits: {[key: string]: string[]} = {
    'Ferro': ['Prevenção de anemia', 'Mais energia', 'Melhor oxigenação'],
    'Cálcio': ['Ossos fortes', 'Dentes saudáveis', 'Função muscular'],
    'Vitamina C': ['Imunidade', 'Absorção de ferro', 'Antioxidante'],
    'Proteína': ['Massa muscular', 'Saciedade', 'Recuperação'],
    'Fibra': ['Digestão', 'Saciedade', 'Controle glicêmico']
  }
  
  return benefits[nutrient] || ['Melhoria nutricional']
}

function getConditionSpecificSuggestions(
  condition: string, 
  currentMeals: FoodPortion[], 
  availableFoods: Alimento[]
): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  // Simplificado - em produção seria mais sofisticado
  if (condition.toLowerCase().includes('diabetes')) {
    // Sugerir alimentos de baixo índice glicêmico
    const lowGIFoods = availableFoods.filter(food => 
      food.categoria === 'Verduras, hortaliças e derivados' ||
      food.fibra_alimentar_g > 5
    )
    
    if (lowGIFoods.length > 0) {
      suggestions.push({
        id: 'diabetes-suggestion',
        type: 'add',
        priority: 'high',
        category: 'health',
        title: 'Adicionar alimentos de baixo IG',
        description: `Inclua ${lowGIFoods[0].nome} para melhor controle glicêmico`,
        reason: 'Manejo do diabetes',
        suggestedFood: lowGIFoods[0],
        suggestedQuantity: 100,
        nutritionalImpact: {
          calories: lowGIFoods[0].energia_kcal,
          protein: lowGIFoods[0].proteina_g,
          carbs: lowGIFoods[0].carboidrato_g,
          fat: lowGIFoods[0].lipidios_g
        },
        healthBenefits: ['Controle glicêmico', 'Mais fibras']
      })
    }
  }
  
  return suggestions
}