'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Star,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Revolução Digital na Nutrição
          </Badge>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Revolucione Sua Prática{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nutricional
            </span>{' '}
            com Tecnologia de Ponta
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto">
            O Único Sistema que Transforma sua Prática Nutricional em um{' '}
            <span className="font-semibold text-foreground">Negócio Digital de Sucesso</span>
          </p>

          {/* Impact Statistics */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">40%</span>
              </div>
              <p className="text-xs text-muted-foreground">+ Produtividade</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1 text-green-600">
                <DollarSign className="h-5 w-5" />
                <span className="text-2xl font-bold">35%</span>
              </div>
              <p className="text-xs text-muted-foreground">+ Faturamento</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1 text-blue-600">
                <Target className="h-5 w-5" />
                <span className="text-2xl font-bold">85%</span>
              </div>
              <p className="text-xs text-muted-foreground">Adesão Pacientes</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1 text-purple-600">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-2xl font-bold">92%</span>
              </div>
              <p className="text-xs text-muted-foreground">Satisfação</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link href="/register">
              <Button size="lg" className="group w-full sm:w-auto">
                TESTE GRÁTIS POR 7 DIAS
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Já sou cliente
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Suporte completo</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <p className="text-muted-foreground">Confiado por nutricionistas em todo o Brasil</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "O Átria Connect transformou completamente minha prática. Agora atendo 40% mais pacientes com a mesma qualidade."
                </p>
                <p className="font-semibold text-sm">Dra. Maria Silva, CRN 12345</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "A ferramenta de cálculo nutricional e tabela TACO economizam horas do meu dia. Recomendo para todos os colegas."
                </p>
                <p className="font-semibold text-sm">Dr. João Santos, CRN 67890</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "Meus pacientes adoram o app. A taxa de adesão aumentou drasticamente desde que comecei a usar."
                </p>
                <p className="font-semibold text-sm">Dra. Ana Costa, CRN 11223</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}