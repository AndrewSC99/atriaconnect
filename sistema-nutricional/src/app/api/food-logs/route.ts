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
    const patientId = searchParams.get('patientId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let where: any = {}

    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.patientId
    } else if (session.user.role === 'NUTRITIONIST') {
      if (patientId) {
        // Verificar se o paciente pertence ao nutricionista
        const patient = await prisma.patient.findFirst({
          where: {
            id: patientId,
            nutritionistId: session.user.id
          }
        })
        
        if (!patient) {
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }
        
        where.patientId = patientId
      } else {
        return NextResponse.json({ error: 'Patient ID required for nutritionist' }, { status: 400 })
      }
    }

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.date = {
        gte: targetDate,
        lt: nextDay
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const foodLogs = await prisma.foodLog.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    const formattedLogs = foodLogs.map(log => ({
      id: log.id,
      date: log.date.toISOString().split('T')[0],
      mealType: log.mealType,
      foodName: log.foodName,
      quantity: log.quantity,
      unit: log.unit,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber,
      notes: log.notes,
      patient: session.user.role === 'NUTRITIONIST' ? {
        id: log.patient.id,
        name: log.patient.user.name
      } : undefined
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching food logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      mealType,
      foodName,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      notes,
      patientId,
      date
    } = body

    // Validação básica
    if (!mealType || !foodName || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let targetPatientId = patientId

    if (session.user.role === 'PATIENT') {
      targetPatientId = session.user.patientId
    } else if (session.user.role === 'NUTRITIONIST') {
      if (!patientId) {
        return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
      }
      
      // Verificar se o paciente pertence ao nutricionista
      const patient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          nutritionistId: session.user.id
        }
      })
      
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }
    }

    const foodLog = await prisma.foodLog.create({
      data: {
        patientId: targetPatientId,
        mealType,
        foodName,
        quantity,
        unit: unit || 'g',
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        notes,
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json({
      id: foodLog.id,
      foodName: foodLog.foodName,
      mealType: foodLog.mealType,
      calories: foodLog.calories,
      message: 'Food log created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating food log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Food log ID required' }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para atualizar este log
    const foodLog = await prisma.foodLog.findUnique({
      where: { id },
      include: {
        patient: true
      }
    })

    if (!foodLog) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'PATIENT' && foodLog.patientId === session.user.patientId) ||
      (session.user.role === 'NUTRITIONIST' && foodLog.patient.nutritionistId === session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedFoodLog = await prisma.foodLog.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      id: updatedFoodLog.id,
      foodName: updatedFoodLog.foodName,
      message: 'Food log updated successfully'
    })

  } catch (error) {
    console.error('Error updating food log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Food log ID required' }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para deletar este log
    const foodLog = await prisma.foodLog.findUnique({
      where: { id },
      include: {
        patient: true
      }
    })

    if (!foodLog) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'PATIENT' && foodLog.patientId === session.user.patientId) ||
      (session.user.role === 'NUTRITIONIST' && foodLog.patient.nutritionistId === session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.foodLog.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Food log deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting food log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}