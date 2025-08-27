'use client'

import { ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/shared/logout-button'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { useMessages } from '@/hooks/useMessages'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Calendar,
  Calculator,
  Home,
  Users,
  BookOpen,
  BarChart3,
  User,
  Settings,
  Bell,
  MessageSquare,
  FileText,
  Database
} from 'lucide-react'

interface NutritionistLayoutProps {
  children: ReactNode
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/nutritionist/dashboard',
    icon: Home
  },
  {
    title: 'Pacientes',
    href: '/nutritionist/patients',
    icon: Users
  },
  {
    title: 'Prontuários',
    href: '/nutritionist/prontuarios',
    icon: FileText
  },
  {
    title: 'Tabela Nutricional',
    href: '/nutritionist/tabela-taco',
    icon: Database,
    hasSubmenu: true,
    submenu: [
      {
        title: 'Tabela TACO',
        href: '/nutritionist/tabela-taco?source=taco',
        description: 'Tabela Brasileira de Composição de Alimentos (UNICAMP)'
      },
      {
        title: 'Tabela IBGE',
        href: '/nutritionist/tabela-taco?source=ibge',
        description: 'Alimentos Consumidos no Brasil (POF 2008-2009)'
      }
    ]
  },
  {
    title: 'Calculadora de Dieta',
    href: '/nutritionist/diet-calculator',
    icon: Calculator
  },
  {
    title: 'Receitas',
    href: '/nutritionist/recipes',
    icon: BookOpen
  },
  {
    title: 'Agendamentos',
    href: '/nutritionist/appointments',
    icon: Calendar
  },
  {
    title: 'Mensagens',
    href: '/nutritionist/messages',
    icon: MessageSquare
  },
  {
    title: 'Relatórios',
    href: '/nutritionist/reports',
    icon: BarChart3
  },
  {
    title: 'Configurações',
    href: '/nutritionist/settings',
    icon: Settings
  }
]

export function NutritionistLayout({ children }: NutritionistLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { unreadCount, isConnected } = useNotifications()
  const { messageCount } = useMessages()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-950"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'NUTRITIONIST') {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="relative w-64 bg-card shadow-lg border-r border-border">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-card-foreground">
            Átria Connect
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema Nutricional
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isMessagesPage = item.href === '/nutritionist/messages'
            const hasUnreadMessages = isMessagesPage && messageCount.total > 0
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left relative',
                    isActive ? 'bg-green-800 text-white hover:bg-green-700' : 'text-muted-foreground hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {hasUnreadMessages && (
                    <Badge 
                      className="ml-auto bg-red-600 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    >
                      {messageCount.total > 9 ? '9+' : messageCount.total}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {/* Theme Toggle e Notificações */}
          <div className="flex items-center justify-center space-x-3 p-2 bg-muted/50 rounded-lg">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative h-7 w-7 p-0"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              {/* Connection Status */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </div>

          {/* Informações do Usuário */}
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-800 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  )
}