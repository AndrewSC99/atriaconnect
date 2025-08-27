import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { AuditAction } from '@prisma/client'

export interface AuditLogData {
  userId?: string
  action: AuditAction
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Registra ação no log de auditoria
 */
export async function createAuditLog(
  data: AuditLogData,
  request?: NextRequest
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || request?.ip || 'unknown',
        userAgent: data.userAgent || request?.headers.get('user-agent') || undefined
      }
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Não falhar a operação principal por causa do log
  }
}

/**
 * Busca logs de auditoria com filtros
 */
export async function getAuditLogs(filters: {
  userId?: string
  action?: AuditAction
  resource?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  try {
    const where: any = {}

    if (filters.userId) where.userId = filters.userId
    if (filters.action) where.action = filters.action
    if (filters.resource) where.resource = filters.resource
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      })),
      total
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw new Error('Failed to fetch audit logs')
  }
}

/**
 * Middleware para logging automático de ações CRUD
 */
export function createAuditMiddleware(
  resource: string,
  action: AuditAction
) {
  return async (
    userId: string,
    resourceId?: string,
    details?: Record<string, any>,
    request?: NextRequest
  ) => {
    await createAuditLog({
      userId,
      action,
      resource,
      resourceId,
      details
    }, request)
  }
}

/**
 * Helpers para ações específicas
 */

export const auditPatientCreate = createAuditMiddleware('Patient', 'CREATE')
export const auditPatientUpdate = createAuditMiddleware('Patient', 'UPDATE')
export const auditPatientDelete = createAuditMiddleware('Patient', 'DELETE')

export const auditDietCreate = createAuditMiddleware('Diet', 'CREATE')
export const auditDietUpdate = createAuditMiddleware('Diet', 'UPDATE')
export const auditDietDelete = createAuditMiddleware('Diet', 'DELETE')

export const auditAppointmentCreate = createAuditMiddleware('Appointment', 'CREATE')
export const auditAppointmentUpdate = createAuditMiddleware('Appointment', 'UPDATE')
export const auditAppointmentDelete = createAuditMiddleware('Appointment', 'DELETE')

/**
 * Gera relatório de atividade do usuário
 */
export async function generateUserActivityReport(
  userId: string,
  days: number = 30
): Promise<{
  totalActions: number
  actionsByType: Record<string, number>
  recentActions: any[]
  riskScore: number
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    })

    const actionsByType: Record<string, number> = {}
    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1
    })

    // Calcular score de risco baseado em atividades
    const riskScore = calculateRiskScore(logs)

    return {
      totalActions: logs.length,
      actionsByType,
      recentActions: logs.slice(0, 10).map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      })),
      riskScore
    }
  } catch (error) {
    console.error('Error generating user activity report:', error)
    throw new Error('Failed to generate activity report')
  }
}

/**
 * Calcula score de risco baseado em atividades
 */
function calculateRiskScore(logs: any[]): number {
  let riskScore = 0

  const riskWeights = {
    'DELETE': 3,
    'PASSWORD_CHANGE': 2,
    'TWO_FACTOR_DISABLE': 4,
    'ACCOUNT_LOCKED': 5,
    'LOGIN': 1,
    'LOGOUT': 0,
    'CREATE': 1,
    'UPDATE': 1,
    'READ': 0
  }

  logs.forEach(log => {
    const weight = riskWeights[log.action as keyof typeof riskWeights] || 1
    riskScore += weight
  })

  // Normalizar para 0-100
  const maxScore = logs.length * 5 // Assumindo peso máximo de 5
  return maxScore > 0 ? Math.min(100, (riskScore / maxScore) * 100) : 0
}

/**
 * Detecta padrões suspeitos nos logs
 */
export async function detectSuspiciousPatterns(
  userId?: string,
  hours: number = 24
): Promise<{
  suspiciousActivities: Array<{
    type: string
    description: string
    count: number
    severity: 'low' | 'medium' | 'high'
  }>
}> {
  try {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    const where: any = {
      createdAt: { gte: startDate }
    }
    if (userId) where.userId = userId

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    })

    const suspiciousActivities = []

    // 1. Múltiplas tentativas de login falhadas
    const failedLogins = logs.filter(log => 
      log.action === 'LOGIN' && 
      log.details?.includes('failed')
    )
    if (failedLogins.length >= 5) {
      suspiciousActivities.push({
        type: 'multiple_failed_logins',
        description: `${failedLogins.length} tentativas de login falhadas`,
        count: failedLogins.length,
        severity: 'high' as const
      })
    }

    // 2. Atividade de exclusão excessiva
    const deletions = logs.filter(log => log.action === 'DELETE')
    if (deletions.length >= 10) {
      suspiciousActivities.push({
        type: 'excessive_deletions',
        description: `${deletions.length} ações de exclusão`,
        count: deletions.length,
        severity: 'medium' as const
      })
    }

    // 3. Mudanças de configuração de segurança
    const securityChanges = logs.filter(log => 
      ['TWO_FACTOR_DISABLE', 'PASSWORD_CHANGE'].includes(log.action)
    )
    if (securityChanges.length >= 3) {
      suspiciousActivities.push({
        type: 'security_changes',
        description: `${securityChanges.length} mudanças nas configurações de segurança`,
        count: securityChanges.length,
        severity: 'high' as const
      })
    }

    // 4. Atividade fora do horário normal (00:00 - 06:00)
    const nightActivity = logs.filter(log => {
      const hour = log.createdAt.getHours()
      return hour >= 0 && hour <= 6
    })
    if (nightActivity.length >= 5) {
      suspiciousActivities.push({
        type: 'unusual_hours',
        description: `${nightActivity.length} atividades fora do horário normal`,
        count: nightActivity.length,
        severity: 'low' as const
      })
    }

    return { suspiciousActivities }
  } catch (error) {
    console.error('Error detecting suspicious patterns:', error)
    return { suspiciousActivities: [] }
  }
}

/**
 * Exporta logs para CSV (para conformidade)
 */
export async function exportAuditLogsToCSV(filters: {
  startDate: Date
  endDate: Date
  userId?: string
}): Promise<string> {
  try {
    const { logs } = await getAuditLogs({
      ...filters,
      limit: 10000 // Limite alto para export
    })

    const headers = [
      'Data/Hora',
      'Usuário',
      'Email',
      'Ação',
      'Recurso',
      'ID do Recurso',
      'Detalhes',
      'IP',
      'User Agent'
    ]

    const rows = logs.map(log => [
      log.createdAt.toISOString(),
      log.user?.name || 'N/A',
      log.user?.email || 'N/A',
      log.action,
      log.resource,
      log.resourceId || 'N/A',
      JSON.stringify(log.details || {}),
      log.ipAddress,
      log.userAgent || 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    throw new Error('Failed to export audit logs')
  }
}