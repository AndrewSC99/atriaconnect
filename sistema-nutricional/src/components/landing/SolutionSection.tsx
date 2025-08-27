'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Stethoscope, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'

export function SolutionSection() {
  const highlights = [
    {
      icon: Zap,
      title: "Automatização Completa",
      description: "Elimine tarefas manuais e ganhe 3+ horas por dia"
    },
    {
      icon: Target,
      title: "Precisão Científica", 
      description: "Cálculos nutricionais baseados em evidências"
    },
    {
      icon: TrendingUp,
      title: "Crescimento Acelerado",
      description: "Atenda mais pacientes com maior qualidade"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              A Solução Definitiva
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Conheça o{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Átria Connect
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Sistema Nutricional Completo e Integrado que revoluciona o atendimento entre 
              nutricionistas e pacientes através de tecnologia de ponta.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Column - Description */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Heart className="h-12 w-12 text-blue-600 fill-blue-600" />
                  <Stethoscope className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Átria Connect</h3>
                  <p className="text-muted-foreground">Sistema Nutricional Profissional</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-foreground">
                  Plataforma profissional desenvolvida com tecnologia de ponta
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Desenvolvido com Next.js 14, TypeScript e React 19, o Átria Connect oferece 
                  uma experiência moderna, segura e intuitiva que conecta nutricionistas e 
                  pacientes em uma jornada digital de transformação da saúde.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-4">
                {highlights.map((highlight, index) => {
                  const IconComponent = highlight.icon
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground">{highlight.title}</h5>
                        <p className="text-sm text-muted-foreground">{highlight.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link href="/register">
                  <Button size="lg" className="group">
                    Transformar Minha Prática Agora
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
                <CardContent className="p-0">
                  {/* Mock Dashboard Preview */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <h6 className="font-semibold">Dashboard Nutricional</h6>
                        <p className="text-xs opacity-80">Visão completa da prática</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/10 rounded p-3">
                        <div className="text-lg font-bold">47</div>
                        <div className="text-xs">Pacientes</div>
                      </div>
                      <div className="bg-white/10 rounded p-3">
                        <div className="text-lg font-bold">R$ 8.4k</div>
                        <div className="text-xs">Receita</div>
                      </div>
                      <div className="bg-white/10 rounded p-3">
                        <div className="text-lg font-bold">92%</div>
                        <div className="text-xs">Adesão</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-semibold text-foreground">Pacientes Hoje</h6>
                      <Badge variant="secondary">5 consultas</Badge>
                    </div>
                    
                    {['João Silva', 'Maria Santos', 'Pedro Costa'].map((name, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">Consulta concluída</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Technology Badges */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">Construído com tecnologias modernas e seguras:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Next.js 14', 'TypeScript', 'React 19', 'Prisma', '2FA Security', 'LGPD Compliant'].map((tech) => (
                <Badge key={tech} variant="outline" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}