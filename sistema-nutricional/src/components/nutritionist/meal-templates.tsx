'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChefHat,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  Bookmark,
  Users,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Heart,
  TrendingUp,
  Save,
  Copy,
  Edit,
  Trash2
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { calculateFoodPortion, sumNutritionalValues, FoodPortion } from '@/utils/nutritionalCalculations'

interface MealTemplate {
  id: string
  name: string
  description?: string
  category: 'breakfast' | 'snack' | 'lunch' | 'dinner' | 'dessert' | 'drink' | 'custom'
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner'
  foods: FoodPortion[]
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  metadata: {
    prepTime?: number
    difficulty: 'easy' | 'medium' | 'hard'
    servings: number
    tags: string[]
    isPublic: boolean
    usageCount: number
    rating: number
    createdBy: string
  }
}

interface MealTemplatesProps {
  onTemplateSelect: (template: MealTemplate) => void
  selectedMealType?: string
  targetCalories?: number
}

export function MealTemplates({ 
  onTemplateSelect, 
  selectedMealType = 'breakfast',
  targetCalories = 400
}: MealTemplatesProps) {
  const { foods } = useTaco()
  
  // Templates pré-definidos (em produção viriam do backend)
  const [templates] = useState<MealTemplate[]>([
    {
      id: '1',
      name: 'Café da Manhã Completo',
      description: 'Café da manhã balanceado com proteína, carboidratos e gorduras saudáveis',
      category: 'breakfast',
      mealType: 'breakfast',
      foods: [
        { food: foods.find(f => f.nome.includes('Aveia'))!, quantity: 40 },
        { food: foods.find(f => f.nome.includes('Banana'))!, quantity: 100 },
        { food: foods.find(f => f.nome.includes('Leite'))!, quantity: 200 },
        { food: foods.find(f => f.nome.includes('Amendoim'))!, quantity: 15 }
      ].filter(item => item.food),
      nutrition: { calories: 380, protein: 18, carbs: 55, fat: 12, fiber: 8 },
      metadata: {
        prepTime: 10,
        difficulty: 'easy',
        servings: 1,
        tags: ['saudável', 'rápido', 'proteína'],
        isPublic: true,
        usageCount: 45,
        rating: 4.8,
        createdBy: 'Sistema'
      }
    },
    {
      id: '2',
      name: 'Almoço Executivo',
      description: 'Refeição completa e prática para o dia a dia',
      category: 'lunch',
      mealType: 'lunch',
      foods: [
        { food: foods.find(f => f.nome.includes('Arroz'))!, quantity: 100 },
        { food: foods.find(f => f.nome.includes('Feijão'))!, quantity: 80 },
        { food: foods.find(f => f.nome.includes('Frango'))!, quantity: 120 },
        { food: foods.find(f => f.nome.includes('Alface'))!, quantity: 50 }
      ].filter(item => item.food),
      nutrition: { calories: 520, protein: 32, carbs: 65, fat: 8, fiber: 12 },
      metadata: {
        prepTime: 25,
        difficulty: 'medium',
        servings: 1,
        tags: ['tradicional', 'completo', 'brasileiro'],
        isPublic: true,
        usageCount: 67,
        rating: 4.6,
        createdBy: 'Sistema'
      }
    },
    {
      id: '3',
      name: 'Lanche Pré-Treino',
      description: 'Energia rápida para atividade física',
      category: 'snack',
      mealType: 'afternoon_snack',
      foods: [
        { food: foods.find(f => f.nome.includes('Banana'))!, quantity: 100 },
        { food: foods.find(f => f.nome.includes('Aveia'))!, quantity: 20 },
        { food: foods.find(f => f.nome.includes('Mel'))!, quantity: 10 }
      ].filter(item => item.food),
      nutrition: { calories: 180, protein: 4, carbs: 42, fat: 2, fiber: 4 },
      metadata: {
        prepTime: 5,
        difficulty: 'easy',
        servings: 1,
        tags: ['pré-treino', 'energia', 'rápido'],
        isPublic: true,
        usageCount: 29,
        rating: 4.9,
        createdBy: 'Sistema'
      }
    },
    {
      id: '4',
      name: 'Jantar Leve',
      description: 'Refeição nutritiva e leve para o final do dia',
      category: 'dinner',
      mealType: 'dinner',
      foods: [
        { food: foods.find(f => f.nome.includes('Peixe'))!, quantity: 150 },
        { food: foods.find(f => f.nome.includes('Brócolis'))!, quantity: 100 },
        { food: foods.find(f => f.nome.includes('Batata'))!, quantity: 80 }
      ].filter(item => item.food),
      nutrition: { calories: 290, protein: 28, carbs: 25, fat: 8, fiber: 6 },
      metadata: {
        prepTime: 20,
        difficulty: 'medium',
        servings: 1,
        tags: ['leve', 'proteína', 'jantar'],
        isPublic: true,
        usageCount: 38,
        rating: 4.7,
        createdBy: 'Sistema'
      }
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'name' | 'calories'>('rating')
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(['1', '3'])

  const categories = [
    { key: 'all', label: 'Todos', icon: Filter },
    { key: 'breakfast', label: 'Café da Manhã', icon: ChefHat },
    { key: 'snack', label: 'Lanches', icon: Zap },
    { key: 'lunch', label: 'Almoço', icon: Beef },
    { key: 'dinner', label: 'Jantar', icon: Wheat },
    { key: 'custom', label: 'Personalizados', icon: Star }
  ]

  // Filtrar e ordenar templates
  const filteredTemplates = useMemo(() => {
    let result = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      
      // Filtrar por proximidade calórica se especificado
      const calorieRange = targetCalories * 0.3 // 30% de tolerância
      const matchesCalories = !targetCalories || 
                             Math.abs(template.nutrition.calories - targetCalories) <= calorieRange
      
      return matchesSearch && matchesCategory && matchesCalories
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.metadata.rating - a.metadata.rating
        case 'usage':
          return b.metadata.usageCount - a.metadata.usageCount
        case 'name':
          return a.name.localeCompare(b.name)
        case 'calories':
          return Math.abs(a.nutrition.calories - targetCalories) - 
                 Math.abs(b.nutrition.calories - targetCalories)
        default:
          return 0
      }
    })

    return result
  }, [templates, searchTerm, selectedCategory, sortBy, targetCalories])

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCalorieMatchStatus = (templateCalories: number) => {
    if (!targetCalories) return null
    
    const diff = Math.abs(templateCalories - targetCalories)
    const percentage = (diff / targetCalories) * 100
    
    if (percentage <= 15) return { text: 'Perfeito', color: 'bg-green-100 text-green-800' }
    if (percentage <= 30) return { text: 'Bom', color: 'bg-blue-100 text-blue-800' }
    return { text: 'Ajustar', color: 'bg-orange-100 text-orange-800' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <span>Templates de Refeições</span>
              <Badge variant="secondary">{filteredTemplates.length} templates</Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar mais
              </Button>
              <Button size="sm" onClick={() => setShowCreateTemplate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="h-8"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* Informações de contexto */}
          {targetCalories && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Meta calórica: {targetCalories} kcal
                </span>
                <span className="text-xs text-blue-600">
                  ({selectedMealType === 'breakfast' ? 'Café da Manhã' : 
                    selectedMealType === 'lunch' ? 'Almoço' :
                    selectedMealType === 'dinner' ? 'Jantar' : 'Lanche'})
                </span>
              </div>
            </div>
          )}

          {/* Ordenação */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Ordenar por:</Label>
            <div className="flex space-x-1">
              {[
                { value: 'rating', label: 'Avaliação', icon: Star },
                { value: 'usage', label: 'Popularidade', icon: TrendingUp },
                { value: 'name', label: 'Nome', icon: Filter },
                { value: 'calories', label: 'Calorias', icon: Zap }
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={sortBy === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(value as any)}
                  className="h-7 text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isFavorite = favorites.includes(template.id)
          const calorieMatch = getCalorieMatchStatus(template.nutrition.calories)
          
          return (
            <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(template.id)
                    }}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações nutricionais */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{template.nutrition.calories}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{template.nutrition.protein.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">prot</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{template.nutrition.carbs.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">carb</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{template.nutrition.fat.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">gord</div>
                  </div>
                </div>

                {/* Badges informativos */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(template.metadata.difficulty)}>
                    {template.metadata.difficulty === 'easy' ? 'Fácil' :
                     template.metadata.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                  
                  {template.metadata.prepTime && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {template.metadata.prepTime}min
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {template.metadata.servings} porção
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {template.metadata.rating.toFixed(1)}
                  </Badge>
                  
                  {calorieMatch && (
                    <Badge className={calorieMatch.color}>
                      {calorieMatch.text}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {template.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.metadata.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {template.metadata.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Lista de alimentos */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Alimentos:</Label>
                  <div className="text-xs text-muted-foreground">
                    {template.foods.map((item, index) => (
                      <span key={index}>
                        {item.food.nome} ({item.quantity}g)
                        {index < template.foods.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Usar Template
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou criar um novo template
            </p>
            <Button className="mt-4" onClick={() => setShowCreateTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de criação de template (placeholder) */}
      {showCreateTemplate && (
        <Card className="fixed inset-0 z-50 m-8 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Criar Novo Template</CardTitle>
              <Button variant="ghost" onClick={() => setShowCreateTemplate(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Nome do Template</Label>
                <Input placeholder="Ex: Café da manhã proteico" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva o template..." />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setShowCreateTemplate(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
                <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}