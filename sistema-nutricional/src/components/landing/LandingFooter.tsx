'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Shield,
  FileText,
  HelpCircle,
  Users,
  BookOpen,
  Zap
} from 'lucide-react'

export function LandingFooter() {
  const footerSections = [
    {
      title: "Produto",
      links: [
        { name: "Funcionalidades", href: "#features" },
        { name: "Planos e Preços", href: "#pricing" },
        { name: "Demonstração", href: "/demo" },
        { name: "Atualizações", href: "/changelog" },
        { name: "Roadmap", href: "/roadmap" }
      ]
    },
    {
      title: "Recursos",
      links: [
        { name: "Central de Ajuda", href: "/help" },
        { name: "Tutoriais", href: "/tutorials" },
        { name: "API Docs", href: "/api" },
        { name: "Webinars", href: "/webinars" },
        { name: "Blog", href: "/blog" }
      ]
    },
    {
      title: "Empresa",
      links: [
        { name: "Sobre Nós", href: "/about" },
        { name: "Carreiras", href: "/careers" },
        { name: "Imprensa", href: "/press" },
        { name: "Parceiros", href: "/partners" },
        { name: "Afiliados", href: "/affiliates" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Termos de Uso", href: "/terms" },
        { name: "Política de Privacidade", href: "/privacy" },
        { name: "LGPD", href: "/lgpd" },
        { name: "Segurança", href: "/security" },
        { name: "SLA", href: "/sla" }
      ]
    }
  ]

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/atriaconnect", name: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/atriaconnect", name: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/atriaconnect", name: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/atriaconnect", name: "YouTube" },
    { icon: Twitter, href: "https://twitter.com/atriaconnect", name: "Twitter" }
  ]

  const certifications = [
    { icon: Shield, name: "ISO 27001" },
    { icon: FileText, name: "LGPD" },
    { icon: Shield, name: "SOC 2" },
    { icon: Heart, name: "HIPAA Ready" }
  ]

  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('#')) {
      const element = document.getElementById(sectionId.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Heart className="h-8 w-8 text-blue-400 fill-blue-400" />
                <Stethoscope className="h-4 w-4 text-green-400 absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Átria Connect</h3>
                <p className="text-xs text-gray-400">Sistema Nutricional</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              A plataforma mais avançada para nutricionistas modernizarem sua prática 
              e oferecerem uma experiência excepcional aos pacientes.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>contato@atriaconnect.com.br</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-green-400" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const SocialIcon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors group"
                    aria-label={social.name}
                  >
                    <SocialIcon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        {link.href.startsWith('#') ? (
                          <button
                            onClick={() => scrollToSection(link.href)}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            {link.name}
                          </button>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Fique por dentro das novidades
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Receba dicas exclusivas, atualizações e conteúdo sobre nutrição digital
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Seu melhor email"
                    className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6">
                    Inscrever
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certifications & Bottom */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Certifications */}
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-400">Certificações:</span>
              <div className="flex items-center space-x-4">
                {certifications.map((cert, index) => {
                  const CertIcon = cert.icon
                  return (
                    <div key={index} className="flex items-center space-x-1 text-xs text-gray-400">
                      <CertIcon className="h-4 w-4" />
                      <span>{cert.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Zap className="mr-1 h-3 w-3" />
                  Teste Grátis
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <HelpCircle className="mr-1 h-3 w-3" />
                  Ajuda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>© 2024 Átria Connect. Todos os direitos reservados.</span>
              <span className="hidden md:inline">•</span>
              <span>CNPJ: 00.000.000/0001-00</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Feito com</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>no Brasil</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="font-medium">Next.js</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}