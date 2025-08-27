'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    crn: '',
    notifications: {
      email: true,
      push: true,
      appointments: true,
      messages: true
    }
  })

  const handleSave = async () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e dados pessoais
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Nutricionista
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados Pessoais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crn">CRN</Label>
                  <Input
                    id="crn"
                    value={formData.crn}
                    onChange={(e) => handleInputChange('crn', e.target.value)}
                    placeholder="CRN 12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="email-notifications"
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: !!checked }
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="email-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Notificações por Email
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="push-notifications"
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: !!checked }
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="push-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Notificações Push
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receba notificações em tempo real no navegador
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="appointment-notifications"
                    checked={formData.notifications.appointments}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, appointments: !!checked }
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="appointment-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Agendamentos
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Notificações sobre novos agendamentos e alterações
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="message-notifications"
                    checked={formData.notifications.messages}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, messages: !!checked }
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="message-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Mensagens
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Notificações sobre novas mensagens de pacientes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com Configurações Extras */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Tema</Label>
                  <p className="text-xs text-muted-foreground">
                    Alterne entre claro e escuro
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Altere sua senha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Digite sua nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirme sua nova senha"
                />
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline" className="text-xs">Nutricionista</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Salvo com sucesso!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
      </div>
    </NutritionistLayout>
  )
}