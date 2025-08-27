'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Check,
  Star,
  Crown,
  ArrowRight,
  Sparkles,
  Users,
  Calculator,
  MessageSquare,
  FileText,
  BarChart3,
  Calendar,
  Smartphone,
  Video,
  Cloud,
  Phone,
  Zap
} from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: "Essencial",
      subtitle: "Para Nutricionistas Iniciantes",
      price: "97",
      period: "mês",
      description: "Perfeito para profissionais que estão começando e querem modernizar seu atendimento",
      color: "blue",
      icon: Users,
      features: [
        { icon: Users, text: "Até 20 pacientes ativos", included: true },
        { icon: BarChart3, text: "Dashboard profissional", included: true },
        { icon: Calculator, text: "Calculadora TMB/GET", included: true },
        { icon: FileText, text: "Tabela TACO básica", included: true },
        { icon: Sparkles, text: "Criador de dietas simples", included: true },
        { icon: FileText, text: "Prontuário eletrônico", included: true },
        { icon: MessageSquare, text: "Chat com pacientes", included: true },
        { icon: FileText, text: "Relatórios em PDF", included: true },
        { icon: MessageSquare, text: "Suporte por email", included: true }
      ],
      cta: "Começar Teste Grátis",
      popular: false
    },
    {
      name: "Profissional",
      subtitle: "Para Consultórios Estabelecidos",
      price: "197",
      period: "mês",
      description: "Solução completa para nutricionistas que querem maximizar resultados e crescer",
      color: "purple",
      icon: Crown,
      features: [
        { icon: Check, text: "Tudo do Plano Essencial", included: true, highlight: true },
        { icon: Users, text: "Pacientes ilimitados", included: true },
        { icon: FileText, text: "Tabela TACO completa (597 alimentos)", included: true },
        { icon: Sparkles, text: "Criador avançado de dietas", included: true },
        { icon: FileText, text: "Templates personalizados", included: true },
        { icon: Calculator, text: "Análise de micronutrientes", included: true },
        { icon: BarChart3, text: "Dashboard financeiro completo", included: true },
        { icon: Zap, text: "Notificações automáticas", included: true },
        { icon: Calendar, text: "Integração com Google Calendar", included: true },
        { icon: Smartphone, text: "App mobile para pacientes", included: true },
        { icon: Video, text: "Videochamada integrada", included: true },
        { icon: Cloud, text: "Backup em nuvem", included: true },
        { icon: Phone, text: "Suporte prioritário WhatsApp", included: true },
        { icon: Star, text: "Personalização da marca", included: true }
      ],
      cta: "Escolher Profissional",
      popular: true
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        border: "border-blue-200 dark:border-blue-800",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      purple: {
        bg: "from-purple-500 to-purple-600", 
        border: "border-purple-200 dark:border-purple-800",
        button: "bg-purple-600 hover:bg-purple-700"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Star className="mr-2 h-4 w-4" />
            Planos e Preços
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Escolha o plano{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ideal
            </span>{' '}
            para você
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Planos flexíveis que crescem com seu consultório. Comece com 7 dias grátis, 
            sem cartão de crédito e cancele quando quiser.
          </p>

          {/* Pricing Toggle */}
          <div className="inline-flex items-center bg-background rounded-lg p-1 border mb-8">
            <div className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
              Mensal
            </div>
            <div className="px-4 py-2 text-muted-foreground text-sm font-medium cursor-not-allowed">
              Anual (em breve)
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {plans.map((plan, index) => {
              const PlanIcon = plan.icon
              const colors = getColorClasses(plan.color)
              
              return (
                <Card key={index} className={`relative group hover:shadow-2xl transition-all duration-300 ${colors.border} ${plan.popular ? 'lg:scale-105 lg:-mt-6' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                        <Crown className="mr-1 h-3 w-3" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colors.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <PlanIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-foreground mb-2">
                      Plano {plan.name}
                    </CardTitle>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.subtitle}
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => {
                        const FeatureIcon = feature.icon
                        return (
                          <div key={featureIndex} className={`flex items-start space-x-3 ${feature.highlight ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-2 rounded-lg' : ''}`}>
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${colors.bg} flex items-center justify-center mt-0.5`}>
                              {feature.highlight ? (
                                <Star className="h-3 w-3 text-white" />
                              ) : (
                                <FeatureIcon className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className={`text-sm ${feature.highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              {feature.text}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Link href="/register">
                        <Button 
                          className={`w-full group ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : colors.button}`}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="text-center text-xs text-muted-foreground">
                      ✅ 7 dias grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ROI Calculator */}
          <div className="mt-16">
            <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Retorno do Investimento em Menos de 30 Dias
                  </h3>
                  <p className="text-muted-foreground">
                    Veja como o Átria Connect se paga e ainda gera lucro:
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">+3h</div>
                    <p className="text-sm text-muted-foreground">Tempo economizado por dia</p>
                    <p className="text-xs text-muted-foreground">= 90h por mês</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">+40%</div>
                    <p className="text-sm text-muted-foreground">Mais pacientes atendidos</p>
                    <p className="text-xs text-muted-foreground">= +R$ 3.200/mês</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">16x</div>
                    <p className="text-sm text-muted-foreground">Retorno do investimento</p>
                    <p className="text-xs text-muted-foreground">ROI em 30 dias</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Exemplo real:</strong> Com o tempo economizado, você pode atender 15 pacientes a mais por mês.
                    <br />
                    15 pacientes × R$ 200 = <strong className="text-green-600">R$ 3.000 extras/mês</strong>
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      Calcular Meu ROI - Teste Grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Notice */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Consultório com +100 pacientes?
                </h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Oferecemos planos corporativos personalizados com desconto e recursos adicionais.
                </p>
                <Button variant="outline" size="sm">
                  Falar com Consultor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}