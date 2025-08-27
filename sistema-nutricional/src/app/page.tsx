"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Users, 
  Calculator,
  BarChart3,
  Calendar,
  MessageSquare,
  Target,
  Clock,
  CheckCircle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Shield,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Award,
  Brain,
  Rocket,
  Play,
  Smartphone,
  CreditCard,
  LineChart,
  AlertCircle,
  Timer,
  DollarSign,
  PieChart,
  Bot,
  Stethoscope,
  Activity
} from "lucide-react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    nutricionistas: 1247,
    pacientes: 18492,
    consultas: 847,
    satisfacao: 4.9
  })

  useEffect(() => {
    setIsVisible(true)
    // Simular stats em tempo real (intervalos maiores para melhor performance)
    const interval = setInterval(() => {
      setStats(prev => ({
        nutricionistas: prev.nutricionistas + Math.floor(Math.random() * 2),
        pacientes: prev.pacientes + Math.floor(Math.random() * 5),
        consultas: prev.consultas + Math.floor(Math.random() * 3),
        satisfacao: 4.9
      }))
    }, 60000) // Mudado de 30s para 60s para melhor performance
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 dot-pattern opacity-20" />
      
      {/* Header Moderno */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-colored">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-950">Átria Connect</h1>
                <p className="text-sm text-zinc-500">Nutrição Inteligente</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#funcionalidades" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                Funcionalidades
              </Link>
              <Link href="#precos" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                Preços
              </Link>
              <Link href="#casos" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                Casos de Sucesso
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-700 hover:text-zinc-950">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-colored transition-all duration-300 group border border-blue-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Teste Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Impacto Imediato */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
              <Badge className="bg-blue-100 border-blue-200 text-blue-800">
                <Bot className="w-4 h-4 mr-2" />
                🚀 IA Nutricional Mais Avançada do Brasil
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-zinc-950">Multiplique seus</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Resultados
                  </span>
                  <br />
                  <span className="text-zinc-950">com IA</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
                  O único sistema brasileiro que combina <strong>Tabela TACO</strong>, 
                  IA avançada e gestão completa para nutricionistas que buscam 
                  <span className="text-blue-600 font-semibold"> resultados extraordinários</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-colored transition-all duration-500 group px-8 py-4 text-lg border border-blue-600">
                    <Rocket className="mr-3 w-5 h-5 group-hover:animate-bounce" />
                    Testar 7 Dias Grátis
                    <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 px-8 py-4 text-lg group">
                  <Play className="mr-3 w-5 h-5" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-zinc-950">{stats.nutricionistas.toLocaleString()}</div>
                  <div className="text-sm text-zinc-500">Nutricionistas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-zinc-950">{stats.pacientes.toLocaleString()}</div>
                  <div className="text-sm text-zinc-500">Pacientes Ativos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-zinc-950">{stats.satisfacao}</span>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-sm text-zinc-500">Satisfação</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock Dashboard */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-950">Dashboard Hoje</h3>
                    <Badge className="bg-green-100 text-green-700">Em tempo real</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardContent className="p-4 text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-zinc-950">{stats.consultas}</div>
                        <div className="text-sm text-zinc-500">Consultas hoje</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-zinc-950">R$ 3.2k</div>
                        <div className="text-sm text-zinc-500">Faturamento</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Metas do mês</span>
                      <span className="text-sm font-semibold text-green-600">87%</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white border border-zinc-200 w-16 h-16 rounded-2xl flex items-center justify-center animate-float shadow-lg">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-zinc-200 w-20 h-20 rounded-2xl flex items-center justify-center animate-float shadow-lg" style={{animationDelay: '2s'}}>
                <LineChart className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema-Solução Section */}
      <section className="py-24 bg-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Problema Atual
                </Badge>
                <h2 className="text-4xl font-bold text-zinc-950">
                  Ainda usando <span className="text-red-600">planilhas</span> e calculadoras?
                </h2>
                <div className="space-y-4 text-zinc-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                    <p>Perda de tempo com cálculos manuais repetitivos</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                    <p>Pacientes abandonam o tratamento por falta de acompanhamento</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                    <p>Dificuldade para escalar e atender mais pacientes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                    <p>Falta de insights para otimizar resultados</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Nossa Solução
                </Badge>
                <h2 className="text-4xl font-bold text-zinc-950">
                  <span className="text-green-600">Automatize tudo</span> com IA Nutricional
                </h2>
                <div className="space-y-4 text-zinc-600">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p>Cálculos automáticos com IA e Tabela TACO completa</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p>Engajamento 85% maior com app personalizado</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p>Atenda 3x mais pacientes no mesmo tempo</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p>Dashboard preditivo com insights de IA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="funcionalidades" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-zinc-100 border-zinc-200 text-zinc-700">
              <Zap className="w-4 h-4 mr-2" />
              Funcionalidades Completas
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-950">
              Tudo que você precisa
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                em uma plataforma
              </span>
            </h2>
            <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
              Desenvolvido especialmente para nutricionistas brasileiros, 
              com IA avançada e integração completa com a Tabela TACO
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calculator,
                title: "IA Nutricional Avançada",
                description: "Cálculos automáticos de TMB, GET e distribuição de macros com precisão de 99.7% usando algoritmos de machine learning",
                features: ["Tabela TACO 2024 completa", "Algoritmos ML proprietários", "Cálculo instantâneo", "Sugestões inteligentes"],
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Gestão 360° do Consultório",
                description: "Dashboard financeiro completo, agendamento inteligente e previsão de no-shows com IA para otimizar sua agenda",
                features: ["Dashboard financeiro", "Agendamento IA", "Previsão no-show", "Métricas em tempo real"],
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Smartphone,
                title: "App White-Label",
                description: "Aplicativo personalizado para seus pacientes com sua marca, gamificação e acompanhamento em tempo real",
                features: ["Sua marca", "Gamificação", "Push notifications", "Chat integrado"],
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: FileText,
                title: "Prontuário Inteligente",
                description: "Sistema completo de prontuários digitais com análise automática de padrões e evolução preditiva",
                features: ["Análise automática", "Evolução preditiva", "Histórico completo", "LGPD compliant"],
                color: "from-orange-500 to-red-500"
              },
              {
                icon: LineChart,
                title: "Dashboard Preditivo",
                description: "Analytics em tempo real com previsões de resultados e recomendações baseadas em big data nutricional",
                features: ["Análise preditiva", "Big data nutricional", "KPIs inteligentes", "Relatórios automáticos"],
                color: "from-indigo-500 to-blue-500"
              },
              {
                icon: Target,
                title: "Planos Adaptativos",
                description: "Criação automática de dietas que se adaptam baseada no feedback e resultados em tempo real do paciente",
                features: ["Adaptação tempo real", "15.000+ receitas", "Restrições automáticas", "Substituições IA"],
                color: "from-teal-500 to-green-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover-lift group shadow-modern bg-white border-zinc-200">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-colored transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-950">{feature.title}</CardTitle>
                  <CardDescription className="text-zinc-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.features.map((feat, featIndex) => (
                      <li key={featIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-zinc-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 bg-zinc-100/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-zinc-100 border-zinc-200 text-zinc-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Planos Transparentes
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-950">
              Preços que cabem
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                no seu bolso
              </span>
            </h2>
            <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
              7 dias grátis para testar tudo. Sem cartão de crédito. 
              Sem compromisso. <strong>Cancele quando quiser.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Essencial",
                price: "97",
                description: "Ideal para nutricionistas iniciantes",
                popular: false,
                savings: null,
                features: [
                  "Até 50 pacientes ativos",
                  "IA nutricional básica",
                  "Tabela TACO completa",
                  "Prontuário digital",
                  "Dashboard essencial", 
                  "Suporte por email",
                  "App básico para pacientes"
                ]
              },
              {
                name: "Profissional",
                price: "197",
                originalPrice: "247",
                description: "Para nutricionistas que querem crescer",
                popular: true,
                savings: "Economize R$ 600/ano",
                features: [
                  "Pacientes ilimitados",
                  "IA nutricional completa",
                  "App white-label personalizado",
                  "Dashboard preditivo avançado",
                  "Automações inteligentes",
                  "Integrações premium",
                  "Chat e videochamada",
                  "Relatórios personalizados",
                  "Suporte prioritário"
                ]
              },
              {
                name: "Clínica",
                price: "397",
                description: "Para clínicas e grandes operações",
                popular: false,
                savings: "Melhor custo-benefício",
                features: [
                  "Tudo do Profissional",
                  "Multi-usuários ilimitados",
                  "Dashboard executivo",
                  "White-label completo",
                  "Integrações enterprise",
                  "API dedicada",
                  "Consultoria especializada",
                  "SLA 99.9%",
                  "Suporte 24/7 dedicado"
                ]
              }
            ].map((plan, index) => (
              <Card key={index} className={`hover-lift shadow-modern-xl bg-white border-zinc-200 relative overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500/50 shadow-colored scale-105' : ''
              }`}>
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-secondary" />
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-secondary text-white border-0 shadow-lg">
                      <Star className="w-4 h-4 mr-1" />
                      Mais Escolhido
                    </Badge>
                  </>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-zinc-950 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-zinc-950">R$ {plan.price}</span>
                      <div className="flex flex-col">
                        {plan.originalPrice && (
                          <span className="text-lg text-zinc-400 line-through">R$ {plan.originalPrice}</span>
                        )}
                        <span className="text-zinc-500">/mês</span>
                      </div>
                    </div>
                    {plan.savings && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-zinc-600">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/register">
                    <Button 
                      className={`w-full hover-glow transition-all duration-300 group ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-colored border border-blue-600' 
                          : 'bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950'
                      }`}
                      size="lg"
                    >
                      Começar Teste Grátis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ROI Calculator Preview */}
          <div className="mt-20">
            <Card className="bg-white border-zinc-200 shadow-xl max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-zinc-950 mb-2">
                  Calcule seu ROI
                </CardTitle>
                <CardDescription>
                  Veja quanto você pode economizar e ganhar com o Átria Connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <div className="text-3xl font-bold text-zinc-950 mb-2">47 min</div>
                    <p className="text-zinc-600">Economizados por consulta</p>
                  </div>
                  <div>
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <div className="text-3xl font-bold text-zinc-950 mb-2">+180%</div>
                    <p className="text-zinc-600">Aumento no faturamento</p>
                  </div>
                  <div>
                    <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <div className="text-3xl font-bold text-zinc-950 mb-2">3x mais</div>
                    <p className="text-zinc-600">Pacientes atendidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="casos" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-zinc-100 border-zinc-200 text-zinc-700">
              <Award className="w-4 h-4 mr-2" />
              Casos de Sucesso
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-950">
              Nutricionistas já estão
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                transformando vidas
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dra. Ana Silva",
                role: "Nutricionista Clínica • São Paulo",
                avatar: "AS",
                content: "O Átria Connect multiplicou minha produtividade por 4x. A IA nutricional prevê resultados e meus pacientes adoram o app personalizado. ROI de 340% em apenas 6 meses!",
                metrics: ["4x produtividade", "340% ROI", "95% satisfação pacientes"],
                rating: 5
              },
              {
                name: "Dr. Carlos Mendes", 
                role: "Nutricionista Esportivo • Rio de Janeiro",
                avatar: "CM",
                content: "Impressionante! Os cálculos automáticos com IA e Tabela TACO economizam 3h/dia. Consegui aumentar 60% minha receita mensal atendendo atletas profissionais.",
                metrics: ["3h economizadas/dia", "+60% receita", "100+ atletas"],
                rating: 5
              },
              {
                name: "Dra. Marina Costa",
                role: "Diretora • Clínica Nutricional Premium",
                avatar: "MC",
                content: "Implementamos em nossa clínica com 12 nutricionistas. O sistema pagou-se em 2 meses! Pacientes 85% mais engajados e receita cresceu 120% no primeiro ano.",
                metrics: ["12 nutricionistas", "85% engajamento", "120% crescimento"],
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover-lift group shadow-modern-xl bg-white border-zinc-200">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-zinc-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {testimonial.metrics.map((metric, metricIndex) => (
                      <Badge key={metricIndex} className="bg-blue-100 text-blue-700 text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold mr-4 group-hover:shadow-glow transition-all">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-950">{testimonial.name}</div>
                      <div className="text-sm text-zinc-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final com Urgency */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-green-600/5" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <Badge className="mb-8 bg-blue-600 text-white border border-blue-600 animate-pulse-glow">
            <Timer className="w-4 h-4 mr-2" />
            🎯 Oferta Especial - Primeiros 100 Clientes
          </Badge>
          
          <h2 className="text-4xl md:text-7xl font-bold mb-8 leading-tight text-zinc-950">
            Pronto para
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Revolucionar?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-zinc-600 mb-12 max-w-4xl mx-auto">
            Junte-se a <strong>{stats.nutricionistas.toLocaleString()} nutricionistas</strong> que já descobriram o futuro da nutrição digital.
            <br />
            <span className="text-blue-600 font-semibold">Seus primeiros 7 dias são totalmente grátis!</span>
          </p>
          
          <div className="mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-colored transition-all duration-500 group px-12 py-6 text-xl shadow-2xl border border-blue-600">
                <Rocket className="mr-3 w-6 h-6 group-hover:animate-bounce" />
                Começar Transformação Grátis
                <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-zinc-600 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <Shield className="w-5 h-5 mr-3 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center justify-center">
              <Users className="w-5 h-5 mr-3 text-purple-500" />
              <span>Suporte especializado</span>
            </div>
            <div className="flex items-center justify-center">
              <Award className="w-5 h-5 mr-3 text-orange-500" />
              <span>Garantia 30 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-colored">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-950">Átria Connect</h3>
                  <p className="text-sm text-zinc-600">Nutrição Inteligente</p>
                </div>
              </div>
              <p className="text-zinc-600 leading-relaxed mb-6">
                Desenvolvido por nutricionistas, para nutricionistas brasileiros. 
                Transformando vidas com IA e tecnologia de ponta.
              </p>
            </div>
            
            {[
              {
                title: "Produto",
                links: ["Funcionalidades", "Preços", "Integrações", "API", "Segurança"]
              },
              {
                title: "Suporte", 
                links: ["Central de Ajuda", "Tutoriais", "Contato", "Status", "Comunidade"]
              },
              {
                title: "Legal",
                links: ["Privacidade", "Termos", "LGPD", "Cookies", "Compliance"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-zinc-950 mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="/login" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-zinc-400/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-600 text-sm">
              © 2024 Átria Connect. Todos os direitos reservados.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <Heart className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-zinc-600 text-sm">Feito com amor para nutricionistas brasileiros</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}