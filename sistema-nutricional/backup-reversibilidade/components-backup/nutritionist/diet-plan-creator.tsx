'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  Utensils,
  Clock,
  Share2,
  Save
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { formatEnergy, formatMacro } from '@/utils/format'

interface MealItem {
  id: string
  food: Alimento
  quantity: number // em gramas
  meal: 'cafe' | 'almoco' | 'lanche' | 'jantar'
}

interface DietPlan {
  name: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  meals: MealItem[]
}

interface NutritionalSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface DietPlanCreatorProps {
  targetNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export function DietPlanCreator({ targetNutrition }: DietPlanCreatorProps) {
  const { foods, searchFoodsSimple, calculatePortion } = useTaco()
  const [dietPlan, setDietPlan] = useState<DietPlan>({
    name: 'Novo Plano Alimentar',
    targetCalories: targetNutrition?.calories || 2000,
    targetProtein: targetNutrition?.protein || 150,
    targetCarbs: targetNutrition?.carbs || 250,
    targetFat: targetNutrition?.fat || 67,
    meals: []
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<'cafe' | 'almoco' | 'lanche' | 'jantar'>('cafe')

  const mealLabels = {
    cafe: 'Café da Manhã',
    almoco: 'Almoço',
    lanche: 'Lanche',
    jantar: 'Jantar'
  }

  const filteredFoods = searchFoodsSimple(searchTerm, 'Todos').slice(0, 10)

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

  const calculateMealNutrition = (mealType: keyof typeof mealLabels): NutritionalSummary => {
    const mealItems = getMealItems(mealType)
    
    return mealItems.reduce((total, item) => {
      const portion = calculatePortion(item.food, item.quantity)
      return {
        calories: total.calories + portion.energia_kcal,
        protein: total.protein + portion.proteina_g,
        carbs: total.carbs + portion.carboidrato_g,
        fat: total.fat + portion.lipidios_g,
        fiber: total.fiber + portion.fibra_alimentar_g
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  }

  const calculateTotalNutrition = (): NutritionalSummary => {
    return dietPlan.meals.reduce((total, item) => {
      const portion = calculatePortion(item.food, item.quantity)
      return {
        calories: total.calories + portion.energia_kcal,
        protein: total.protein + portion.proteina_g,
        carbs: total.carbs + portion.carboidrato_g,
        fat: total.fat + portion.lipidios_g,
        fiber: total.fiber + portion.fibra_alimentar_g
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  }

  const totalNutrition = calculateTotalNutrition()

  const getNutrientProgress = (current: number, target: number) => {
    const percentage = (current / target) * 100
    return {
      percentage: Math.min(percentage, 100),
      color: percentage < 80 ? 'bg-red-500' : percentage > 120 ? 'bg-yellow-500' : 'bg-green-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <span>Criador de Plano Alimentar</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar Plano
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Meta de Calorias</Label>
              <Input
                type="number"
                value={dietPlan.targetCalories}
                onChange={(e) => setDietPlan(prev => ({ ...prev, targetCalories: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meta de Proteína (g)</Label>
              <Input
                type="number"
                value={dietPlan.targetProtein}
                onChange={(e) => setDietPlan(prev => ({ ...prev, targetProtein: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meta de Carboidratos (g)</Label>
              <Input
                type="number"
                value={dietPlan.targetCarbs}
                onChange={(e) => setDietPlan(prev => ({ ...prev, targetCarbs: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meta de Gordura (g)</Label>
              <Input
                type="number"
                value={dietPlan.targetFat}
                onChange={(e) => setDietPlan(prev => ({ ...prev, targetFat: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Busca de Alimentos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Adicionar Alimentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Refeição de Destino</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(mealLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedMeal === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMeal(key as keyof typeof mealLabels)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Buscar Alimentos</Label>
                <Input
                  placeholder="Digite o nome do alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{food.nome}</p>
                      <p className="text-xs text-muted-foreground">{food.categoria}</p>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatEnergy(food.energia_kcal)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatMacro(food.proteina_g)} prot
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addFoodToMeal(food)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plano de Refeições */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Plano de Refeições</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(mealLabels).map(([mealType, mealLabel]) => {
                  const mealItems = getMealItems(mealType as keyof typeof mealLabels)
                  const mealNutrition = calculateMealNutrition(mealType as keyof typeof mealLabels)

                  return (
                    <div key={mealType}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{mealLabel}</h4>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {mealNutrition.calories.toFixed(0)} kcal
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {mealNutrition.protein.toFixed(1)}g prot
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {mealItems.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-sm">Nenhum alimento adicionado</p>
                          </div>
                        ) : (
                          mealItems.map((item) => {
                            const portion = calculatePortion(item.food, item.quantity)
                            return (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">{item.food.nome}</p>
                                  <div className="flex items-center space-x-4 mt-1">
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
                                        className="w-16 text-center"
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
                                    <div className="flex space-x-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {portion.energia_kcal.toFixed(0)} kcal
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {portion.proteina_g.toFixed(1)}g
                                      </Badge>
                                    </div>
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
                            )
                          })
                        )}
                      </div>
                      {mealType !== 'jantar' && <Separator />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumo Nutricional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Resumo Nutricional</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Calorias */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Calorias</span>
                <span className="text-sm">
                  {totalNutrition.calories.toFixed(0)} / {dietPlan.targetCalories}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getNutrientProgress(totalNutrition.calories, dietPlan.targetCalories).color}`}
                  style={{ width: `${getNutrientProgress(totalNutrition.calories, dietPlan.targetCalories).percentage}%` }}
                />
              </div>
            </div>

            {/* Proteína */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Proteína</span>
                <span className="text-sm">
                  {totalNutrition.protein.toFixed(1)}g / {dietPlan.targetProtein}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getNutrientProgress(totalNutrition.protein, dietPlan.targetProtein).color}`}
                  style={{ width: `${getNutrientProgress(totalNutrition.protein, dietPlan.targetProtein).percentage}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Carboidratos</span>
                <span className="text-sm">
                  {totalNutrition.carbs.toFixed(1)}g / {dietPlan.targetCarbs}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getNutrientProgress(totalNutrition.carbs, dietPlan.targetCarbs).color}`}
                  style={{ width: `${getNutrientProgress(totalNutrition.carbs, dietPlan.targetCarbs).percentage}%` }}
                />
              </div>
            </div>

            {/* Gordura */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Gordura</span>
                <span className="text-sm">
                  {totalNutrition.fat.toFixed(1)}g / {dietPlan.targetFat}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getNutrientProgress(totalNutrition.fat, dietPlan.targetFat).color}`}
                  style={{ width: `${getNutrientProgress(totalNutrition.fat, dietPlan.targetFat).percentage}%` }}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{totalNutrition.calories.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Calorias Totais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalNutrition.protein.toFixed(1)}g</p>
              <p className="text-sm text-muted-foreground">Proteína</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{totalNutrition.carbs.toFixed(1)}g</p>
              <p className="text-sm text-muted-foreground">Carboidratos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalNutrition.fat.toFixed(1)}g</p>
              <p className="text-sm text-muted-foreground">Gordura</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}