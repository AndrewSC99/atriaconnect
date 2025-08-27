import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuditLogs, exportAuditLogsToCSV } from '@/lib/audit'
import { AuditAction } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    
    // Parâmetros de filtro
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') as AuditAction || undefined
    const resource = searchParams.get('resource') || undefined
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const format = searchParams.get('format') // csv ou json

    const result = await getAuditLogs({
      userId,
      action,
      resource,
      startDate,
      endDate,
      limit,
      offset
    })

    // Export para CSV se solicitado
    if (format === 'csv') {
      if (!startDate || !endDate) {
        return NextResponse.json({ 
          error: 'Start date and end date required for CSV export' 
        }, { status: 400 })
      }

      const csvContent = await exportAuditLogsToCSV({
        startDate,
        endDate,
        userId
      })

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        }
      })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}