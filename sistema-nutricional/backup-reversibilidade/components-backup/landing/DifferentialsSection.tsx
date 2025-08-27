'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin,
  Shield,
  Smartphone,
  BarChart3,
  Users,
  RefreshCw,
  Link2,
  DollarSign,
  Flag,
  Crown,
  Sparkles
} from 'lucide-react'

export function DifferentialsSection() {
  const differentials = [
    {
      icon: Flag,
      title: "Sistema 100% Brasileiro",
      description: "Desenvolvido especificamente para o mercado brasileiro com Tabela TACO oficial, alimentos regionais, legislação LGPD e suporte em português.",
      highlights: ["Tabela TACO oficial", "Alimentos regionais", "LGPD compliance"],
      color: "green"
    },
    {
      icon: Shield,
      title: "Segurança Bancária",
      description: "Criptografia AES-256, autenticação 2FA, logs de auditoria e proteção de dados com o mesmo nível de segurança dos bancos digitais.",
      highlights: ["Criptografia AES-256", "2FA obrigatório", "Auditoria completa"],
      color: "blue"
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Interface otimizada para celular, aplicativo nativo em desenvolvimento, funciona perfeitamente offline e sincronização automática.",
      highlights: ["App nativo", "Funciona offline", "Sincronização auto"],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Inteligência de Dados",
      description: "Relatórios inteligentes, insights automáticos, previsões de abandono, análise de padrões e recomendações personalizadas.",
      highlights: ["Insights automáticos", "Previsão de abandono", "IA integrada"],
      color: "orange"
    },
    {
      icon: Users,
      title: "Suporte Humanizado",
      description: "Time especializado em nutrição, suporte técnico 24/7, onboarding personalizado e webinars exclusivos para usuários.",
      highlights: ["Time especializado", "Suporte 24/7", "Onboarding grátis"],
      color: "pink"
    },
    {
      icon: RefreshCw,
      title: "Atualizações Constantes",
      description: "Novas funcionalidades mensais, feedback dos usuários implementado, roadmap público e sempre na vanguarda tecnológica.",
      highlights: ["Updates mensais", "Feedback implementado", "Roadmap público"],
      color: "indigo"
    },
    {
      icon: Link2,
      title: "Integração Total",
      description: "Nutricionista e paciente conectados em tempo real, sincronização bidirecional, comunicação fluida e experiência unificada.",
      highlights: ["Tempo real", "Sincronização total", "Experiência única"],
      color: "cyan"
    },
    {
      icon: DollarSign,
      title: "Preço Justo",
      description: "ROI comprovado em menos de 30 dias, sem taxas ocultas, planos flexíveis e custo-benefício imbatível no mercado.",
      highlights: ["ROI em 30 dias", "Sem taxas ocultas", "Melhor custo-benefício"],
      color: "yellow"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: "from-green-500 to-emerald-500",
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-violet-500",
      orange: "from-orange-500 to-red-500",
      pink: "from-pink-500 to-rose-500",
      indigo: "from-indigo-500 to-purple-500",
      cyan: "from-cyan-500 to-teal-500",
      yellow: "from-yellow-500 to-orange-500"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getBorderColorClasses = (color: string) => {
    const colors = {
      green: "border-green-200 dark:border-green-800",
      blue: "border-blue-200 dark:border-blue-800",
      purple: "border-purple-200 dark:border-purple-800",
      orange: "border-orange-200 dark:border-orange-800",
      pink: "border-pink-200 dark:border-pink-800",
      indigo: "border-indigo-200 dark:border-indigo-800",
      cyan: "border-cyan-200 dark:border-cyan-800",
      yellow: "border-yellow-200 dark:border-yellow-800"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Crown className="mr-2 h-4 w-4" />
            Diferenciais Únicos
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Por que escolher o{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Átria Connect?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Características únicas que nos tornam a melhor escolha para nutricionistas 
            que buscam excelência e resultados excepcionais.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {differentials.map((differential, index) => {
              const DifferentialIcon = differential.icon
              return (
                <Card key={index} className={`group hover:shadow-xl transition-all duration-300 ${getBorderColorClasses(differential.color)} hover:border-opacity-60`}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getColorClasses(differential.color)} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <DifferentialIcon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                        {differential.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed text-center">
                      {differential.description}
                    </p>
                    
                    {/* Highlights */}
                    <div className="space-y-2">
                      {differential.highlights.map((highlight, highlightIndex) => (
                        <div key={highlightIndex} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getColorClasses(differential.color)}`} />
                          <span className="text-xs text-muted-foreground font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Comparison Table Preview */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Comparação com a Concorrência
              </h3>
              <p className="text-muted-foreground">
                Veja por que somos a melhor opção do mercado
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <tr>
                        <th className="text-left p-4 font-semibold text-foreground">Características</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Átria Connect</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Concorrente A</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Concorrente B</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Sistema Manual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { feature: "Tabela TACO Completa", us: "✅ 597 alimentos", a: "❌ Limitada", b: "✅ Básica", manual: "❌ Não possui" },
                        { feature: "App Mobile Nativo", us: "✅ iOS + Android", a: "❌ Apenas web", b: "✅ Limitado", manual: "❌ Não possui" },
                        { feature: "Segurança 2FA", us: "✅ Obrigatório", a: "⚠️ Opcional", b: "❌ Não possui", manual: "❌ Não possui" },
                        { feature: "Suporte Especializado", us: "✅ 24/7 Nutrição", a: "⚠️ Genérico", b: "⚠️ Limitado", manual: "❌ Não possui" },
                        { feature: "Inteligência Artificial", us: "✅ Insights automáticos", a: "❌ Não possui", b: "❌ Não possui", manual: "❌ Não possui" },
                        { feature: "Preço Mensal", us: "R$ 97-197", a: "R$ 299+", b: "R$ 149+", manual: "Grátis*" }
                      ].map((row, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="p-4 font-medium text-foreground">{row.feature}</td>
                          <td className="p-4 text-center text-blue-600 font-semibold">{row.us}</td>
                          <td className="p-4 text-center text-muted-foreground">{row.a}</td>
                          <td className="p-4 text-center text-muted-foreground">{row.b}</td>
                          <td className="p-4 text-center text-muted-foreground">{row.manual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    * Sistema manual é "grátis", mas custa tempo, produtividade e oportunidades perdidas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Winner Badge */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  #1 Sistema Nutricional do Brasil
                </h3>
                <p className="text-muted-foreground mb-6">
                  Eleito pelos próprios nutricionistas como a melhor ferramenta para 
                  modernizar e fazer crescer a prática profissional.
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-foreground">4.9★</div>
                    <div className="text-muted-foreground">Avaliação</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">95%</div>
                    <div className="text-muted-foreground">Recomendação</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">1000+</div>
                    <div className="text-muted-foreground">Nutricionistas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}