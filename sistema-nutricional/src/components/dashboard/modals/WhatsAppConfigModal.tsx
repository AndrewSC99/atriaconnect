'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Smartphone,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Copy,
  TestTube,
  Send,
  Loader2,
  ExternalLink,
  Shield,
  Key,
  Phone,
  Webhook
} from 'lucide-react'
import { toast } from 'sonner'

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
  webhookSecret: string
  enabled: boolean
}

interface WhatsAppConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: WhatsAppConfig) => void
  currentConfig?: WhatsAppConfig
}

export function WhatsAppConfigModal({
  isOpen,
  onClose,
  onSave,
  currentConfig
}: WhatsAppConfigModalProps) {
  const [config, setConfig] = useState<WhatsAppConfig>(
    currentConfig || {
      accessToken: '',
      phoneNumberId: '',
      businessAccountId: '',
      webhookVerifyToken: '',
      webhookSecret: '',
      enabled: false
    }
  )

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [testingConnection, setTestingConnection] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testPhoneNumber, setTestPhoneNumber] = useState('')

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/whatsapp`

  const updateConfig = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  const testConnection = async () => {
    if (!config.accessToken || !config.phoneNumberId) {
      toast.error('Preencha o Access Token e Phone Number ID primeiro')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('connecting')

    try {
      // Simular teste de conexão com a API do WhatsApp
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui você faria uma chamada real para a API do WhatsApp
      // const response = await fetch(`https://graph.facebook.com/v17.0/${config.phoneNumberId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${config.accessToken}`
      //   }
      // })

      const success = Math.random() > 0.3 // Simular sucesso na maioria das vezes
      
      if (success) {
        setConnectionStatus('connected')
        toast.success('Conexão com WhatsApp Business estabelecida com sucesso!')
      } else {
        setConnectionStatus('error')
        toast.error('Erro na conexão. Verifique suas credenciais.')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Erro ao testar conexão com WhatsApp Business')
    } finally {
      setTestingConnection(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testMessage || !testPhoneNumber) {
      toast.error('Preencha a mensagem e o número de teste')
      return
    }

    try {
      // Simular envio de mensagem de teste
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Mensagem de teste enviada com sucesso!')
      setTestMessage('')
      setTestPhoneNumber('')
    } catch (error) {
      toast.error('Erro ao enviar mensagem de teste')
    }
  }

  const handleSave = () => {
    if (!config.accessToken || !config.phoneNumberId) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    onSave(config)
    toast.success('Configurações salvas com sucesso!')
    onClose()
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Conectado</Badge>
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Conectando</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>
      default:
        return <Badge variant="secondary">Desconectado</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <DialogTitle>Configuração WhatsApp Business</DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Credenciais da API</span>
                </CardTitle>
                <CardDescription>
                  Configure suas credenciais do WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={config.accessToken}
                    onChange={(e) => updateConfig('accessToken', e.target.value)}
                    placeholder="EAABwzLixnjY..."
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    value={config.phoneNumberId}
                    onChange={(e) => updateConfig('phoneNumberId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>

                <div>
                  <Label htmlFor="businessAccountId">Business Account ID</Label>
                  <Input
                    id="businessAccountId"
                    value={config.businessAccountId}
                    onChange={(e) => updateConfig('businessAccountId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => updateConfig('enabled', checked)}
                  />
                  <Label>Ativar integração WhatsApp</Label>
                </div>

                <Button 
                  onClick={testConnection} 
                  disabled={testingConnection}
                  className="w-full"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Webhook className="h-4 w-4" />
                  <span>Configuração de Webhook</span>
                </CardTitle>
                <CardDescription>
                  Configure o webhook para receber mensagens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>URL do Webhook</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(webhookUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="webhookVerifyToken">Verify Token</Label>
                  <Input
                    id="webhookVerifyToken"
                    value={config.webhookVerifyToken}
                    onChange={(e) => updateConfig('webhookVerifyToken', e.target.value)}
                    placeholder="meu_verify_token_secreto"
                  />
                </div>

                <div>
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={config.webhookSecret}
                    onChange={(e) => updateConfig('webhookSecret', e.target.value)}
                    placeholder="meu_webhook_secret"
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Configure estes valores no Facebook Developer Console para garantir a segurança do webhook.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Teste e Documentação */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Teste de Mensagem</span>
                </CardTitle>
                <CardDescription>
                  Envie uma mensagem de teste para verificar a integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testPhone">Número de Teste</Label>
                  <Input
                    id="testPhone"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+5511999999999"
                  />
                </div>

                <div>
                  <Label htmlFor="testMessage">Mensagem de Teste</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Olá! Esta é uma mensagem de teste do Sistema Nutricional."
                    className="h-20"
                  />
                </div>

                <Button 
                  onClick={sendTestMessage}
                  disabled={connectionStatus !== 'connected'}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Links Úteis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Facebook Developer Console
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://business.whatsapp.com/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  WhatsApp Business
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentação da API
                </Button>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Para usar o WhatsApp Business API, você precisa de uma conta business verificada e aprovação do Facebook.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}