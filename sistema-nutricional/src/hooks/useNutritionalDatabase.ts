import { useState, useMemo, useCallback } from 'react'
import tacoData from '@/data/taco-expanded.json'
import ibgeData from '@/data/ibge-pof.json'
import { containsText, sortByRelevance } from '@/utils/normalize'

export type DatabaseSource = 'taco' | 'ibge' | 'both'

export interface AlimentoUnificado {
  id: number
  codigo: string
  fonte: 'TACO' | 'IBGE'
  nome: string
  nomeIngles: string
  categoria: string
  grupoId: number
  umidade_g: number
  energia_kcal: number
  energia_kj: number
  proteina_g: number
  lipidios_g: number
  carboidrato_g: number
  carboidrato_disponivel_g: number
  fibra_alimentar_g: number
  fibra_solavel_g: number
  fibra_insolavel_g: number
  cinzas_g: number
  calcio_mg: number
  magnesio_mg: number
  manganes_mg: number
  fosforo_mg: number
  ferro_mg: number
  sodio_mg: number
  potassio_mg: number
  cobre_mg: number
  zinco_mg: number
  retinol_mcg: number
  re_mcg: number
  rae_mcg: number
  tiamina_mg: number
  riboflavina_mg: number
  piridoxina_mg: number
  niacina_mg: number
  vitamina_c_mg: number
  folato_mcg: number
  vitamina_b12_mcg: number
  vitamina_d_mcg: number
  vitamina_e_mg: number
  lipidios_saturados_g: number
  lipidios_monoinsaturados_g: number
  lipidios_poliinsaturados_g: number
  colesterol_mg: number
  acidos_graxos_trans_g: number
  acido_folico_mcg: number
  tags: string[]
}

export interface Grupo {
  id: number
  nome: string
  cor: string
}

export interface NutrientComparison {
  food1: AlimentoUnificado
  food2: AlimentoUnificado
  differences: {
    nutrient: string
    food1Value: number
    food2Value: number
    difference: number
    percentageDiff: number
  }[]
}

export interface NutrientAnalysis {
  highProtein: AlimentoUnificado[]
  lowCalorie: AlimentoUnificado[]
  highFiber: AlimentoUnificado[]
  richInVitaminC: AlimentoUnificado[]
  richInIron: AlimentoUnificado[]
}

interface UseNutritionalDatabaseOptions {
  filterBySource?: DatabaseSource
  initialFavorites?: number[]
}

