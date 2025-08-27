'use client'

import { useState, useEffect } from 'react'
import { WhatsAppService } from '@/lib/communication/whatsapp-service'
import { CommunicationService } from '@/lib/communication/communication-service'

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
  webhookSecret: string
  enabled: boolean
}

interface WhatsAppHook {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  sendMessage: (to: string, message: string) => Promise<boolean>
  sendTemplate: (to: string, templateName: string, parameters?: any[]) => Promise<boolean>
  getProfile: () => Promise<any>
  config: WhatsAppConfig | null
  updateConfig: (newConfig: WhatsAppConfig) => void
}

export function useWhatsApp(): WhatsAppHook {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [whatsappService, setWhatsappService] = useState<WhatsAppService | null>(null)

  // Carregar configuração do localStorage na inicialização
  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsapp_config')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        if (parsedConfig.enabled) {
          initializeService(parsedConfig)
        }
      } catch (error) {
        console.error('Erro ao carregar configuração WhatsApp:', error)
      }
    }
  }, [])

  const initializeService = async (whatsappConfig: WhatsAppConfig) => {
    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      setError('Configuração incompleta')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Criar configuração para o communication service
      const communicationConfig = {
        whatsapp: {
          ativo: true,
          accessToken: whatsappConfig.accessToken,
          phoneNumberId: whatsappConfig.phoneNumberId,
          businessAccountId: whatsappConfig.businessAccountId,
          apiVersion: 'v17.0',
          webhookVerifyToken: whatsappConfig.webhookVerifyToken,
          webhookSecret: whatsappConfig.webhookSecret,
          rateLimitPerSecond: 20,
          timeoutMs: 30000
        },
        sms: { ativo: false },
        email: { ativo: false }
      }

      const service = new WhatsAppService(communicationConfig.whatsapp)
      setWhatsappService(service)

      // Testar conectividade
      const profile = await service.obterPerfilBusiness()
      if (profile.sucesso) {
        setIsConnected(true)
        console.log('WhatsApp conectado com sucesso:', profile.perfil)
      } else {
        throw new Error(profile.erro || 'Erro ao conectar com WhatsApp')
      }

    } catch (error) {
      console.error('Erro ao inicializar WhatsApp Service:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig)
    localStorage.setItem('whatsapp_config', JSON.stringify(newConfig))

    if (newConfig.enabled) {
      initializeService(newConfig)
    } else {
      setWhatsappService(null)
      setIsConnected(false)
    }
  }

  const sendMessage = async (to: string, message: string): Promise<boolean> => {
    if (!whatsappService || !isConnected) {
      setError('WhatsApp não conectado')
      return false
    }

    try {
      const result = await whatsappService.enviarMensagemTexto({
        id: `msg_${Date.now()}`,
        tipo: 'whatsapp',
        destinatario: {
          pacienteId: to,
          nome: 'Paciente',
          whatsapp: to,
          canalPreferido: 'whatsapp'
        },
        conteudo: {
          corpo: message
        },
        configuracao: {
          prioridade: 'media',
          trackingEnabled: true
        }
      })

      if (result.sucesso) {
        console.log('Mensagem WhatsApp enviada:', result.providerId)
        return true
      } else {
        throw new Error(result.erro || 'Erro ao enviar mensagem')
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      setError(error instanceof Error ? error.message : 'Erro ao enviar mensagem')
      return false
    }
  }

  const sendTemplate = async (to: string, templateName: string, parameters?: any[]): Promise<boolean> => {
    if (!whatsappService || !isConnected) {
      setError('WhatsApp não conectado')
      return false
    }

    try {
      const result = await whatsappService.enviarMensagemTemplate({
        id: `template_${Date.now()}`,
        tipo: 'whatsapp',
        destinatario: {
          pacienteId: to,
          nome: 'Paciente',
          whatsapp: to,
          canalPreferido: 'whatsapp'
        },
        conteudo: {
          templateId: templateName,
          parametros: parameters || {}
        },
        configuracao: {
          prioridade: 'media',
          trackingEnabled: true
        }
      })

      if (result.sucesso) {
        console.log('Template WhatsApp enviado:', result.providerId)
        return true
      } else {
        throw new Error(result.erro || 'Erro ao enviar template')
      }

    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error)
      setError(error instanceof Error ? error.message : 'Erro ao enviar template')
      return false
    }
  }

  const getProfile = async (): Promise<any> => {
    if (!whatsappService || !isConnected) {
      throw new Error('WhatsApp não conectado')
    }

    try {
      const result = await whatsappService.obterPerfilBusiness()
      if (result.sucesso) {
        return result.perfil
      } else {
        throw new Error(result.erro || 'Erro ao obter perfil')
      }
    } catch (error) {
      console.error('Erro ao obter perfil WhatsApp:', error)
      throw error
    }
  }

  return {
    isConnected,
    isLoading,
    error,
    sendMessage,
    sendTemplate,
    getProfile,
    config,
    updateConfig
  }
}