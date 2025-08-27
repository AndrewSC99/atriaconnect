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
    const status = searchParams.get('status') || 'all'
    const date = searchParams.get('date')

    let where: any = {}

    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.patientId
    } else if (session.user.role === 'NUTRITIONIST') {
      where.nutritionistId = session.user.id
    }

    if (status !== 'all') {
      where.status = status
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        nutritionist: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      location: appointment.location,
      patient: session.user.role === 'NUTRITIONIST' ? {
        name: appointment.patient.user.name,
        email: appointment.patient.user.email,
        phone: appointment.patient.phone
      } : undefined,
      nutritionist: session.user.role === 'PATIENT' ? {
        name: appointment.nutritionist.name,
        email: appointment.nutritionist.email
      } : undefined
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
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
    const { date, time, type, duration, notes, location, patientId } = body

    // Validação básica
    if (!date || !time || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Criar objeto Date combinando data e hora
    const appointmentDate = new Date(`${date}T${time}:00`)

    let appointmentData: any = {
      date: appointmentDate,
      type,
      duration: duration || 60,
      notes,
      location: location || 'Presencial',
      status: 'SCHEDULED'
    }

    if (session.user.role === 'PATIENT') {
      // Paciente agendando consulta
      appointmentData.patientId = session.user.patientId
      appointmentData.nutritionistId = session.user.nutritionistId // Assumindo que o paciente tem um nutricionista fixo
    } else if (session.user.role === 'NUTRITIONIST') {
      // Nutricionista agendando consulta
      if (!patientId) {
        return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
      }
      appointmentData.patientId = patientId
      appointmentData.nutritionistId = session.user.id
    }

    // Verificar conflitos de horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        nutritionistId: appointmentData.nutritionistId,
        date: appointmentDate,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 })
    }

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        nutritionist: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      id: appointment.id,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: appointment.type,
      status: appointment.status,
      message: 'Appointment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating appointment:', error)
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
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para atualizar este agendamento
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'NUTRITIONIST' && appointment.nutritionistId === session.user.id) ||
      (session.user.role === 'PATIENT' && appointment.patientId === session.user.patientId)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes })
      }
    })

    return NextResponse.json({
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      message: 'Appointment updated successfully'
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}