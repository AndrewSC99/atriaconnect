import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'thisMonth'
    const nutritionistId = session.user.id

    // TODO: Conectar com banco de dados real
    // Por enquanto, retornando dados mock com base no período
    const mockData = {
      activePatients: {
        current: 12,
        change: '+2 este mês',
        isPositive: true,
        sparklineData: [10, 11, 12, 11, 12, 12]
      },
      consultationsToday: {
        current: 5,
        change: 'Média: 4.2/dia',
        isPositive: true,
        sparklineData: [3, 5, 4, 6, 5, 5]
      },
      averageProgress: {
        current: 85,
        change: '+8% vs mês anterior',
        isPositive: true,
        sparklineData: [78, 80, 82, 84, 83, 85]
      },
      recipesCreated: {
        current: 28,
        change: '+6 esta semana',
        isPositive: true,
        sparklineData: [20, 22, 24, 26, 27, 28]
      },
      financial: {
        monthlyRevenue: {
          current: 8450,
          change: '+12%',
          isPositive: true,
          sparklineData: [6800, 7200, 7500, 8100, 7900, 8450],
          goal: 10000
        },
        pendingPayments: {
          current: 1200,
          count: 3,
          description: '3 consultas'
        },
        averageTicket: {
          current: 180,
          description: 'Por consulta'
        },
        defaultRate: {
          current: 8.5,
          change: '-2%',
          isPositive: true
        }
      },
      weekSummary: {
        consultationsCompleted: {
          current: 23,
          change: '+15%',
          isPositive: true
        },
        dietsCreated: {
          current: 8,
          change: '+33%',
          isPositive: true
        },
        adherenceRate: {
          current: 92,
          change: '+8%',
          isPositive: true
        },
        newPatients: {
          current: 5,
          change: '+25%',
          isPositive: true
        }
      }
    }

    // Simular diferentes dados baseados no período
    if (period === '7days') {
      mockData.activePatients.current = 11
      mockData.consultationsToday.current = 4
    } else if (period === '30days') {
      mockData.activePatients.current = 15
      mockData.consultationsToday.current = 6
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      period,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}