"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardPreview() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-12 text-white">
        {/* Main title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Gerencie sua saúde nutricional de forma eficiente
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Entre para acessar seu dashboard personalizado e acompanhar seu progresso
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {/* Health Metrics Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Métricas de Saúde</h3>
                <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold">85.2</div>
              <div className="text-xs text-blue-200">Pontuação geral</div>
            </CardContent>
          </Card>

          {/* Consultation History Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Consultas</h3>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                  3 esta mês
                </Badge>
              </div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-blue-200">Total realizadas</div>
            </CardContent>
          </Card>

          {/* Current Diet Plan Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Plano Alimentar Atual</h3>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                  Ativo
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-green-300">1,850</div>
                  <div className="text-xs text-blue-200">kcal/dia</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-300">45g</div>
                  <div className="text-xs text-blue-200">Proteínas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-300">65g</div>
                  <div className="text-xs text-blue-200">Gorduras</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Appointments Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Próxima Consulta</h3>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 border-orange-500/30">
                  Em 3 dias
                </Badge>
              </div>
              <div className="text-lg font-bold">Dr. Silva</div>
              <div className="text-xs text-blue-200">15:30 - Segunda-feira</div>
            </CardContent>
          </Card>

          {/* Progress Chart Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Progresso</h3>
                <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
                  +8.5kg
                </Badge>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-xs text-blue-200">75% da meta atingida</div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom text */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm">
            Sistema completo de gestão nutricional com IA e acompanhamento personalizado
          </p>
        </div>
      </div>
    </div>
  )
}
