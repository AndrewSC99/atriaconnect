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
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Calendar,
  CheckSquare,
  Home,
  LineChart,
  Utensils,
  User,
  BookOpen,
  Apple,
  Bell
} from 'lucide-react'

interface PatientLayoutProps {
  children: ReactNode
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/patient/dashboard',
    icon: Home
  },
  {
    title: 'Minha Dieta',
    href: '/patient/diet',
    icon: Apple
  },
  {
    title: 'Registro Alimentar',
    href: '/patient/food-log',
    icon: Utensils
  },
  {
    title: 'Métricas',
    href: '/patient/metrics',
    icon: LineChart
  },
  {
    title: 'Receitas',
    href: '/patient/recipes',
    icon: BookOpen
  },
  {
    title: 'Agendamentos',
    href: '/patient/appointments',
    icon: Calendar
  },
  {
    title: 'Checklist',
    href: '/patient/checklist',
    icon: CheckSquare
  }
]

export function PatientLayout({ children }: PatientLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { unreadCount, isConnected } = useNotifications()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'PATIENT') {
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
            Área do Paciente
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left',
                    isActive ? 'bg-green-800 text-white hover:bg-green-700' : 'text-muted-foreground hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-2 bg-muted rounded-lg mb-2">
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
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Área do Paciente
            </h2>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 bg-red-600 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
                {/* Connection Status */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          </div>
        </header>

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