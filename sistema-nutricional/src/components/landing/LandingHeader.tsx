'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Heart, Stethoscope } from 'lucide-react'

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const navItems = [
    { label: 'Funcionalidades', id: 'features' },
    { label: 'Benefícios', id: 'benefits' },
    { label: 'Planos', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-600" />
              <Stethoscope className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Átria Connect</h1>
              <p className="text-xs text-muted-foreground leading-none">Sistema Nutricional</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Teste Grátis
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="relative">
                    <Heart className="h-6 w-6 text-blue-600 fill-blue-600" />
                    <Stethoscope className="h-3 w-3 text-green-500 absolute -bottom-1 -right-1" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Átria Connect</h2>
                    <p className="text-xs text-muted-foreground">Sistema Nutricional</p>
                  </div>
                </div>

                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left p-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full" onClick={() => setIsOpen(false)}>
                      Teste Grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}