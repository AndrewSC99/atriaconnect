'use client'

import { useState, useEffect } from 'react'

export type DashboardVersion = 'classic' | 'beta'

export function useDashboardVersion() {
  const [version, setVersionState] = useState<DashboardVersion>('classic')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar versão salva no localStorage
    const savedVersion = localStorage.getItem('dashboardVersion') as DashboardVersion
    if (savedVersion && (savedVersion === 'classic' || savedVersion === 'beta')) {
      setVersionState(savedVersion)
    }
    setIsLoading(false)
  }, [])

  const setVersion = (newVersion: DashboardVersion) => {
    setVersionState(newVersion)
    localStorage.setItem('dashboardVersion', newVersion)
    
    // Opcional: Analytics para trackear uso
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'dashboard_version_changed', {
        event_category: 'dashboard',
        event_label: newVersion,
        value: newVersion === 'beta' ? 1 : 0
      })
    }
  }

  const toggleVersion = () => {
    const newVersion = version === 'classic' ? 'beta' : 'classic'
    setVersion(newVersion)
  }

  const revertToClassic = () => {
    setVersion('classic')
  }

  const enableBeta = () => {
    setVersion('beta')
  }

  return {
    version,
    setVersion,
    toggleVersion,
    revertToClassic,
    enableBeta,
    isLoading,
    isBeta: version === 'beta',
    isClassic: version === 'classic'
  }
}