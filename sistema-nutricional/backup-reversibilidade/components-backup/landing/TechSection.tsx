'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Smartphone,
  Monitor,
  Server,
  Lock,
  CheckCircle,
  Gauge,
  Cloud,
  Code
} from 'lucide-react'

export function TechSection() {
  const techFeatures = [
    {
      icon: Zap,
      title: "Performance Ultra-Rápida",
      description: "Carregamento em menos de 2 segundos",
      details: ["Next.js 14 com App Router", "Server-Side Rendering", "Cache inteligente"],
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Disponibilidade Máxima", 
      description: "99.9% uptime garantido",
      details: ["Redundância em múltiplos data centers", "Backup automático", "Recuperação rápida"],
      color: "green"
    },
    {
      icon: Lock,
      title: "Segurança Enterprise",
      description: "Proteção de nível bancário",
      details: ["SSL/TLS 1.3", "Firewall WAF", "Monitoramento 24/7"],
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidade Infinita",
      description: "Suporta milhares de usuários",
      details: ["Auto-scaling automático", "CDN global", "Load balancing"],
      color: "blue"
    },
    {
      icon: Smartphone,
      title: "Multi-Dispositivo",
      description: "Funciona em qualquer tela",
      details: ["PWA otimizada", "App mobile nativo", "Sincronização offline"],
      color: "purple"
    },
    {
      icon: Code,
      title: "Tecnologia Moderna",
      description: "Stack de última geração",
      details: ["React 19", "TypeScript", "Prisma ORM"],
      color: "indigo"
    }
  ]

  const techStack = [
    { category: "Frontend", technologies: ["Next.js 14", "React 19", "TypeScript", "Tailwind CSS"] },
    { category: "Backend", technologies: ["Node.js", "Prisma ORM", "NextAuth.js", "API Routes"] },
    { category: "Database", technologies: ["PostgreSQL", "Redis Cache", "Backup Automático", "Replicação"] },
    { category: "Security", technologies: ["2FA TOTP", "AES-256", "JWT Tokens", "OWASP Guidelines"] },
    { category: "Infrastructure", technologies: ["Docker", "CI/CD", "Monitoring", "Auto-scaling"] },
    { category: "Compliance", technologies: ["LGPD", "ISO 27001", "SOC 2", "HIPAA Ready"] }
  ]

  const performance = [
    { metric: "Carregamento", value: "< 2s", description: "Tempo médio de carregamento", icon: Gauge },
    { metric: "Uptime", value: "99.9%", description: "Disponibilidade garantida", icon: Server },
    { metric: "Latência", value: "< 100ms", description: "Resposta da API", icon: Zap },
    { metric: "Throughput", value: "10k+", description: "Requests por segundo", icon: TrendingUp }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: "from-yellow-500 to-orange-500",
      green: "from-green-500 to-emerald-500",
      red: "from-red-500 to-pink-500",
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-violet-500",
      indigo: "from-indigo-500 to-blue-500"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Monitor className="mr-2 h-4 w-4" />
            Tecnologia e Infraestrutura
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Construído com{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tecnologia de Ponta
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Infraestrutura robusta, segura e escalável que garante performance excepcional 
            e confiabilidade total para sua prática profissional.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Technical Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {techFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getColorClasses(feature.color)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FeatureIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Performance Metrics */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Métricas de Performance
              </h3>
              <p className="text-muted-foreground">
                Números que garantem uma experiência excepcional
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {performance.map((metric, index) => {
                const MetricIcon = metric.icon
                return (
                  <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <MetricIcon className="h-10 w-10 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {metric.value}
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {metric.metric}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {metric.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Stack Tecnológico
              </h3>
              <p className="text-muted-foreground">
                Tecnologias modernas e confiáveis que garantem qualidade e performance
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((stack, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground text-center group-hover:text-blue-600 transition-colors">
                      {stack.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {stack.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <span className="text-sm font-medium text-foreground">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="text-center">
            <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Segurança e Conformidade Total
                </h3>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Atendemos aos mais rigorosos padrões de segurança e privacidade, 
                  garantindo total proteção dos dados dos seus pacientes.
                </p>
                
                <div className="grid md:grid-cols-4 gap-6 text-sm">
                  {[
                    { icon: Lock, label: "LGPD Compliant", desc: "Lei de proteção de dados" },
                    { icon: Shield, label: "ISO 27001", desc: "Gestão de segurança" },
                    { icon: CheckCircle, label: "SOC 2 Type II", desc: "Auditoria de controles" },
                    { icon: Globe, label: "HIPAA Ready", desc: "Padrão internacional" }
                  ].map((cert, index) => {
                    const CertIcon = cert.icon
                    return (
                      <div key={index} className="text-center">
                        <CertIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-foreground">{cert.label}</div>
                        <div className="text-xs text-muted-foreground">{cert.desc}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4" />
                      <span>Backup automático</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>Monitoramento 24/7</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Recuperação instantânea</span>
                    </div>
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