export const useNutritionalDatabase = (options: UseNutritionalDatabaseOptions = {}) => {
  const { filterBySource = 'both', initialFavorites = [] } = options
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (initialFavorites.length > 0) {
      return initialFavorites
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutritional-favorites')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutritional-recent-searches')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [searchCache, setSearchCache] = useState<{[key: string]: AlimentoUnificado[]}>({})
  const [isLoading, setIsLoading] = useState(false)

  // Combinar dados de TACO e IBGE com filtro por fonte
  const allFoods = useMemo((): AlimentoUnificado[] => {
    let foods: AlimentoUnificado[] = []
    
    if (filterBySource === 'taco' || filterBySource === 'both') {
      const tacoFoods = tacoData.alimentos.map(food => ({
        ...food,
        fonte: 'TACO' as const
      }))
      foods = [...foods, ...tacoFoods]
    }
    
    if (filterBySource === 'ibge' || filterBySource === 'both') {
      const ibgeFoods = ibgeData.alimentos.map(food => ({
        ...food,
        fonte: 'IBGE' as const
      }))
      foods = [...foods, ...ibgeFoods]
    }

    return foods
  }, [filterBySource])

  // Combinar categorias (removendo duplicatas)
  const allCategories = useMemo(() => {
    const tacoCategories = tacoData.categorias || []
    const ibgeCategories = ibgeData.categorias || []
    const combined = [...tacoCategories, ...ibgeCategories]
    return [...new Set(combined)]
  }, [])

  // Salvar favoritos no localStorage
  const toggleFavorite = useCallback((foodId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutritional-favorites', JSON.stringify(newFavorites))
      }
      return newFavorites
    })
  }, [])

  // Adicionar busca recente
  const addRecentSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim().length > 2) {
      setRecentSearches(prev => {
        const filtered = prev.filter(term => term !== searchTerm)
        const newSearches = [searchTerm, ...filtered].slice(0, 5)
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('nutritional-recent-searches', JSON.stringify(newSearches))
        }
        return newSearches
      })
    }
  }, [])

  // Buscar alimentos com filtros avançados e paginação
  const searchFoods = useCallback((
    searchTerm: string,
    category: string = 'Todos',
    sortBy: 'nome' | 'energia_kcal' | 'proteina_g' = 'nome',
    page: number = 1,
    sourceFilter: 'all' | 'TACO' | 'IBGE' = 'all'
  ) => {
    const cacheKey = `${searchTerm}-${category}-${sortBy}-${page}-${sourceFilter}`
    
    // Verificar cache primeiro
    if (searchCache[cacheKey]) {
      return {
        foods: searchCache[cacheKey],
        totalCount: searchCache[cacheKey].length,
        hasMore: false
      }
    }

    setIsLoading(true)
    
    // Simular delay de busca para demonstrar loading
    setTimeout(() => setIsLoading(false), 300)

    const filteredFoods = allFoods
      .filter((food: AlimentoUnificado) => {
        const matchesSearch = searchTerm.trim() === '' || containsText(food.nome, searchTerm)
        const matchesCategory = category === 'Todos' || food.categoria === category
        const matchesSource = sourceFilter === 'all' || food.fonte === sourceFilter
        return matchesSearch && matchesCategory && matchesSource
      })
      .sort((a: AlimentoUnificado, b: AlimentoUnificado) => {
        if (sortBy === 'nome') {
          return a.nome.localeCompare(b.nome)
        }
        return b[sortBy] - a[sortBy]
      })

    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedFoods = filteredFoods.slice(startIndex, endIndex)
    
    // Salvar no cache
    setSearchCache(prev => ({
      ...prev,
      [cacheKey]: paginatedFoods
    }))

    return {
      foods: paginatedFoods,
      totalCount: filteredFoods.length,
      hasMore: endIndex < filteredFoods.length,
      currentPage: page,
      totalPages: Math.ceil(filteredFoods.length / itemsPerPage)
    }
  }, [itemsPerPage, searchCache, allFoods])

  // Buscar alimentos simples (mantém compatibilidade)
  const searchFoodsSimple = useCallback((
    searchTerm: string,
    category: string = 'Todos',
    sortBy: 'nome' | 'energia_kcal' | 'proteina_g' = 'nome',
    sourceFilter: 'all' | 'TACO' | 'IBGE' = 'all'
  ) => {
    let results = allFoods
      .filter((food: AlimentoUnificado) => {
        const matchesSearch = searchTerm.trim() === '' || containsText(food.nome, searchTerm)
        const matchesCategory = category === 'Todos' || food.categoria === category
        const matchesSource = sourceFilter === 'all' || food.fonte === sourceFilter
        return matchesSearch && matchesCategory && matchesSource
      })
    
    // If there's a search term, sort by relevance
    if (searchTerm.trim()) {
      results = sortByRelevance(results, searchTerm, 'nome')
    } else {
      results.sort((a: AlimentoUnificado, b: AlimentoUnificado) => {
        if (sortBy === 'nome') {
          return a.nome.localeCompare(b.nome)
        }
        return b[sortBy] - a[sortBy]
      })
    }
    
    return results
  }, [allFoods])

  // Sugestões de alimentos baseadas em busca
  const getSuggestions = useCallback((searchTerm: string, limit: number = 5) => {
    if (searchTerm.trim().length < 2) return []
    
    const results = allFoods
      .filter((food: AlimentoUnificado) => containsText(food.nome, searchTerm))
    
    // Sort by relevance and limit results
    return sortByRelevance(results, searchTerm, 'nome').slice(0, limit)
  }, [allFoods])

  // Análise nutricional avançada
  const getNutrientAnalysis = useMemo((): NutrientAnalysis => {
    return {
      highProtein: allFoods
        .filter(food => food.proteina_g > 15)
        .sort((a, b) => b.proteina_g - a.proteina_g)
        .slice(0, 5),
      
      lowCalorie: allFoods
        .filter(food => food.energia_kcal < 50)
        .sort((a, b) => a.energia_kcal - b.energia_kcal)
        .slice(0, 5),
      
      highFiber: allFoods
        .filter(food => food.fibra_alimentar_g > 3)
        .sort((a, b) => b.fibra_alimentar_g - a.fibra_alimentar_g)
        .slice(0, 5),
      
      richInVitaminC: allFoods
        .filter(food => food.vitamina_c_mg > 10)
        .sort((a, b) => b.vitamina_c_mg - a.vitamina_c_mg)
        .slice(0, 5),
      
      richInIron: allFoods
        .filter(food => food.ferro_mg > 2)
        .sort((a, b) => b.ferro_mg - a.ferro_mg)
        .slice(0, 5)
    }
  }, [allFoods])

  // Comparar dois alimentos
  const compareFoods = useCallback((food1Id: number, food2Id: number): NutrientComparison | null => {
    const food1 = allFoods.find((f: AlimentoUnificado) => f.id === food1Id) as AlimentoUnificado
    const food2 = allFoods.find((f: AlimentoUnificado) => f.id === food2Id) as AlimentoUnificado
    
    if (!food1 || !food2) return null

    const nutrients = [
      { key: 'energia_kcal', name: 'Energia (kcal)' },
      { key: 'proteina_g', name: 'Proteínas (g)' },
      { key: 'carboidrato_g', name: 'Carboidratos (g)' },
      { key: 'lipidios_g', name: 'Gorduras (g)' },
      { key: 'fibra_alimentar_g', name: 'Fibras (g)' },
      { key: 'calcio_mg', name: 'Cálcio (mg)' },
      { key: 'ferro_mg', name: 'Ferro (mg)' },
      { key: 'vitamina_c_mg', name: 'Vitamina C (mg)' }
    ]

    const differences = nutrients.map(nutrient => {
      const food1Value = food1[nutrient.key as keyof AlimentoUnificado] as number
      const food2Value = food2[nutrient.key as keyof AlimentoUnificado] as number
      const difference = food1Value - food2Value
      const percentageDiff = food2Value !== 0 ? ((difference / food2Value) * 100) : 0

      return {
        nutrient: nutrient.name,
        food1Value,
        food2Value,
        difference,
        percentageDiff
      }
    })

    return { food1, food2, differences }
  }, [allFoods])

  // Calcular porções personalizadas
  const calculatePortion = useCallback((food: AlimentoUnificado, grams: number) => {
    const multiplier = grams / 100 // base é 100g
    
    return {
      grams,
      energia_kcal: food.energia_kcal * multiplier,
      proteina_g: food.proteina_g * multiplier,
      carboidrato_g: food.carboidrato_g * multiplier,
      lipidios_g: food.lipidios_g * multiplier,
      fibra_alimentar_g: food.fibra_alimentar_g * multiplier,
      calcio_mg: food.calcio_mg * multiplier,
      ferro_mg: food.ferro_mg * multiplier,
      sodio_mg: food.sodio_mg * multiplier,
      vitamina_c_mg: food.vitamina_c_mg * multiplier
    }
  }, [])

  // Encontrar substitutos similares
  const findSimilarFoods = useCallback((targetFood: AlimentoUnificado, limit: number = 5) => {
    return allFoods
      .filter(food => food.id !== targetFood.id && food.categoria === targetFood.categoria)
      .map(food => {
        // Cálculo simples de similaridade baseado em proteína, carboidrato e calorias
        const proteinDiff = Math.abs(food.proteina_g - targetFood.proteina_g)
        const carbDiff = Math.abs(food.carboidrato_g - targetFood.carboidrato_g)
        const calorieDiff = Math.abs(food.energia_kcal - targetFood.energia_kcal)
        
        const similarity = 1 / (1 + (proteinDiff + carbDiff + calorieDiff / 100))
        
        return { food, similarity }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.food)
  }, [allFoods])

  // Funções de paginação
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  const clearCache = useCallback(() => {
    setSearchCache({})
  }, [])

  // Estatísticas dos bancos de dados
  const databaseStats = useMemo(() => {
    const tacoCount = allFoods.filter(f => f.fonte === 'TACO').length
    const ibgeCount = allFoods.filter(f => f.fonte === 'IBGE').length
    
    return {
      total: allFoods.length,
      taco: tacoCount,
      ibge: ibgeCount
    }
  }, [allFoods])

  return {
    // State
    favorites,
    recentSearches,
    currentPage,
    itemsPerPage,
    isLoading,
    databaseStats,
    
    // Basic operations
    toggleFavorite,
    addRecentSearch,
    searchFoods,
    searchFoodsSimple,
    getSuggestions,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    clearCache,
    
    // Advanced features
    getNutrientAnalysis,
    compareFoods,
    calculatePortion,
    findSimilarFoods,
    
    // Data
    foods: allFoods,
    categories: allCategories,
    favoritesFoods: allFoods.filter((food: AlimentoUnificado) => favorites.includes(food.id))
  }
}