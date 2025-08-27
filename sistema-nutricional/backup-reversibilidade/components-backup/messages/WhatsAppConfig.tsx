'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Settings, Send, Phone, AlertCircle } from 'lucide-react'
import { useWhatsApp } from '@/hooks/useWhatsApp'

interface WhatsAppConfigProps {
  isOpen?: boolean
  onClose?: () => void
}

export function WhatsAppConfig({ isOpen = false, onClose }: WhatsAppConfigProps) {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do Sistema Nutricional.')
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { isConnected, config: whatsAppConfig } = useWhatsApp()

  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/config')
      const data = await response.json()
      
      if (data.config) {
        setConfig(data.config)
      }
    } catch (error) {
      setError('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection' })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Conexão com WhatsApp estabelecida com sucesso!')
        if (data.profile) {
          setProfile(data.profile)
        }
      } else {
        setError(data.error || 'Erro ao testar conexão')
      }
    } catch (error) {
      setError('Erro ao testar conexão')
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setError('Preencha o número de telefone e a mensagem')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test_message',
          to: testPhone,
          message: testMessage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Mensagem de teste enviada com sucesso!')
        setTestPhone('')
      } else {
        setError(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      setError('Erro ao enviar mensagem de teste')
    } finally {
      setLoading(false)
    }
  }

  const getBusinessProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_business_profile' })
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        setError(data.error || 'Erro ao obter perfil')
      }
    } catch (error) {
      setError('Erro ao obter perfil do business')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Configuração WhatsApp Business
            </CardTitle>
            <CardDescription>
              Configure e teste a integração com WhatsApp Business API
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="test">Teste</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status da Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {config?.hasToken ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Access Token</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {config?.hasPhoneNumberId ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Phone Number ID</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {config?.hasBusinessAccountId ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Business Account ID</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {config?.hasWebhookToken ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Webhook Token</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {config?.hasWebhookSecret ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Webhook Secret</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Conexão Ativa</span>
                    </div>
                  </div>

                  {config?.webhookUrl && (
                    <div className="mt-4">
                      <Label>URL do Webhook:</Label>
                      <div className="p-2 bg-muted rounded text-sm font-mono">
                        {config.webhookUrl}
                      </div>
                    </div>
                  )}

                  <Button onClick={testConnection} disabled={loading} className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    {loading ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enviar Mensagem de Teste</CardTitle>
                  <CardDescription>
                    Teste o envio de mensagens para verificar se a integração está funcionando
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test-phone">Número de Telefone (com código do país)</Label>
                    <Input
                      id="test-phone"
                      placeholder="5511999999999"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="test-message">Mensagem</Label>
                    <textarea
                      id="test-message"
                      className="w-full p-2 border rounded-md resize-none"
                      rows={3}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                    />
                  </div>

                  <Button onClick={sendTestMessage} disabled={loading} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : 'Enviar Mensagem de Teste'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perfil do Business</CardTitle>
                  <CardDescription>
                    Informações da conta Business do WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile ? (
                    <div className="space-y-3">
                      {profile.name && (
                        <div>
                          <Label>Nome do Business:</Label>
                          <p className="text-sm">{profile.name}</p>
                        </div>
                      )}
                      {profile.category && (
                        <div>
                          <Label>Categoria:</Label>
                          <p className="text-sm">{profile.category}</p>
                        </div>
                      )}
                      {profile.description && (
                        <div>
                          <Label>Descrição:</Label>
                          <p className="text-sm">{profile.description}</p>
                        </div>
                      )}
                      {profile.phone_number && (
                        <div>
                          <Label>Número de Telefone:</Label>
                          <p className="text-sm">{profile.phone_number}</p>
                        </div>
                      )}
                      {profile.verified_name && (
                        <div className="flex items-center gap-2">
                          <Label>Nome Verificado:</Label>
                          <Badge variant="secondary">{profile.verified_name}</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum perfil carregado</p>
                  )}

                  <Button onClick={getBusinessProfile} disabled={loading} className="w-full">
                    {loading ? 'Carregando...' : 'Carregar Perfil'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}