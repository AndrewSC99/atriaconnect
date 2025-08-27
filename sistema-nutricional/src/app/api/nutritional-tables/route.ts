import { NextRequest, NextResponse } from 'next/server'
import tacoData from '@/data/taco-expanded.json'
import ibgeData from '@/data/ibge-pof.json'

export interface NutritionalTableResponse {
  success: boolean
  data?: {
    foods: any[]
    metadata: {
      source: string
      totalFoods: number
      version: string
      lastUpdated: string
    }
    pagination?: {
      page: number
      limit: number
      totalPages: number
      hasMore: boolean
    }
  }
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const source = searchParams.get('source') || 'both' // 'taco', 'ibge', 'both'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'nome'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    let allFoods: any[] = []
    let metadata: any = {}

    // Combinar dados baseado na fonte selecionada
    switch (source) {
      case 'taco':
        allFoods = tacoData.alimentos.map(food => ({
          ...food,
          fonte: 'TACO'
        }))
        metadata = {
          source: 'TACO - Tabela Brasileira de Composição de Alimentos',
          totalFoods: tacoData.alimentos.length,
          version: '4ª Edição Ampliada e Revisada',
          lastUpdated: '2011',
          institution: 'NEPA/UNICAMP'
        }
        break
        
      case 'ibge':
        allFoods = ibgeData.alimentos.map(food => ({
          ...food,
          fonte: 'IBGE'
        }))
        metadata = {
          source: 'IBGE - Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil',
          totalFoods: ibgeData.alimentos.length,
          version: 'POF 2008-2009',
          lastUpdated: '2008-2009',
          institution: 'Instituto Brasileiro de Geografia e Estatística'
        }
        break
        
      case 'both':
      default:
        const tacoFoods = tacoData.alimentos.map(food => ({
          ...food,
          fonte: 'TACO'
        }))
        const ibgeFoods = ibgeData.alimentos.map(food => ({
          ...food,
          fonte: 'IBGE'
        }))
        allFoods = [...tacoFoods, ...ibgeFoods]
        metadata = {
          source: 'Base Unificada TACO + IBGE',
          totalFoods: tacoFoods.length + ibgeFoods.length,
          version: 'Integrada',
          lastUpdated: '2025',
          institution: 'Sistema Nutricional',
          breakdown: {
            taco: tacoFoods.length,
            ibge: ibgeFoods.length
          }
        }
        break
    }

    // Aplicar filtros
    let filteredFoods = allFoods

    // Filtro por busca
    if (search) {
      const searchLower = search.toLowerCase()
      filteredFoods = filteredFoods.filter(food => 
        food.nome.toLowerCase().includes(searchLower) ||
        food.categoria?.toLowerCase().includes(searchLower) ||
        food.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filtro por categoria
    if (category !== 'all') {
      filteredFoods = filteredFoods.filter(food => food.categoria === category)
    }

    // Ordenação
    filteredFoods.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // Tratamento especial para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Tratamento para números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Fallback para comparação de string
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      return sortOrder === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })

    // Paginação
    const totalFoods = filteredFoods.length
    const totalPages = Math.ceil(totalFoods / limit)
    const offset = (page - 1) * limit
    const paginatedFoods = filteredFoods.slice(offset, offset + limit)

    // Atualizar metadata com totais filtrados
    metadata.filteredCount = totalFoods

    const response: NutritionalTableResponse = {
      success: true,
      data: {
        foods: paginatedFoods,
        metadata,
        pagination: {
          page,
          limit,
          totalPages,
          hasMore: page < totalPages
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro na API de tabelas nutricionais:', error)
    
    const response: NutritionalTableResponse = {
      success: false,
      error: 'Erro interno do servidor'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// Endpoint para obter categorias disponíveis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source } = body

    let categories: string[] = []
    
    switch (source) {
      case 'taco':
        categories = [...new Set(tacoData.alimentos.map(food => food.categoria))]
        break
      case 'ibge':
        categories = [...new Set(ibgeData.alimentos.map(food => food.categoria))]
        break
      case 'both':
      default:
        const tacoCategories = tacoData.alimentos.map(food => food.categoria)
        const ibgeCategories = ibgeData.alimentos.map(food => food.categoria)
        categories = [...new Set([...tacoCategories, ...ibgeCategories])]
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.sort(),
        count: categories.length
      }
    })

  } catch (error) {
    console.error('Erro ao obter categorias:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}