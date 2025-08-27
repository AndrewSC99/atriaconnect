'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TacoCalculator } from '@/components/nutritionist/taco-calculator'
import { TacoSearchAdvanced } from '@/components/nutritionist/taco-search-advanced'
import { TacoExport } from '@/components/nutritionist/taco-export'
// DatabaseSourceSelector removido - filtro agora é na busca avançada
import { 
  Search, 
  Filter, 
  Heart,
  Calculator,
  BarChart3,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
  TrendingUp,
  Star,
  Download
} from 'lucide-react'
import { useNutritionalDatabase, AlimentoUnificado } from '@/hooks/useNutritionalDatabase'
import { formatNutrient, formatEnergy, formatMacro, formatMineral, formatVitamin } from '@/utils/format'

export default function TabelaTACOPage() {
  // Estado da página
  const [selectedFood, setSelectedFood] = useState<AlimentoUnificado | null>(null)
  const [activeTab, setActiveTab] = useState('buscar')
  
  const { 
    favorites, 
    toggleFavorite, 
    getNutrientAnalysis,
    categories,
    favoritesFoods,
    foods,
    databaseStats
  } = useNutritionalDatabase()

  const nutrientAnalysis = getNutrientAnalysis

  const getNutrientColor = (value: number, nutrient: string) => {
    // Cores baseadas na intensidade do nutriente
    if (nutrient === 'energia_kcal') {
      if (value > 300) return 'bg-red-100 text-red-800'
      if (value > 150) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }
    if (nutrient === 'proteina_g') {
      if (value > 20) return 'bg-blue-100 text-blue-800'
      if (value > 10) return 'bg-indigo-100 text-indigo-800'
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tabela Nutricional</h1>
            <p className="text-muted-foreground mt-2">
              Banco de Dados Nutricional Brasileiro - TACO + IBGE - Consulte informações nutricionais completas
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>{databaseStats.total} alimentos</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              📊
              <span>{databaseStats.taco} TACO</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              🏛️
              <span>{databaseStats.ibge} IBGE</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Filter className="h-3 w-3" />
              <span>{categories.length} categorias</span>
            </Badge>
            {favorites.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{favorites.length} favoritos</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="buscar" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </TabsTrigger>
            <TabsTrigger value="favoritos" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Favoritos</span>
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="analise" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Análise</span>
            </TabsTrigger>
            <TabsTrigger value="exportar" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Buscar */}
          <TabsContent value="buscar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Busca Avançada */}
              <div className="lg:col-span-2">
                <TacoSearchAdvanced 
                  onFoodSelect={(food) => setSelectedFood(food)}
                  showPagination={true}
                />
              </div>

              {/* Detalhes do Alimento */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Informações Nutricionais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedFood ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg">{selectedFood.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{selectedFood.categoria}</p>
                          <Badge className="mb-4">Porção: 100g</Badge>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Energia</span>
                              <span className="font-bold text-lg">{formatEnergy(selectedFood.energia_kcal, 'kcal')}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatEnergy(selectedFood.energia_kj, 'kj')}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-700">{formatMacro(selectedFood.proteina_g)}</div>
                              <div className="text-xs text-blue-600">Proteínas</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="font-semibold text-yellow-700">{formatMacro(selectedFood.carboidrato_g)}</div>
                              <div className="text-xs text-yellow-600">Carboidratos</div>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <div className="font-semibold text-red-700">{formatMacro(selectedFood.lipidios_g)}</div>
                              <div className="text-xs text-red-600">Gorduras</div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center">
                              <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                              Minerais (mg)
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span>Cálcio:</span>
                                <span className="font-medium">{formatMineral(selectedFood.calcio_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ferro:</span>
                                <span className="font-medium">{formatMineral(selectedFood.ferro_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Magnésio:</span>
                                <span className="font-medium">{formatMineral(selectedFood.magnesio_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Zinco:</span>
                                <span className="font-medium">{formatMineral(selectedFood.zinco_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sódio:</span>
                                <span className="font-medium">{formatMineral(selectedFood.sodio_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Potássio:</span>
                                <span className="font-medium">{formatMineral(selectedFood.potassio_mg, 'mg')}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center">
                              <Star className="h-4 w-4 mr-1 text-orange-500" />
                              Vitaminas
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span>Vit. C:</span>
                                <span className="font-medium">{formatVitamin(selectedFood.vitamina_c_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tiamina (B1):</span>
                                <span className="font-medium">{formatVitamin(selectedFood.tiamina_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Riboflavina (B2):</span>
                                <span className="font-medium">{formatVitamin(selectedFood.riboflavina_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Niacina (B3):</span>
                                <span className="font-medium">{formatVitamin(selectedFood.niacina_mg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vit. A (RAE):</span>
                                <span className="font-medium">{formatVitamin(selectedFood.rae_mcg, 'μg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Folato:</span>
                                <span className="font-medium">{formatVitamin(selectedFood.folato_mcg, 'μg')}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Informações adicionais para alimentos IBGE expandidos */}
                          {selectedFood.fonte === 'IBGE' && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                                Informações Complementares
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Fibra Alimentar:</span>
                                  <span className="font-medium">{formatMacro(selectedFood.fibra_alimentar_g)}</span>
                                </div>
                                {selectedFood.fonte === 'IBGE' && (
                                  <div className="flex justify-between">
                                    <span>Base de Dados:</span>
                                    <Badge variant="outline" className="text-xs">
                                      🔬 Expandida c/ Micronutrientes
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {selectedFood.tags && selectedFood.tags.includes('micronutrientes_completos') && (
                                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                  <p className="text-xs text-green-700 flex items-center">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Dados completos de minerais e vitaminas disponíveis
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <Separator />

                          <div className="flex space-x-2">
                            <Button
                              className="flex-1"
                              onClick={() => toggleFavorite(selectedFood.id)}
                              variant={favorites.includes(selectedFood.id) ? "default" : "outline"}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              {favorites.includes(selectedFood.id) ? 'Favorito' : 'Favoritar'}
                            </Button>
                            <Button 
                              className="flex-1" 
                              variant="outline"
                              onClick={() => setActiveTab('calculadora')}
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Calcular
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Selecione um alimento</p>
                        <p className="text-sm">para ver as informações nutricionais</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Favoritos */}
          <TabsContent value="favoritos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Alimentos Favoritos</span>
                  <Badge variant="secondary">{favoritesFoods.length} itens</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesFoods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoritesFoods.map((food) => (
                      <div key={food.id} className="group p-4 border rounded-lg hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer transition-all duration-200" onClick={() => setSelectedFood(food)}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{food.nome}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(food.id)
                            }}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{food.categoria}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {formatEnergy(food.energia_kcal, 'kcal')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Beef className="h-3 w-3 mr-1" />
                            {formatMacro(food.proteina_g)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum alimento favorito</p>
                    <p className="text-sm">Adicione alimentos aos seus favoritos na aba de busca</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Calculadora */}
          <TabsContent value="calculadora">
            <TacoCalculator selectedFood={selectedFood} />
          </TabsContent>

          {/* Tab: Análise Nutricional */}
          <TabsContent value="analise">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Alto em Proteínas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <Beef className="h-5 w-5" />
                    <span>Alto em Proteínas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutrientAnalysis.highProtein.map((food) => (
                      <div key={food.id} className="group flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setSelectedFood(food)}>
                        <div>
                          <p className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</p>
                          <p className="text-xs text-muted-foreground">{food.categoria}</p>
                        </div>
                        <Badge variant="outline">{formatMacro(food.proteina_g)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Baixas Calorias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Zap className="h-5 w-5" />
                    <span>Baixas Calorias</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutrientAnalysis.lowCalorie.map((food) => (
                      <div key={food.id} className="group flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setSelectedFood(food)}>
                        <div>
                          <p className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</p>
                          <p className="text-xs text-muted-foreground">{food.categoria}</p>
                        </div>
                        <Badge variant="outline">{formatEnergy(food.energia_kcal, 'kcal')}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rico em Fibras */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-600">
                    <Wheat className="h-5 w-5" />
                    <span>Rico em Fibras</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutrientAnalysis.highFiber.map((food) => (
                      <div key={food.id} className="group flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setSelectedFood(food)}>
                        <div>
                          <p className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</p>
                          <p className="text-xs text-muted-foreground">{food.categoria}</p>
                        </div>
                        <Badge variant="outline">{formatMacro(food.fibra_alimentar_g)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rico em Vitamina C */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-600">
                    <Star className="h-5 w-5" />
                    <span>Rico em Vitamina C</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutrientAnalysis.richInVitaminC.map((food) => (
                      <div key={food.id} className="group flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setSelectedFood(food)}>
                        <div>
                          <p className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</p>
                          <p className="text-xs text-muted-foreground">{food.categoria}</p>
                        </div>
                        <Badge variant="outline">{formatVitamin(food.vitamina_c_mg, 'mg')}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rico em Ferro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <Droplets className="h-5 w-5" />
                    <span>Rico em Ferro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutrientAnalysis.richInIron.map((food) => (
                      <div key={food.id} className="group flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setSelectedFood(food)}>
                        <div>
                          <p className="font-medium text-sm group-hover:text-zinc-900">{food.nome}</p>
                          <p className="text-xs text-muted-foreground">{food.categoria}</p>
                        </div>
                        <Badge variant="outline">{formatMineral(food.ferro_mg)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Exportar */}
          <TabsContent value="exportar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TacoExport 
                selectedFoods={selectedFood ? [selectedFood] : []}
                searchResults={[]}
              />
              
              {/* Informações sobre exportação */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre a Exportação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Formatos Disponíveis:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600">CSV</Badge>
                        <span>Para planilhas (Excel, Google Sheets)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-blue-600">JSON</Badge>
                        <span>Dados estruturados para APIs</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-purple-600">TXT</Badge>
                        <span>Relatório com análises estatísticas</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Dados Incluídos:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cada exportação inclui informações nutricionais completas:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Informações básicas (nome, categoria, código)</li>
                      <li>• Macronutrientes (proteínas, carboidratos, lipídios)</li>
                      <li>• Micronutrientes (vitaminas e minerais)</li>
                      <li>• Fibras alimentares (total, solúvel, insolúvel)</li>
                      <li>• Energia (kcal e kJ)</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Fonte dos Dados:</h4>
                    <p className="text-xs text-muted-foreground">
                      Todos os dados são baseados na Tabela Brasileira de Composição de Alimentos (TACO) 
                      4ª edição, desenvolvida pelo NEPA/UNICAMP com apoio do Ministério da Saúde.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Dica:</strong> Use os favoritos para exportar apenas os alimentos 
                      mais relevantes para seus pacientes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </NutritionistLayout>
  )
}