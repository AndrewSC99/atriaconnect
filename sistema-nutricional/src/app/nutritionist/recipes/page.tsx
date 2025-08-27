'use client'

import { useState } from 'react'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  ChefHat,
  Heart,
  Star,
  Edit,
  Trash2,
  Copy,
  Share,
  BookOpen,
  Zap,
  Leaf
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
  author: string
  rating: number
  favorite: boolean
}

const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Salmão Grelhado com Legumes",
    description: "Receita rica em ômega-3 e proteínas, ideal para dietas de emagrecimento",
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
    author: "Dra. Maria Silva",
    rating: 4.8,
    favorite: true
  },
  {
    id: 2,
    title: "Smoothie Verde Detox",
    description: "Bebida nutritiva para desintoxicação e aumento da energia",
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
    author: "Dra. Maria Silva",
    rating: 4.5,
    favorite: false
  },
  {
    id: 3,
    title: "Salada de Quinoa com Grão-de-Bico",
    description: "Salada completa rica em proteínas vegetais e fibras",
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
    author: "Dra. Maria Silva",
    rating: 4.7,
    favorite: true
  }
]

const categories = [
  { id: 'all', label: 'Todas as Categorias' },
  { id: 'Prato Principal', label: 'Pratos Principais' },
  { id: 'Salada', label: 'Saladas' },
  { id: 'Bebida', label: 'Bebidas' },
  { id: 'Sobremesa', label: 'Sobremesas' },
  { id: 'Lanche', label: 'Lanches' },
  { id: 'Café da Manhã', label: 'Café da Manhã' }
]

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-green-600', icon: '😊' },
  medium: { label: 'Médio', color: 'bg-yellow-600', icon: '🤔' },
  hard: { label: 'Difícil', color: 'bg-red-600', icon: '😅' }
}

export default function NutritionistRecipes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || recipe.favorite
    
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const totalRecipes = mockRecipes.length
  const favoriteRecipes = mockRecipes.filter(r => r.favorite).length
  const avgRating = mockRecipes.reduce((sum, r) => sum + r.rating, 0) / mockRecipes.length

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Biblioteca de Receitas
            </h1>
            <p className="text-muted-foreground">
              Gerencie e compartilhe receitas nutritivas com seus pacientes
            </p>
          </div>
          <Button onClick={() => setIsCreatingRecipe(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Receitas</p>
                  <p className="text-2xl font-bold">{totalRecipes}</p>
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
                <Star className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Mais Usada</p>
                  <p className="text-lg font-bold">Salmão Grelhado</p>
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
                    placeholder="Buscar receitas por nome ou tag..."
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

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grade</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          {/* Vista em Grade */}
          <TabsContent value="grid" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-green-600" />
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
                      
                      <div className="flex items-center justify-between">
                        <Badge className={difficultyConfig[recipe.difficulty].color}>
                          {difficultyConfig[recipe.difficulty].icon} {difficultyConfig[recipe.difficulty].label}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{recipe.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
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
                      
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" className="flex-1" onClick={() => setSelectedRecipe(recipe)}>
                          Ver Receita
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vista em Lista */}
          <TabsContent value="list" className="space-y-4 mt-6">
            <div className="space-y-4">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <ChefHat className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold">{recipe.title}</h3>
                            <p className="text-sm text-muted-foreground">{recipe.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                              <span>⏱️ {recipe.prepTime}min</span>
                              <span>👥 {recipe.servings} porções</span>
                              <span>⚡ {recipe.calories} kcal</span>
                              <span>⭐ {recipe.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={difficultyConfig[recipe.difficulty].color}>
                          {difficultyConfig[recipe.difficulty].label}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Receita Detalhada */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRecipe.title}</CardTitle>
                    <CardDescription>{selectedRecipe.description}</CardDescription>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ingredientes */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Ingredientes</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-sm">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modo de Preparo */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Modo de Preparo</h3>
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
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
                  <h3 className="font-bold text-lg mb-3">Tags</h3>
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
                    <Share className="h-4 w-4 mr-2" />
                    Compartilhar com Paciente
                  </Button>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Formulário de Nova Receita */}
        {isCreatingRecipe && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Receita</CardTitle>
              <CardDescription>
                Crie uma nova receita para sua biblioteca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título da Receita</Label>
                  <Input id="title" placeholder="Nome da receita" />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select className="w-full p-2 border rounded-md">
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Breve descrição da receita" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tempo de Preparo (min)</Label>
                  <Input type="number" placeholder="30" />
                </div>
                <div>
                  <Label>Porções</Label>
                  <Input type="number" placeholder="4" />
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">Salvar Receita</Button>
                <Button variant="outline" onClick={() => setIsCreatingRecipe(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </NutritionistLayout>
  )
}