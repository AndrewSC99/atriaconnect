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
    const limit = parseInt(searchParams.get('limit') || '10')
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
        // Buscar métricas de todos os pacientes do nutricionista
        const patients = await prisma.patient.findMany({
          where: { nutritionistId: session.user.id },
          select: { id: true }
        })
        
        where.patientId = {
          in: patients.map(p => p.id)
        }
      }
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const metrics = await prisma.metric.findMany({
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
      orderBy: { date: 'desc' },
      take: limit
    })

    const formattedMetrics = metrics.map(metric => ({
      id: metric.id,
      date: metric.date.toISOString().split('T')[0],
      weight: metric.weight,
      height: metric.height,
      bodyFat: metric.bodyFat,
      muscleMass: metric.muscleMass,
      waistCircumference: metric.waistCircumference,
      hipCircumference: metric.hipCircumference,
      armCircumference: metric.armCircumference,
      thighCircumference: metric.thighCircumference,
      notes: metric.notes,
      patient: session.user.role === 'NUTRITIONIST' ? {
        id: metric.patient.id,
        name: metric.patient.user.name
      } : undefined
    }))

    return NextResponse.json(formattedMetrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
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
      weight,
      height,
      bodyFat,
      muscleMass,
      waistCircumference,
      hipCircumference,
      armCircumference,
      thighCircumference,
      notes,
      patientId,
      date
    } = body

    // Validação básica
    if (!weight) {
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 })
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

    const metric = await prisma.metric.create({
      data: {
        patientId: targetPatientId,
        weight,
        height,
        bodyFat,
        muscleMass,
        waistCircumference,
        hipCircumference,
        armCircumference,
        thighCircumference,
        notes,
        date: date ? new Date(date) : new Date()
      }
    })

    // Atualizar o peso atual do paciente
    await prisma.patient.update({
      where: { id: targetPatientId },
      data: {
        currentWeight: weight,
        lastMetricUpdate: new Date()
      }
    })

    return NextResponse.json({
      id: metric.id,
      weight: metric.weight,
      date: metric.date.toISOString().split('T')[0],
      message: 'Metric created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating metric:', error)
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
      return NextResponse.json({ error: 'Metric ID required' }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para atualizar esta métrica
    const metric = await prisma.metric.findUnique({
      where: { id },
      include: {
        patient: true
      }
    })

    if (!metric) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'PATIENT' && metric.patientId === session.user.patientId) ||
      (session.user.role === 'NUTRITIONIST' && metric.patient.nutritionistId === session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedMetric = await prisma.metric.update({
      where: { id },
      data: updateData
    })

    // Se o peso foi atualizado, atualizar o peso atual do paciente
    if (updateData.weight) {
      await prisma.patient.update({
        where: { id: metric.patientId },
        data: {
          currentWeight: updateData.weight,
          lastMetricUpdate: new Date()
        }
      })
    }

    return NextResponse.json({
      id: updatedMetric.id,
      weight: updatedMetric.weight,
      message: 'Metric updated successfully'
    })

  } catch (error) {
    console.error('Error updating metric:', error)
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
      return NextResponse.json({ error: 'Metric ID required' }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para deletar esta métrica
    const metric = await prisma.metric.findUnique({
      where: { id },
      include: {
        patient: true
      }
    })

    if (!metric) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'PATIENT' && metric.patientId === session.user.patientId) ||
      (session.user.role === 'NUTRITIONIST' && metric.patient.nutritionistId === session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.metric.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Metric deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}