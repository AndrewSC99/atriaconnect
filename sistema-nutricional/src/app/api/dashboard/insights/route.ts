import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const nutritionistId = session.user.id

    // TODO: Implementar análise de dados real com IA
    // Por enquanto, retornando insights mock baseados em padrões comuns
    const mockInsights = [
      {
        id: '1',
        type: 'success',
        title: 'Receita cresceu 12% este mês',
        description: 'O aumento foi principalmente devido ao aumento de consultas às terças-feiras (+40%)',
        metric: {
          value: 'R$ 8.450',
          change: '+12%',
          isPositive: true
        },
        action: {
          label: 'Ver detalhes',
          endpoint: '/api/dashboard/revenue-details'
        },
        priority: 'high',
        category: 'financial'
      },
      {
        id: '2',
        type: 'warning',
        title: '3 pacientes em risco de abandono',
        description: 'Roberto, Laura e Fernanda não comparecem há mais de 30 dias',
        action: {
          label: 'Entrar em contato',
          endpoint: '/api/patients/contact-inactive'
        },
        priority: 'urgent',
        category: 'retention'
      },
      {
        id: '3',
        type: 'tip',
        title: 'Sextas-feiras têm 40% menos consultas',
        description: 'Considere criar uma promoção especial ou ofertas para sextas-feiras',
        action: {
          label: 'Criar campanha',
          endpoint: '/api/campaigns/create'
        },
        priority: 'medium',
        category: 'optimization'
      },
      {
        id: '4',
        type: 'info',
        title: 'Horário 14h-16h é o mais produtivo',
        description: 'Taxa de adesão 23% maior neste período vs outros horários',
        metric: {
          value: '95%',
          change: '+23%',
          isPositive: true
        },
        priority: 'low',
        category: 'productivity'
      },
      {
        id: '5',
        type: 'success',
        title: 'Taxa de adesão às dietas aumentou',
        description: 'Pacientes estão seguindo melhor as orientações nutricionais este mês',
        metric: {
          value: '92%',
          change: '+8%',
          isPositive: true
        },
        priority: 'medium',
        category: 'adherence'
      }
    ]

    // Simular análise em tempo real
    const analysisTimestamp = new Date().toISOString()
    
    return NextResponse.json({
      success: true,
      data: {
        insights: mockInsights,
        totalInsights: mockInsights.length,
        highPriorityCount: mockInsights.filter(i => i.priority === 'high' || i.priority === 'urgent').length,
        categories: {
          financial: mockInsights.filter(i => i.category === 'financial').length,
          retention: mockInsights.filter(i => i.category === 'retention').length,
          optimization: mockInsights.filter(i => i.category === 'optimization').length,
          productivity: mockInsights.filter(i => i.category === 'productivity').length,
          adherence: mockInsights.filter(i => i.category === 'adherence').length
        },
        lastAnalysis: analysisTimestamp
      },
      timestamp: analysisTimestamp
    })

  } catch (error) {
    console.error('Error fetching dashboard insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}