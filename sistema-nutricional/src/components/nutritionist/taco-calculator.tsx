'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Calculator, 
  Scale, 
  Zap, 
  Beef, 
  Wheat, 
  Droplets,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useTaco, Alimento } from '@/hooks/useTaco'
import { formatNutrient, formatEnergy, formatMacro, formatMineral } from '@/utils/format'

interface PortionCalculation {
  food: Alimento
  grams: number
  calculation: ReturnType<typeof useTaco>['calculatePortion']
}

interface TacoCalculatorProps {
  selectedFood?: Alimento | null
}

export function TacoCalculator({ selectedFood }: TacoCalculatorProps) {
  const { calculatePortion, findSimilarFoods } = useTaco()
  const [portions, setPortions] = useState<PortionCalculation[]>([])
  const [currentGrams, setCurrentGrams] = useState(100)

  const addPortion = () => {
    if (!selectedFood) return
    
    const calculation = calculatePortion(selectedFood, currentGrams)
    const newPortion: PortionCalculation = {
      food: selectedFood,
      grams: currentGrams,
      calculation
    }
    
    setPortions(prev => [...prev, newPortion])
  }

  const removePortion = (index: number) => {
    setPortions(prev => prev.filter((_, i) => i !== index))
  }

  const totalNutrition = portions.reduce((total, portion) => ({
    energia_kcal: total.energia_kcal + portion.calculation.energia_kcal,
    proteina_g: total.proteina_g + portion.calculation.proteina_g,
    carboidrato_g: total.carboidrato_g + portion.calculation.carboidrato_g,
    lipidios_g: total.lipidios_g + portion.calculation.lipidios_g,
    fibra_alimentar_g: total.fibra_alimentar_g + portion.calculation.fibra_alimentar_g,
    calcio_mg: total.calcio_mg + portion.calculation.calcio_mg,
    ferro_mg: total.ferro_mg + portion.calculation.ferro_mg,
    sodio_mg: total.sodio_mg + portion.calculation.sodio_mg,
    vitamina_c_mg: total.vitamina_c_mg + portion.calculation.vitamina_c_mg
  }), {
    energia_kcal: 0,
    proteina_g: 0,
    carboidrato_g: 0,
    lipidios_g: 0,
    fibra_alimentar_g: 0,
    calcio_mg: 0,
    ferro_mg: 0,
    sodio_mg: 0,
    vitamina_c_mg: 0
  })

  const similarFoods = selectedFood ? findSimilarFoods(selectedFood, 3) : []

  return (
    <div className="space-y-6">
      {/* Calculadora de Porções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calculadora de Porções</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFood ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="grams">Quantidade (gramas)</Label>
                  <Input
                    id="grams"
                    type="number"
                    value={currentGrams}
                    onChange={(e) => setCurrentGrams(Number(e.target.value))}
                    min="1"
                    max="1000"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={addPortion}
                  className="mt-6"
                  disabled={currentGrams <= 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {/* Preview da porção atual */}
              <div className="bg-accent/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedFood.nome}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNutrient(selectedFood.energia_kcal * currentGrams / 100)}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNutrient(selectedFood.proteina_g * currentGrams / 100)}</div>
                    <div className="text-xs text-muted-foreground">prot (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNutrient(selectedFood.carboidrato_g * currentGrams / 100)}</div>
                    <div className="text-xs text-muted-foreground">carb (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatNutrient(selectedFood.lipidios_g * currentGrams / 100)}</div>
                    <div className="text-xs text-muted-foreground">gord (g)</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione um alimento para calcular porções</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Porções Adicionadas */}
      {portions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Porções Calculadas</span>
              </div>
              <Badge variant="secondary">{portions.length} itens</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portions.map((portion, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{portion.food.nome}</div>
                    <div className="text-sm text-muted-foreground">{portion.grams}g</div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {formatEnergy(portion.calculation.energia_kcal, 'kcal')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Beef className="h-3 w-3 mr-1" />
                        {formatMacro(portion.calculation.proteina_g)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePortion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Total Nutricional */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-bold mb-3">Total Nutricional</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatNutrient(totalNutrition.energia_kcal)}</div>
                  <div className="text-sm text-muted-foreground">Calorias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatMacro(totalNutrition.proteina_g)}</div>
                  <div className="text-sm text-muted-foreground">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{formatMacro(totalNutrition.carboidrato_g)}</div>
                  <div className="text-sm text-muted-foreground">Carboidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{formatMacro(totalNutrition.lipidios_g)}</div>
                  <div className="text-sm text-muted-foreground">Gorduras</div>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{formatMacro(totalNutrition.fibra_alimentar_g)}</div>
                  <div className="text-muted-foreground">Fibras</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{formatMineral(totalNutrition.calcio_mg)}</div>
                  <div className="text-muted-foreground">Cálcio</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{formatMineral(totalNutrition.ferro_mg)}</div>
                  <div className="text-muted-foreground">Ferro</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{formatMineral(totalNutrition.vitamina_c_mg)}</div>
                  <div className="text-muted-foreground">Vit. C</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alimentos Similares */}
      {selectedFood && similarFoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Alimentos Similares</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {similarFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{food.nome}</div>
                    <div className="text-sm text-muted-foreground">{food.categoria}</div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {formatEnergy(food.energia_kcal, 'kcal')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatMacro(food.proteina_g)} prot
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Indicadores de comparação */}
                    {food.energia_kcal > selectedFood.energia_kcal ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : food.energia_kcal < selectedFood.energia_kcal ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              * Alimentos da mesma categoria com perfil nutricional similar
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}