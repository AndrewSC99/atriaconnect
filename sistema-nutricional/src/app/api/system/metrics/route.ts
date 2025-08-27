import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simples contador de métricas (em produção, usar biblioteca como prom-client)
let metrics = {
  http_requests_total: 0,
  http_request_duration: 0,
  database_connections: 0,
  active_users: 0,
  memory_usage: 0,
  cpu_usage: 0
}

export async function GET() {
  try {
    // Coletar métricas do sistema
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    // Métricas do banco de dados
    const [
      totalUsers,
      totalPatients,
      totalNutritionists,
      totalAppointments,
      totalNotifications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.nutritionist.count(),
      prisma.appointment.count(),
      prisma.notification.count()
    ])

    // Métricas de atividade (últimas 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [
      recentLogins,
      recentAppointments,
      recentNotifications
    ] = await Promise.all([
      prisma.loginAttempt.count({
        where: {
          success: true,
          createdAt: { gte: last24h }
        }
      }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: last24h }
        }
      }),
      prisma.notification.count({
        where: {
          createdAt: { gte: last24h }
        }
      })
    ])

    // Formato Prometheus
    const prometheusMetrics = `
# HELP nodejs_memory_heap_used_bytes Memory heap used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Memory heap total in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}

# HELP nodejs_memory_rss_bytes Memory RSS in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${memoryUsage.rss}

# HELP sistema_nutricional_users_total Total number of users
# TYPE sistema_nutricional_users_total gauge
sistema_nutricional_users_total ${totalUsers}

# HELP sistema_nutricional_patients_total Total number of patients
# TYPE sistema_nutricional_patients_total gauge
sistema_nutricional_patients_total ${totalPatients}

# HELP sistema_nutricional_nutritionists_total Total number of nutritionists
# TYPE sistema_nutricional_nutritionists_total gauge
sistema_nutricional_nutritionists_total ${totalNutritionists}

# HELP sistema_nutricional_appointments_total Total number of appointments
# TYPE sistema_nutricional_appointments_total gauge
sistema_nutricional_appointments_total ${totalAppointments}

# HELP sistema_nutricional_notifications_total Total number of notifications
# TYPE sistema_nutricional_notifications_total gauge
sistema_nutricional_notifications_total ${totalNotifications}

# HELP sistema_nutricional_recent_logins_24h Recent successful logins in 24h
# TYPE sistema_nutricional_recent_logins_24h gauge
sistema_nutricional_recent_logins_24h ${recentLogins}

# HELP sistema_nutricional_recent_appointments_24h Recent appointments in 24h
# TYPE sistema_nutricional_recent_appointments_24h gauge
sistema_nutricional_recent_appointments_24h ${recentAppointments}

# HELP sistema_nutricional_recent_notifications_24h Recent notifications in 24h
# TYPE sistema_nutricional_recent_notifications_24h gauge
sistema_nutricional_recent_notifications_24h ${recentNotifications}

# HELP sistema_nutricional_uptime_seconds Application uptime in seconds
# TYPE sistema_nutricional_uptime_seconds gauge
sistema_nutricional_uptime_seconds ${process.uptime()}

# HELP sistema_nutricional_build_info Build information
# TYPE sistema_nutricional_build_info gauge
sistema_nutricional_build_info{version="${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}",node_version="${process.version}"} 1
`.trim()

    return new NextResponse(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Error collecting metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}