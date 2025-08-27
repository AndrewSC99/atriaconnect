import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const favorites = searchParams.get('favorites') === 'true'

    let where: any = {}

    if (session.user.role === 'PATIENT') {
      // Pacientes veem receitas compartilhadas pelo seu nutricionista
      where.nutritionistId = session.user.nutritionistId
    } else if (session.user.role === 'NUTRITIONIST') {
      // Nutricionistas veem suas próprias receitas
      where.nutritionistId = session.user.id
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } }
      ]
    }

    if (category !== 'all') {
      where.category = category
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        nutritionist: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let formattedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      servings: recipe.servings,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      tags: JSON.parse(recipe.tags),
      nutritionist: recipe.nutritionist.name,
      rating: recipe.rating,
      favorite: false // TODO: Implementar sistema de favoritos por usuário
    }))

    if (favorites) {
      // TODO: Filtrar apenas receitas favoritadas pelo usuário
      formattedRecipes = formattedRecipes.filter(recipe => recipe.favorite)
    }

    return NextResponse.json(formattedRecipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      difficulty,
      prepTime,
      servings,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      ingredients,
      instructions,
      tags
    } = body

    // Validação básica
    if (!title || !description || !category || !ingredients || !instructions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        category,
        difficulty: difficulty || 'EASY',
        prepTime: prepTime || 30,
        servings: servings || 1,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(instructions),
        tags: JSON.stringify(tags || []),
        nutritionistId: session.user.id,
        rating: 5.0
      },
      include: {
        nutritionist: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      nutritionist: recipe.nutritionist.name,
      message: 'Recipe created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 })
    }

    // Verificar se o nutricionista é o dono da receita
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    if (recipe.nutritionistId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      id: updatedRecipe.id,
      title: updatedRecipe.title,
      message: 'Recipe updated successfully'
    })

  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 })
    }

    // Verificar se o nutricionista é o dono da receita
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    if (recipe.nutritionistId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.recipe.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Recipe deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}