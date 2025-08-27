'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket,
  Gift,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  FileText,
  Award,
  Timer,
  Users,
  Star
} from 'lucide-react'

export function CTAFinalSection() {
  const bonuses = [
    {
      icon: BookOpen,
      title: "Biblioteca Exclusiva",
      description: "200+ receitas saudáveis categorizadas",
      value: "R$ 297"
    },
    {
      icon: GraduationCap,
      title: "Curso Digital Marketing",
      description: "Marketing Digital para Nutricionistas",
      value: "R$ 497"
    },
    {
      icon: FileText,
      title: "Templates Profissionais",
      description: "Documentos e modelos prontos",
      value: "R$ 197"
    },
    {
      icon: Award,
      title: "Certificação Exclusiva",
      description: "Certificado 'Nutricionista Digital'",
      value: "R$ 97"
    }
  ]

  const guarantees = [
    { icon: CheckCircle, text: "7 dias grátis" },
    { icon: CheckCircle, text: "Sem cartão de crédito" },
    { icon: CheckCircle, text: "Cancelamento a qualquer momento" },
    { icon: CheckCircle, text: "Suporte completo incluído" },
    { icon: CheckCircle, text: "Migração gratuita de dados" }
  ]

  const urgencyFactors = [
    { icon: Users, text: "Apenas 100 vagas disponíveis" },
    { icon: Timer, text: "Oferta válida por tempo limitado" },
    { icon: Star, text: "Bônus exclusivos para primeiros usuários" }
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-white/20 text-white border-white/20">
              <Rocket className="mr-2 h-4 w-4" />
              Oferta Limitada
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6">
              Revolucione Sua Prática
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Nutricional em 7 Dias!
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transforme seu consultório em um negócio digital de sucesso com o sistema 
              mais avançado do mercado + bônus exclusivos por tempo limitado.
            </p>
          </div>

          {/* Main Offer */}
          <Card className="bg-white/10 backdrop-blur border-white/20 mb-12 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Left: Main CTA */}
                <div className="text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Teste GRÁTIS por 7 Dias
                  </h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Acesso completo a todas as funcionalidades do Plano Profissional 
                    sem qualquer custo ou compromisso.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {guarantees.map((guarantee, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <guarantee.icon className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-white">{guarantee.text}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 group">
                      COMEÇAR TESTE GRÁTIS AGORA
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>

                {/* Right: Bonuses */}
                <div className="text-left">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Gift className="h-6 w-6" />
                      <span className="font-bold text-lg">BÔNUS EXCLUSIVOS</span>
                    </div>
                    <p className="text-sm font-medium">
                      Apenas para os primeiros 100 nutricionistas
                    </p>
                  </div>

                  <div className="space-y-4">
                    {bonuses.map((bonus, index) => {
                      const BonusIcon = bonus.icon
                      return (
                        <div key={index} className="flex items-center space-x-4 bg-white/5 rounded-lg p-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                            <BonusIcon className="h-5 w-5 text-black" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{bonus.title}</h4>
                            <p className="text-sm text-blue-100">{bonus.description}</p>
                          </div>
                          <div className="text-yellow-400 font-bold">{bonus.value}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        Valor Total: R$ 1.088
                      </div>
                      <div className="text-green-100">
                        Seu investimento: Apenas R$ 197/mês
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgency */}
          <div className="mb-12">
            <Card className="bg-red-500/20 border-red-400/30 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Clock className="h-6 w-6 text-red-400" />
                  <span className="font-bold text-lg text-red-400">OFERTA POR TEMPO LIMITADO</span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {urgencyFactors.map((factor, index) => {
                    const FactorIcon = factor.icon
                    return (
                      <div key={index} className="flex items-center justify-center space-x-2 text-red-200">
                        <FactorIcon className="h-4 w-4" />
                        <span>{factor.text}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="mb-12">
            <p className="text-blue-100 mb-6">
              Junte-se a mais de 1.250 nutricionistas que já transformaram suas práticas:
            </p>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { number: "+1.250", label: "Nutricionistas" },
                { number: "+15k", label: "Pacientes Ativos" },
                { number: "85%", label: "Taxa de Adesão" },
                { number: "4.9★", label: "Satisfação" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Não Perca Esta Oportunidade Única!
            </h3>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Comece hoje mesmo a transformar sua prática nutricional e multiplique 
              seus resultados com tecnologia de ponta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 group">
                  GARANTIR MINHA VAGA AGORA
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Já sou cliente
                </Button>
              </Link>
            </div>

            <div className="text-sm text-blue-200 space-y-1">
              <p>✅ Sem risco • ✅ Sem pegadinhas • ✅ Cancelamento fácil</p>
              <p>🔒 Pagamento 100% seguro • 🛡️ Dados protegidos • 🇧🇷 Empresa brasileira</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}