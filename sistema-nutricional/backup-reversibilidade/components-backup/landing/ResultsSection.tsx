'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Heart,
  BookOpen,
  TrendingUp,
  Star,
  CheckCircle,
  Award,
  Target,
  Timer,
  DollarSign,
  Zap,
  BarChart3
} from 'lucide-react'

export function ResultsSection() {
  const stats = [
    {
      icon: Users,
      number: "1,250+",
      label: "Nutricionistas Ativos",
      description: "Profissionais confiam no Átria Connect",
      color: "blue"
    },
    {
      icon: Heart,
      number: "15,000+",
      label: "Pacientes Cadastrados",
      description: "Vidas transformadas pela plataforma",
      color: "red"
    },
    {
      icon: BookOpen,
      number: "50,000+",
      label: "Dietas Criadas",
      description: "Planos alimentares personalizados",
      color: "green"
    },
    {
      icon: TrendingUp,
      number: "85%",
      label: "Taxa de Adesão",
      description: "Pacientes seguem o tratamento até o fim",
      color: "purple"
    },
    {
      icon: Star,
      number: "4.9★",
      label: "Avaliação Média",
      description: "Satisfação comprovada dos usuários",
      color: "yellow"
    },
    {
      icon: CheckCircle,
      number: "95%",
      label: "Taxa de Retenção",
      description: "Nutricionistas renovam mensalmente",
      color: "emerald"
    }
  ]

  const testimonials = [
    {
      name: "Dra. Marina Silva",
      role: "Nutricionista Clínica - CRN 1234",
      location: "São Paulo, SP",
      result: "+60% faturamento em 6 meses",
      quote: "O Átria Connect revolucionou minha prática. Consegui aumentar meu faturamento em 60% nos primeiros 6 meses, atendendo mais pacientes com maior qualidade. A ferramenta de cálculo nutricional economiza 2 horas por dia!",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "Dr. Carlos Mendes", 
      role: "Nutricionista Esportivo - CRN 5678",
      location: "Rio de Janeiro, RJ",
      result: "De 30 para 120 pacientes",
      quote: "Antes eu atendia 30 pacientes com muito esforço. Hoje atendo 120 com a mesma tranquilidade. O sistema de gestão é fantástico e meus pacientes adoram o app. Taxa de abandono caiu para apenas 15%!",
      rating: 5,
      avatar: "👨‍⚕️"
    },
    {
      name: "Dra. Ana Beatriz",
      role: "Nutricionista Materno-Infantil - CRN 9101",
      location: "Belo Horizonte, MG", 
      result: "92% dos pacientes atingem metas",
      quote: "Trabalho com gestantes e crianças. O acompanhamento em tempo real permitiu que 92% das minhas pacientes atingissem as metas de ganho de peso. Os pais também participam mais do processo!",
      rating: 5,
      avatar: "👩‍⚕️"
    }
  ]

  const achievements = [
    {
      icon: Timer,
      title: "3+ Horas Economizadas",
      subtitle: "Por dia, por nutricionista",
      description: "Automatização de tarefas repetitivas"
    },
    {
      icon: DollarSign,
      title: "ROI de 1.600%",
      subtitle: "Retorno em 30 dias",
      description: "Investimento que se paga rapidamente"
    },
    {
      icon: Target,
      title: "78% Atingem Metas",
      subtitle: "Taxa de sucesso dos pacientes",
      description: "Muito acima da média do mercado"
    },
    {
      icon: Zap,
      title: "99.9% Uptime",
      subtitle: "Disponibilidade garantida",
      description: "Sistema sempre funcionando"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      red: "text-red-600",
      green: "text-green-600", 
      purple: "text-purple-600",
      yellow: "text-yellow-600",
      emerald: "text-emerald-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Award className="mr-2 h-4 w-4" />
            Resultados Comprovados
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Números que{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Impressionam
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Mais de 1.250 nutricionistas já transformaram suas práticas com o Átria Connect. 
            Veja os resultados reais e comprove a eficácia da plataforma.
          </p>
        </div>

        {/* Main Statistics */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 text-center">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <StatIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${getColorClasses(stat.color)}`}>
                      {stat.number}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {stat.label}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Histórias de Sucesso Reais
            </h3>
            <p className="text-muted-foreground">
              Nutricionistas que transformaram suas práticas com o Átria Connect
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>

                  {/* Result Highlight */}
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {testimonial.result}
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-muted-foreground text-sm leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Conquistas que Fazem a Diferença
            </h3>
            <p className="text-muted-foreground">
              Métricas que mostram o impacto real do Átria Connect
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {achievements.map((achievement, index) => {
              const AchievementIcon = achievement.icon
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <AchievementIcon className="h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      {achievement.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Industry Recognition */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Reconhecimento da Categoria
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                O Átria Connect é reconhecido por conselhos regionais de nutrição e 
                universidades como a ferramenta mais avançada para modernização da prática nutricional.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Aprovado por CRNs</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Usado em universidades</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificado ISO 27001</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}