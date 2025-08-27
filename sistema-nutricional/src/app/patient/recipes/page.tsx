'use client'

import { useState } from 'react'
import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Clock,
  Users,
  ChefHat,
  Heart,
  Star,
  BookOpen,
  Zap,
  Filter,
  Share,
  Plus
} from 'lucide-react'

interface Recipe {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  ingredients: string[]
  instructions: string[]
  tags: string[]
  nutritionist: string
  rating: number
  favorite: boolean
  personalNote?: string
}

const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Salmão Grelhado com Legumes",
    description: "Receita rica em ômega-3 e proteínas, ideal para sua dieta de emagrecimento",
    category: "Prato Principal",
    difficulty: "easy",
    prepTime: 25,
    servings: 2,
    calories: 320,
    protein: 28,
    carbs: 12,
    fat: 18,
    fiber: 4,
    ingredients: [
      "2 filés de salmão (150g cada)",
      "1 abobrinha média em fatias",
      "1 berinjela pequena em cubos", 
      "1 pimentão vermelho em tiras",
      "2 colheres de sopa de azeite",
      "Sal e pimenta a gosto",
      "Suco de 1 limão",
      "Ervas finas"
    ],
    instructions: [
      "Tempere o salmão com sal, pimenta e limão",
      "Corte todos os legumes uniformemente",
      "Aqueça uma grelha ou frigideira antiaderente",
      "Grelhe o salmão por 4-5 minutos de cada lado",
      "Em outra panela, refogue os legumes com azeite",
      "Tempere os legumes com sal e ervas",
      "Sirva o salmão sobre os legumes"
    ],
    tags: ["low-carb", "rico em proteína", "ômega-3", "anti-inflamatório"],
    nutritionist: "Dra. Maria Silva",
    rating: 4.8,
    favorite: true,
    personalNote: "Perfeita para o jantar! Lembrar de comprar salmão fresco."
  },
  {
    id: 2,
    title: "Smoothie Verde Detox",
    description: "Bebida nutritiva recomendada para seu café da manhã",
    category: "Bebida",
    difficulty: "easy",
    prepTime: 5,
    servings: 1,
    calories: 180,
    protein: 6,
    carbs: 32,
    fat: 4,
    fiber: 8,
    ingredients: [
      "1 maçã verde sem casca",
      "1/2 pepino descascado",
      "1 xícara de espinafre fresco",
      "1/2 abacate pequeno",
      "200ml de água de coco",
      "Suco de 1/2 limão",
      "1 colher de chá de gengibre ralado",
      "Hortelã a gosto"
    ],
    instructions: [
      "Lave bem todos os ingredientes",
      "Corte a maçã e o pepino em pedaços",
      "Coloque todos os ingredientes no liquidificador",
      "Bata até obter consistência homogênea",
      "Adicione gelo se desejar",
      "Sirva imediatamente"
    ],
    tags: ["detox", "vegetariano", "baixa caloria", "antioxidante"],
    nutritionist: "Dra. Maria Silva",
    rating: 4.5,
    favorite: false
  },
  {
    id: 3,
    title: "Salada de Quinoa com Grão-de-Bico",
    description: "Opção completa para o almoço, rica em proteínas vegetais",
    category: "Salada",
    difficulty: "medium",
    prepTime: 30,
    servings: 4,
    calories: 280,
    protein: 12,
    carbs: 45,
    fat: 8,
    fiber: 10,
    ingredients: [
      "1 xícara de quinoa",
      "1 lata de grão-de-bico escorrido",
      "1 pepino em cubos",
      "2 tomates em cubos",
      "1/2 cebola roxa fatiada",
      "1/4 xícara de salsa picada",
      "3 colheres de sopa de azeite",
      "2 colheres de sopa de vinagre",
      "Sal e pimenta a gosto"
    ],
    instructions: [
      "Cozinhe a quinoa conforme instruções da embalagem",
      "Deixe a quinoa esfriar completamente",
      "Corte todos os vegetais em cubos pequenos",
      "Misture quinoa, grão-de-bico e vegetais",
      "Prepare o molho com azeite, vinagre, sal e pimenta",
      "Adicione o molho à salada e misture bem",
      "Deixe marinar por 15 minutos antes de servir"
    ],
    tags: ["vegetariano", "alto em fibras", "proteína vegetal", "sem glúten"],
    nutritionist: "Dra. Maria Silva",
    rating: 4.7,
    favorite: true,
    personalNote: "Ótima para meal prep! Dura 3 dias na geladeira."
  }
]

