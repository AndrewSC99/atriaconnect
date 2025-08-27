import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const where: any = {
      nutritionistId: session.user.id
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        metrics: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        appointments: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const patientsWithStats = patients.map(patient => ({
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      currentWeight: patient.metrics[0]?.weight || patient.initialWeight,
      goalWeight: patient.goalWeight,
      startWeight: patient.initialWeight,
      lastConsultation: patient.lastConsultation,
      nextConsultation: patient.appointments[0]?.date,
      status: patient.status,
      adherence: patient.adherenceScore || 0,
      weightTrend: patient.metrics.length > 1 
        ? patient.metrics[0].weight < patient.metrics[1].weight ? 'down' : 'up'
        : 'stable'
    }))

    return NextResponse.json(patientsWithStats)
  } catch (error) {
    console.error('Error fetching patients:', error)
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
    const { name, email, phone, age, gender, height, weight, goalWeight, medicalConditions } = body

    // Validação básica
    if (!name || !email || !age || !gender || !weight || !height) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    // Criar usuário e paciente em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: 'temp_password', // Será alterado no primeiro login
          role: 'PATIENT'
        }
      })

      // Criar paciente
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          nutritionistId: session.user.id,
          phone,
          age,
          gender,
          height,
          initialWeight: weight,
          goalWeight: goalWeight || weight,
          medicalConditions,
          status: 'ACTIVE'
        }
      })

      // Criar métrica inicial
      await tx.metric.create({
        data: {
          patientId: patient.id,
          weight,
          height,
          date: new Date()
        }
      })

      return { user, patient }
    })

    return NextResponse.json({
      id: result.patient.id,
      name: result.user.name,
      email: result.user.email,
      message: 'Patient created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}