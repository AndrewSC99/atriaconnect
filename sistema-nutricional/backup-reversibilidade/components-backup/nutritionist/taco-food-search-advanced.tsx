'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter,
  Clock,
  Star,
  TrendingUp,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Plus,
  Sparkles,
  ChefHat,
  Target,
  History
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'

interface NutritionalFilter {
  calories?: { min?: number; max?: number }
  protein?: { min?: number; max?: number }
  carbs?: { min?: number; max?: number }
  fat?: { min?: number; max?: number }
  fiber?: { min?: number; max?: number }
  sodium?: { min?: number; max?: number }
}

interface TacoFoodSearchAdvancedProps {
  onFoodSelect: (food: Alimento, quantity?: number) => void
  selectedMealType?: string
  nutritionalTarget?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  currentMealNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export function TacoFoodSearchAdvanced({ 
  onFoodSelect, 
  selectedMealType = 'cafe',
  nutritionalTarget,
  currentMealNutrition
}: TacoFoodSearchAdvancedProps) {
  const { 
    foods, 
    categories, 
    searchFoodsSimple, 
    favorites, 
    toggleFavorite, 
    addRecentSearch, 
    recentSearches,
    calculatePortion,
    findSimilarFoods
  } = useTaco()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [activeFilter, setActiveFilter] = useState<'recent' | 'favorites' | 'smart' | 'all'>('all')
  const [nutritionalFilters, setNutritionalFilters] = useState<NutritionalFilter>({})
  const [sortBy, setSortBy] = useState<'nome' | 'energia_kcal' | 'proteina_g' | 'relevance'>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  // Simular histórico de uso (em produção viria do backend)
  const [usageHistory] = useState<{[key: number]: number}>({
    1: 25, 2: 18, 3: 12, 4: 10, 5: 8 // IDs dos alimentos mais usados
  })

  // Calcular alimentos restantes para atingir meta nutricional
  const remainingNutrition = useMemo(() => {
    if (!nutritionalTarget || !currentMealNutrition) return null
    
    return {
      calories: Math.max(0, nutritionalTarget.calories - currentMealNutrition.calories),
      protein: Math.max(0, nutritionalTarget.protein - currentMealNutrition.protein),
      carbs: Math.max(0, nutritionalTarget.carbs - currentMealNutrition.carbs),
      fat: Math.max(0, nutritionalTarget.fat - currentMealNutrition.fat)
    }
  }, [nutritionalTarget, currentMealNutrition])

  // Filtrar e ordenar alimentos
  const filteredFoods = useMemo(() => {
    let result = searchTerm 
      ? searchFoodsSimple(searchTerm, selectedCategory, 'nome')
      : foods.filter(food => selectedCategory === 'Todos' || food.categoria === selectedCategory)

    // Aplicar filtros nutricionais
    Object.entries(nutritionalFilters).forEach(([nutrient, range]) => {
      if (range.min !== undefined || range.max !== undefined) {
        result = result.filter(food => {
          const value = food[nutrient as keyof Alimento] as number
          if (range.min !== undefined && value < range.min) return false
          if (range.max !== undefined && value > range.max) return false
          return true
        })
      }
    })

    // Aplicar filtros especiais
    switch (activeFilter) {
      case 'recent':
        result = result.filter(food => 
          recentSearches.some(term => 
            food.nome.toLowerCase().includes(term.toLowerCase())
          )
        )
        break
      case 'favorites':
        result = result.filter(food => favorites.includes(food.id))
        break
      case 'smart':
        if (remainingNutrition) {
          // Priorizar alimentos que se aproximam da meta restante
          result = result.filter(food => {
            const ratio = food.energia_kcal / (remainingNutrition.calories || 1)
            return ratio >= 0.1 && ratio <= 2 // Entre 10% e 200% da meta restante
          })
        }
        break
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return a.nome.localeCompare(b.nome)
        case 'energia_kcal':
          return b.energia_kcal - a.energia_kcal
        case 'proteina_g':
          return b.proteina_g - a.proteina_g
        case 'relevance':
        default:
          // Ordenação por relevância considerando múltiplos fatores
          const usageA = usageHistory[a.id] || 0
          const usageB = usageHistory[b.id] || 0
          const favoriteA = favorites.includes(a.id) ? 10 : 0
          const favoriteB = favorites.includes(b.id) ? 10 : 0
          
          let smartScoreA = 0
          let smartScoreB = 0
          
          if (remainingNutrition) {
            // Score baseado em quão bem o alimento se encaixa nas necessidades
            const targetCalories = remainingNutrition.calories || 1
            const ratioA = Math.abs(a.energia_kcal - targetCalories) / targetCalories
            const ratioB = Math.abs(b.energia_kcal - targetCalories) / targetCalories
            smartScoreA = Math.max(0, 5 - ratioA * 5) // 0-5 pontos baseado na proximidade
            smartScoreB = Math.max(0, 5 - ratioB * 5)
          }
          
          const scoreA = usageA + favoriteA + smartScoreA
          const scoreB = usageB + favoriteB + smartScoreB
          
          return scoreB - scoreA
      }
    })

    return result.slice(0, 50) // Limitar a 50 resultados para performance
  }, [searchTerm, selectedCategory, nutritionalFilters, activeFilter, sortBy, foods, favorites, recentSearches, remainingNutrition, usageHistory])

  // Sugestões inteligentes baseadas no tipo de refeição
  const mealTypeSuggestions = useMemo(() => {
    const suggestions: {[key: string]: string[]} = {
      cafe: ['aveia', 'banana', 'leite', 'pão', 'ovo', 'café'],
      almoco: ['arroz', 'feijão', 'frango', 'carne', 'salada', 'legumes'],
      lanche: ['fruta', 'iogurte', 'castanha', 'biscoito', 'suco'],
      jantar: ['peixe', 'legumes', 'sopa', 'salada', 'arroz integral']
    }
    
    return suggestions[selectedMealType] || []
  }, [selectedMealType])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length > 2) {
      addRecentSearch(term)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion)
    handleSearch(suggestion)
  }

  const updateNutritionalFilter = (nutrient: string, field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    setNutritionalFilters(prev => ({
      ...prev,
      [nutrient]: {
        ...prev[nutrient as keyof NutritionalFilter],
        [field]: numValue
      }
    }))
  }

  const clearFilters = () => {
    setNutritionalFilters({})
    setSelectedCategory('Todos')
    setActiveFilter('all')
  }

  const getNutrientStatus = (food: Alimento) => {
    if (!remainingNutrition) return null

    const badges = []
    
    // Verificar se o alimento é rico em nutrientes que faltam
    if (remainingNutrition.protein > 10 && food.proteina_g > 15) {
      badges.push({ text: 'Rico em Proteína', color: 'bg-blue-100 text-blue-800' })
    }
    
    if (remainingNutrition.calories > 200 && food.energia_kcal > 300) {
      badges.push({ text: 'Alto em Energia', color: 'bg-orange-100 text-orange-800' })
    }
    
    if (food.fibra_alimentar_g > 5) {
      badges.push({ text: 'Rico em Fibras', color: 'bg-green-100 text-green-800' })
    }
    
    if (food.ferro_mg > 2) {
      badges.push({ text: 'Fonte de Ferro', color: 'bg-red-100 text-red-800' })
    }

    return badges
  }

  return (
    <div className="space-y-4">
      {/* Header com busca principal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Busca Inteligente TACO</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredFoods.length} alimentos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do alimento..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sugestões rápidas baseadas no tipo de refeição */}
          {mealTypeSuggestions.length > 0 && !searchTerm && (
            <div>
              <Label className="text-sm font-medium">
                Sugestões para {selectedMealType === 'cafe' ? 'Café da Manhã' : 
                               selectedMealType === 'almoco' ? 'Almoço' :
                               selectedMealType === 'lanche' ? 'Lanche' : 'Jantar'}:
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mealTypeSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="h-8"
                  >
                    <ChefHat className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Filtros rápidos */}
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="smart" className="text-xs" disabled={!remainingNutrition}>
                <Target className="h-3 w-3 mr-1" />
                Inteligente
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                Recentes
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Informações da meta nutricional */}
          {remainingNutrition && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Meta Restante:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-blue-700">{remainingNutrition.calories.toFixed(0)}</div>
                  <div className="text-blue-600">kcal</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-700">{remainingNutrition.protein.toFixed(1)}g</div>
                  <div className="text-blue-600">prot</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-700">{remainingNutrition.carbs.toFixed(1)}g</div>
                  <div className="text-blue-600">carb</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-700">{remainingNutrition.fat.toFixed(1)}g</div>
                  <div className="text-blue-600">gord</div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros avançados (colapsível) */}
          {showFilters && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Filtros Nutricionais</Label>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Filtro de Calorias */}
                <div>
                  <Label className="text-sm">Calorias (por 100g)</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      placeholder="Min"
                      type="number"
                      onChange={(e) => updateNutritionalFilter('energia_kcal', 'min', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      onChange={(e) => updateNutritionalFilter('energia_kcal', 'max', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Filtro de Proteína */}
                <div>
                  <Label className="text-sm">Proteína (g)</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      placeholder="Min"
                      type="number"
                      onChange={(e) => updateNutritionalFilter('proteina_g', 'min', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      onChange={(e) => updateNutritionalFilter('proteina_g', 'max', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Filtro por categoria */}
              <div>
                <Label className="text-sm">Categoria</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Todos', ...categories.map(cat => cat.nome)].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-8 text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div>
                <Label className="text-sm">Ordenar por</Label>
                <div className="flex space-x-2 mt-2">
                  {[
                    { value: 'relevance', label: 'Relevância', icon: TrendingUp },
                    { value: 'nome', label: 'Nome', icon: Filter },
                    { value: 'energia_kcal', label: 'Calorias', icon: Zap },
                    { value: 'proteina_g', label: 'Proteína', icon: Beef }
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={sortBy === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(value as any)}
                      className="h-8 text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de resultados */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFoods.map((food) => {
          const nutritionBadges = getNutrientStatus(food)
          const isFavorite = favorites.includes(food.id)
          const usageCount = usageHistory[food.id] || 0

          return (
            <Card key={food.id} className="group cursor-pointer hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</h4>
                      {isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      {usageCount > 5 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Frequente
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">{food.categoria}</p>
                    
                    {/* Valores nutricionais principais */}
                    <div className="flex space-x-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {Number(food.energia_kcal).toFixed(0)} kcal
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <Beef className="h-3 w-3 mr-1" />
                        {Number(food.proteina_g).toFixed(1)}g prot
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        <Wheat className="h-3 w-3 mr-1" />
                        {Number(food.carboidrato_g).toFixed(1)}g carb
                      </Badge>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <Droplets className="h-3 w-3 mr-1" />
                        {Number(food.lipidios_g).toFixed(1)}g gord
                      </Badge>
                    </div>

                    {/* Badges nutricionais especiais */}
                    {nutritionBadges && nutritionBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {nutritionBadges.map((badge, index) => (
                          <Badge key={index} className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(food.id)
                      }}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onFoodSelect(food, 100)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredFoods.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum alimento encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou usar termos diferentes
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}