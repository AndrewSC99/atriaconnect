'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Heart,
  Calculator,
  Zap,
  Beef,
  Wheat
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { formatEnergy, formatMacro } from '@/utils/format'

interface TacoSearchAdvancedProps {
  onFoodSelect?: (food: Alimento) => void
  showPagination?: boolean
}

export function TacoSearchAdvanced({ onFoodSelect, showPagination = true }: TacoSearchAdvancedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState<'nome' | 'energia_kcal' | 'proteina_g'>('nome')
  const [searchResults, setSearchResults] = useState<{
    foods: Alimento[]
    totalCount: number
    hasMore: boolean
    currentPage: number
    totalPages: number
  } | null>(null)

  const { 
    searchFoods,
    toggleFavorite,
    favorites,
    categories,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    isLoading,
    addRecentSearch
  } = useTaco()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      addRecentSearch(searchTerm)
    }
    const results = searchFoods(searchTerm, selectedCategory, sortBy, currentPage)
    setSearchResults(results)
  }

  // Executar busca quando parâmetros mudarem
  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedCategory, sortBy, currentPage])

  const handlePageChange = (page: number) => {
    goToPage(page)
  }

  const handleNextPage = () => {
    if (searchResults && searchResults.hasMore) {
      nextPage()
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      prevPage()
    }
  }

  const getNutrientColor = (value: number, nutrient: string) => {
    if (nutrient === 'energia_kcal') {
      if (value > 300) return 'bg-red-100 text-red-800'
      if (value > 150) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }
    if (nutrient === 'proteina_g') {
      if (value > 20) return 'bg-blue-100 text-blue-800'
      if (value > 10) return 'bg-indigo-100 text-indigo-800'
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Busca Avançada</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome (A-Z)</SelectItem>
                <SelectItem value="energia_kcal">Energia (kcal)</SelectItem>
                <SelectItem value="proteina_g">Proteína (g)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Resultados</span>
              {searchResults && (
                <Badge variant="secondary">
                  {searchResults.totalCount} alimentos encontrados
                </Badge>
              )}
            </div>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.foods.length > 0 ? (
            <div className="space-y-3">
              {searchResults.foods.map((food: Alimento) => (
                <div
                  key={food.id}
                  className="group p-4 border rounded-lg hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer transition-all duration-200"
                  onClick={() => onFoodSelect?.(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-zinc-900">{food.nome}</h3>
                      <p className="text-sm text-muted-foreground">{food.categoria}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={getNutrientColor(food.energia_kcal, 'energia_kcal')}>
                          <Zap className="h-3 w-3 mr-1" />
                          {formatEnergy(food.energia_kcal, 'kcal')}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Beef className="h-3 w-3 mr-1" />
                          {formatMacro(food.proteina_g)} prot
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Wheat className="h-3 w-3 mr-1" />
                          {formatMacro(food.carboidrato_g)} carb
                        </Badge>
                      </div>
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
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.includes(food.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFoodSelect?.(food)
                        }}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum alimento encontrado</p>
              <p className="text-sm">Tente usar outros termos de busca ou filtros</p>
            </div>
          )}

          {/* Paginação */}
          {showPagination && searchResults && searchResults.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {searchResults.currentPage} de {searchResults.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                {/* Números das páginas */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!searchResults.hasMore}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}