const categories = [
  { id: 'all', label: 'Todas' },
  { id: 'Prato Principal', label: 'Pratos Principais' },
  { id: 'Salada', label: 'Saladas' },
  { id: 'Bebida', label: 'Bebidas' },
  { id: 'Lanche', label: 'Lanches' },
  { id: 'Café da Manhã', label: 'Café da Manhã' }
]

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-green-600', icon: '😊' },
  medium: { label: 'Médio', color: 'bg-yellow-600', icon: '🤔' },
  hard: { label: 'Difícil', color: 'bg-red-600', icon: '😅' }
}

export default function PatientRecipes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || recipe.favorite
    
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const favoriteRecipes = mockRecipes.filter(r => r.favorite).length

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Minhas Receitas
            </h1>
            <p className="text-muted-foreground">
              Receitas recomendadas pela sua nutricionista
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {favoriteRecipes} receitas favoritas
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Receitas Disponíveis</p>
                  <p className="text-2xl font-bold">{mockRecipes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Favoritas</p>
                  <p className="text-2xl font-bold">{favoriteRecipes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Mais Preparada</p>
                  <p className="text-lg font-bold">Smoothie Verde</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar receitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  size="sm"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Favoritas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Receitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-green-100 rounded-t-lg flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-blue-600" />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{recipe.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={recipe.favorite ? "text-red-500" : "text-muted-foreground"}
                    >
                      <Heart className="h-4 w-4" fill={recipe.favorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.prepTime}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.servings} porções</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{recipe.calories} kcal</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={difficultyConfig[recipe.difficulty].color}>
                      {difficultyConfig[recipe.difficulty].icon} {difficultyConfig[recipe.difficulty].label}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{recipe.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recipe.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {recipe.personalNote && (
                    <div className="p-2 bg-blue-50 rounded text-xs text-blue-700 mb-3">
                      <strong>Sua nota:</strong> {recipe.personalNote}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1" onClick={() => setSelectedRecipe(recipe)}>
                      Ver Receita
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Recomendada por {recipe.nutritionist}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma receita encontrada</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
          </div>
        )}

        {/* Modal de Receita Detalhada */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRecipe.title}</CardTitle>
                    <CardDescription>{selectedRecipe.description}</CardDescription>
                    <p className="text-sm text-blue-600 mt-1">
                      Recomendada por {selectedRecipe.nutritionist}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Nutricionais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedRecipe.calories}</p>
                    <p className="text-sm text-muted-foreground">kcal</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{selectedRecipe.protein}g</p>
                    <p className="text-sm text-muted-foreground">Proteína</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{selectedRecipe.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Carboidrato</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedRecipe.fat}g</p>
                    <p className="text-sm text-muted-foreground">Gordura</p>
                  </div>
                </div>

                {selectedRecipe.personalNote && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Sua Anotação</h4>
                    <p className="text-blue-700">{selectedRecipe.personalNote}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ingredientes */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center space-x-2">
                      <span>🛒</span>
                      <span>Lista de Compras</span>
                    </h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modo de Preparo */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center space-x-2">
                      <span>👩‍🍳</span>
                      <span>Modo de Preparo</span>
                    </h3>
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ao Meu Plano
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoritar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PatientLayout>
  )
}