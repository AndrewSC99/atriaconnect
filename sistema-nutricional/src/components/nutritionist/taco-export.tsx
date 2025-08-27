'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Share2,
  Copy,
  Check,
  Printer
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { formatEnergy, formatMacro } from '@/utils/format'

interface TacoExportProps {
  selectedFoods?: Alimento[]
  searchResults?: Alimento[]
}

export function TacoExport({ selectedFoods = [], searchResults = [] }: TacoExportProps) {
  const [copied, setCopied] = useState(false)
  const { foods, favoritesFoods } = useTaco()

  const exportToCSV = (data: Alimento[], filename: string) => {
    const headers = [
      'ID', 'Código', 'Nome', 'Nome Inglês', 'Categoria', 'Energia (kcal)', 
      'Proteínas (g)', 'Lipídios (g)', 'Carboidratos (g)', 'Fibra Alimentar (g)',
      'Cálcio (mg)', 'Ferro (mg)', 'Sódio (mg)', 'Potássio (mg)', 'Vitamina C (mg)'
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(food => [
        food.id,
        food.codigo,
        `"${food.nome}"`,
        `"${food.nomeIngles}"`,
        `"${food.categoria}"`,
        Number(food.energia_kcal).toFixed(0),
        Number(food.proteina_g).toFixed(1),
        Number(food.lipidios_g).toFixed(1),
        Number(food.carboidrato_g).toFixed(1),
        food.fibra_alimentar_g,
        food.calcio_mg,
        food.ferro_mg,
        food.sodio_mg,
        food.potassio_mg,
        food.vitamina_c_mg
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportToJSON = (data: Alimento[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const generateReport = (data: Alimento[]) => {
    const report = `
RELATÓRIO TABELA TACO
=====================

Data: ${new Date().toLocaleDateString('pt-BR')}
Total de Alimentos: ${data.length}

RESUMO POR CATEGORIA:
${Object.entries(
  data.reduce((acc, food) => {
    acc[food.categoria] = (acc[food.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([categoria, count]) => `• ${categoria}: ${count} alimentos`).join('\n')}

ESTATÍSTICAS NUTRICIONAIS:
• Energia média: ${(data.reduce((sum, food) => sum + food.energia_kcal, 0) / data.length).toFixed(0)} kcal
• Proteína média: ${(data.reduce((sum, food) => sum + food.proteina_g, 0) / data.length).toFixed(1)} g
• Carboidrato médio: ${(data.reduce((sum, food) => sum + food.carboidrato_g, 0) / data.length).toFixed(1)} g

ALIMENTOS DE ALTA ENERGIA (>300 kcal):
${data.filter(food => food.energia_kcal > 300).map(food => `• ${food.nome}: ${Number(food.energia_kcal).toFixed(0)} kcal`).join('\n')}

ALIMENTOS RICOS EM PROTEÍNA (>15g):
${data.filter(food => food.proteina_g > 15).map(food => `• ${food.nome}: ${Number(food.proteina_g).toFixed(1)}g`).join('\n')}

FONTE: Tabela Brasileira de Composição de Alimentos - TACO
    `.trim()

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'relatorio-taco.txt')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const copyToClipboard = async (data: Alimento[]) => {
    const text = data.map(food => 
      `${food.nome} - ${Number(food.energia_kcal).toFixed(0)} kcal, ${Number(food.proteina_g).toFixed(1)}g prot, ${Number(food.carboidrato_g).toFixed(1)}g carb`
    ).join('\n')
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const printData = (data: Alimento[]) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tabela TACO - Relatório</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .stats { background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Tabela TACO - Composição de Alimentos</h1>
            <div class="stats">
              <strong>Total de alimentos:</strong> ${data.length}<br>
              <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
              <strong>Fonte:</strong> NEPA/UNICAMP
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Energia (kcal)</th>
                  <th>Proteína (g)</th>
                  <th>Carboidrato (g)</th>
                  <th>Lipídios (g)</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(food => `
                  <tr>
                    <td>${food.nome}</td>
                    <td>${food.categoria}</td>
                    <td>${Number(food.energia_kcal).toFixed(0)}</td>
                    <td>${Number(food.proteina_g).toFixed(1)}</td>
                    <td>${Number(food.carboidrato_g).toFixed(1)}</td>
                    <td>${Number(food.lipidios_g).toFixed(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getDataToExport = () => {
    if (selectedFoods.length > 0) return selectedFoods
    if (searchResults.length > 0) return searchResults
    return favoritesFoods.length > 0 ? favoritesFoods : foods.slice(0, 50) // Limitar a 50 para não sobrecarregar
  }

  const dataToExport = getDataToExport()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Exportar Dados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Dados para exportação</p>
            <p className="text-sm text-muted-foreground">
              {dataToExport.length} alimentos selecionados
            </p>
          </div>
          <Badge variant="secondary">{dataToExport.length}</Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Exportar CSV */}
          <Button
            variant="outline"
            onClick={() => exportToCSV(dataToExport, 'tabela-taco')}
            className="flex items-center justify-start space-x-2 h-auto p-3"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Exportar CSV</div>
              <div className="text-xs text-muted-foreground">Para Excel/Sheets</div>
            </div>
          </Button>

          {/* Exportar JSON */}
          <Button
            variant="outline"
            onClick={() => exportToJSON(dataToExport, 'tabela-taco')}
            className="flex items-center justify-start space-x-2 h-auto p-3"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Exportar JSON</div>
              <div className="text-xs text-muted-foreground">Dados estruturados</div>
            </div>
          </Button>

          {/* Gerar Relatório */}
          <Button
            variant="outline"
            onClick={() => generateReport(dataToExport)}
            className="flex items-center justify-start space-x-2 h-auto p-3"
          >
            <FileText className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Relatório TXT</div>
              <div className="text-xs text-muted-foreground">Análise detalhada</div>
            </div>
          </Button>

          {/* Imprimir */}
          <Button
            variant="outline"
            onClick={() => printData(dataToExport)}
            className="flex items-center justify-start space-x-2 h-auto p-3"
          >
            <Printer className="h-5 w-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium">Imprimir</div>
              <div className="text-xs text-muted-foreground">Tabela formatada</div>
            </div>
          </Button>
        </div>

        <Separator />

        <div className="flex space-x-2">
          {/* Copiar para clipboard */}
          <Button
            variant="outline"
            onClick={() => copyToClipboard(dataToExport)}
            className="flex-1"
            disabled={copied}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar Lista'}
          </Button>

          {/* Compartilhar */}
          <Button
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Tabela TACO - Composição de Alimentos',
                  text: `Lista de ${dataToExport.length} alimentos da Tabela TACO`,
                  url: window.location.href
                })
              }
            }}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Os dados exportados são baseados na Tabela Brasileira de Composição de Alimentos (TACO) do NEPA/UNICAMP
        </div>
      </CardContent>
    </Card>
  )
}