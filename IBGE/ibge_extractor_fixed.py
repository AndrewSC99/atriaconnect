#!/usr/bin/env python3
"""
Extrator IBGE CORRIGIDO - Versão com validação rigorosa
Resolve problemas de códigos inseridos como valores nutricionais
"""

import PyPDF2
import re
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class IBGENutrients:
    """Nutrientes com validação"""
    energia_kcal: float = 0.0
    energia_kj: float = 0.0
    proteina_g: float = 0.0
    lipidios_g: float = 0.0
    carboidrato_g: float = 0.0
    carboidrato_disponivel_g: float = 0.0
    fibra_alimentar_g: float = 0.0
    fibra_solavel_g: float = 0.0
    fibra_insolavel_g: float = 0.0
    cinzas_g: float = 0.0
    
    # Minerais
    calcio_mg: float = 0.0
    magnesio_mg: float = 0.0
    manganes_mg: float = 0.0
    fosforo_mg: float = 0.0
    ferro_mg: float = 0.0
    sodio_mg: float = 0.0
    potassio_mg: float = 0.0
    cobre_mg: float = 0.0
    zinco_mg: float = 0.0
    
    # Vitaminas
    retinol_mcg: float = 0.0
    re_mcg: float = 0.0
    rae_mcg: float = 0.0
    tiamina_mg: float = 0.0
    riboflavina_mg: float = 0.0
    piridoxina_mg: float = 0.0
    niacina_mg: float = 0.0
    vitamina_c_mg: float = 0.0
    folato_mcg: float = 0.0
    vitamina_b12_mcg: float = 0.0
    vitamina_d_mcg: float = 0.0
    vitamina_e_mg: float = 0.0
    
    # Ácidos graxos
    acidos_saturados_g: float = 0.0
    acidos_monoinsaturados_g: float = 0.0
    acidos_poliinsaturados_g: float = 0.0
    colesterol_mg: float = 0.0

@dataclass
class IBGEFixedFood:
    """Alimento IBGE com dados validados"""
    code: int
    name: str
    preparation_code: int
    preparation: str
    group: str
    nutrients: IBGENutrients

class IBGEFixedExtractor:
    def __init__(self):
        self.pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
        self.foods_data = {}
        
        # Ranges de processamento otimizados
        self.processing_ranges = [
            {'name': 'Macronutrientes', 'start': 36, 'end': 96, 'table': 1},
            {'name': 'Gorduras', 'start': 97, 'end': 157, 'table': 2},
            {'name': 'Minerais', 'start': 158, 'end': 218, 'table': 3},
            {'name': 'Vitaminas', 'start': 219, 'end': 280, 'table': 4},
            {'name': 'Adicionais 1', 'start': 281, 'end': 320, 'table': 1},
            {'name': 'Adicionais 2', 'start': 321, 'end': 340, 'table': 1}
        ]
    
    def validate_nutritional_value(self, value: float, field_name: str) -> float:
        """Valida se um valor nutricional é realista"""
        
        # Definir ranges válidos por tipo de nutriente
        validation_rules = {
            # Macronutrientes (por 100g)
            'energia_kcal': (0, 900),      # Max ~900 kcal/100g
            'proteina_g': (0, 100),        # Max 100g/100g
            'lipidios_g': (0, 100),        # Max 100g/100g
            'carboidrato_g': (0, 100),     # Max 100g/100g
            'fibra_alimentar_g': (0, 50),  # Max 50g/100g
            
            # Minerais (mg)
            'calcio_mg': (0, 2000),        # Max 2000mg/100g
            'magnesio_mg': (0, 1000),      # Max 1000mg/100g
            'manganes_mg': (0, 50),        # Max 50mg/100g
            'ferro_mg': (0, 50),           # Max 50mg/100g (reduzido - valor anterior era irrealista)
            'sodio_mg': (0, 10000),        # Max 10g/100g
            'potassio_mg': (0, 5000),      # Max 5g/100g
            'fosforo_mg': (0, 2000),       # Max 2000mg/100g
            'zinco_mg': (0, 100),          # Max 100mg/100g
            'cobre_mg': (0, 50),           # Max 50mg/100g
            
            # Vitaminas
            'retinol_mcg': (0, 10000),     # Max 10000mcg/100g
            'tiamina_mg': (0, 100),        # Max 100mg/100g
            'riboflavina_mg': (0, 100),    # Max 100mg/100g
            'niacina_mg': (0, 500),        # Max 500mg/100g
            'vitamina_c_mg': (0, 2000),    # Max 2000mg/100g
            'vitamina_b12_mcg': (0, 1000), # Max 1000mcg/100g
            'vitamina_d_mcg': (0, 1000),   # Max 1000mcg/100g
            'vitamina_e_mg': (0, 200),     # Max 200mg/100g
            
            # Ácidos graxos
            'colesterol_mg': (0, 3000),    # Max 3000mg/100g
            'acidos_saturados_g': (0, 100),
            'acidos_monoinsaturados_g': (0, 100),
            'acidos_poliinsaturados_g': (0, 100),
        }
        
        # Verificar se é um código de alimento (7 dígitos)
        if value >= 1000000:  # Códigos IBGE têm 7 dígitos
            print(f"  AVISO: Valor {value} parece ser um código, zerado para {field_name}")
            return 0.0
            
        # Aplicar validação por range
        if field_name in validation_rules:
            min_val, max_val = validation_rules[field_name]
            if value < min_val or value > max_val:
                print(f"  AVISO: Valor {value} fora do range para {field_name} (min={min_val}, max={max_val}), zerado")
                return 0.0
        
        return value
    
    def parse_numeric_value(self, value_str: str) -> float:
        """Parse com validação melhorada"""
        if not value_str or value_str.strip() in ['-', 'n.d.', 'n.a.', '']:
            return 0.0
        
        try:
            # Limpar e converter
            cleaned = value_str.replace(',', '.').strip()
            
            # Verificar se é um código (apenas dígitos, 7 caracteres)
            if len(cleaned) == 7 and cleaned.isdigit():
                return 0.0  # Ignorar códigos
                
            return float(cleaned)
        except (ValueError, AttributeError):
            return 0.0

    def determine_group_by_code(self, code: int) -> str:
        """Determina grupo baseado no código"""
        prefix = str(code)[:2]
        
        code_groups = {
            '63': 'Cereais e Produtos de Cereais',
            '64': 'Hortaliças', 
            '65': 'Leguminosas',
            '66': 'Óleos e Gorduras',
            '67': 'Frutas e Produtos de Frutas',
            '68': 'Açúcares e Produtos de Confeitaria',
            '69': 'Carnes e Produtos Cárneus',
            '70': 'Carnes e Produtos Cárneus',
            '71': 'Carnes e Produtos Cárneus',
            '72': 'Peixes e Frutos do Mar',
            '73': 'Peixes e Frutos do Mar',
            '74': 'Leite e Produtos Lácteos',
            '75': 'Leite e Produtos Lácteos',
            '76': 'Leite e Produtos Lácteos',
            '77': 'Leite e Produtos Lácteos',
            '78': 'Leite e Produtos Lácteos',
            '79': 'Leite e Produtos Lácteos',
            '80': 'Açúcares e Produtos de Confeitaria',
            '81': 'Bebidas',
            '82': 'Bebidas',
            '83': 'Bebidas', 
            '84': 'Diversos',
            '85': 'Ovos e Derivados'
        }
        
        return code_groups.get(prefix, "Diversos")

    def extract_food_data_validated(self, text: str, table_num: int) -> List[Dict]:
        """Extração com validação rigorosa"""
        foods_data = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 20:
                continue
            
            # Padrão principal: CÓDIGO7 NOME PREP_CODE PREP_DESC VALORES...
            pattern = r'^(\d{7})\s+([^0-9\n]+?)\s+(\d{1,2})\s+([^0-9\n]+?)\s+(.*)'
            match = re.match(pattern, line)
            
            if match:
                code = int(match.group(1))
                name = match.group(2).strip()
                prep_code = int(match.group(3))
                preparation = match.group(4).strip()
                values_str = match.group(5)
                
                # Extrair apenas valores numéricos válidos
                raw_values = re.findall(r'[\d,.-]+', values_str)
                
                # Filtrar valores que são códigos
                valid_values = []
                for val in raw_values:
                    parsed = self.parse_numeric_value(val)
                    # Não incluir códigos como valores
                    if len(val) != 7 or not val.isdigit():
                        valid_values.append(parsed)
                
                # Criar dados do alimento
                unique_key = f"{code}_{prep_code}"
                
                food_data = {
                    'key': unique_key,
                    'code': code,
                    'name': name,
                    'prep_code': prep_code,
                    'preparation': preparation,
                    'group': self.determine_group_by_code(code),
                    'values': valid_values,
                    'table': table_num
                }
                
                foods_data.append(food_data)
        
        return foods_data

    def apply_nutrients_to_food(self, food_data: Dict):
        """Aplica nutrientes com validação"""
        unique_key = food_data['key']
        
        # Criar ou recuperar alimento
        if unique_key not in self.foods_data:
            food = IBGEFixedFood(
                code=food_data['code'],
                name=food_data['name'],
                preparation_code=food_data['prep_code'],
                preparation=food_data['preparation'],
                group=food_data['group'],
                nutrients=IBGENutrients()
            )
            self.foods_data[unique_key] = food
        else:
            food = self.foods_data[unique_key]
        
        values = food_data['values']
        table_num = food_data['table']
        
        # Mapear valores baseado na tabela COM VALIDAÇÃO
        if table_num == 1 and len(values) >= 5:  # Macronutrientes
            food.nutrients.energia_kcal = self.validate_nutritional_value(values[0], 'energia_kcal')
            food.nutrients.energia_kj = food.nutrients.energia_kcal * 4.184
            food.nutrients.proteina_g = self.validate_nutritional_value(values[1], 'proteina_g')
            food.nutrients.lipidios_g = self.validate_nutritional_value(values[2], 'lipidios_g') 
            food.nutrients.carboidrato_g = self.validate_nutritional_value(values[3], 'carboidrato_g')
            food.nutrients.carboidrato_disponivel_g = food.nutrients.carboidrato_g
            food.nutrients.fibra_alimentar_g = self.validate_nutritional_value(values[4], 'fibra_alimentar_g')
            
        elif table_num == 2 and len(values) >= 4:  # Gorduras
            food.nutrients.colesterol_mg = self.validate_nutritional_value(values[0], 'colesterol_mg')
            food.nutrients.acidos_saturados_g = self.validate_nutritional_value(values[1], 'acidos_saturados_g')
            food.nutrients.acidos_monoinsaturados_g = self.validate_nutritional_value(values[2], 'acidos_monoinsaturados_g')
            food.nutrients.acidos_poliinsaturados_g = self.validate_nutritional_value(values[3], 'acidos_poliinsaturados_g')
            
        elif table_num == 3 and len(values) >= 8:  # Minerais (ordem correta do PDF)
            # Ordem correta: Cálcio, Magnésio, Manganês, Fósforo, Ferro, Sódio, Potássio, [mais campos], Cobre, Zinco, Selênio
            # PDF: 3,51 2,23 0,29 17,77 0,08 1,19 382,00 14,53 0,01 0,49 0,45
            #      Ca   Mg   Mn   P     Fe   Na   K      ???   Cu   Zn   Se
            food.nutrients.calcio_mg = self.validate_nutritional_value(values[0], 'calcio_mg')
            food.nutrients.magnesio_mg = self.validate_nutritional_value(values[1], 'magnesio_mg')
            food.nutrients.manganes_mg = self.validate_nutritional_value(values[2], 'manganes_mg')
            food.nutrients.fosforo_mg = self.validate_nutritional_value(values[3], 'fosforo_mg')
            food.nutrients.ferro_mg = self.validate_nutritional_value(values[4], 'ferro_mg')
            food.nutrients.sodio_mg = self.validate_nutritional_value(values[5], 'sodio_mg')
            food.nutrients.potassio_mg = self.validate_nutritional_value(values[6], 'potassio_mg')
            # values[7] parece ser outro valor mineral não identificado
            if len(values) >= 9:
                food.nutrients.cobre_mg = self.validate_nutritional_value(values[8], 'cobre_mg')
            if len(values) >= 10:
                food.nutrients.zinco_mg = self.validate_nutritional_value(values[9], 'zinco_mg')
            
        elif table_num == 4 and len(values) >= 8:  # Vitaminas (ordem correta do PDF)
            # Ordem: Retinol, RAE, Tiamina, Riboflavina, Niacina, Niacina_NE, Piridoxina, B12, Folato, VitD, VitE, VitC
            # PDF: -    -    0,07   0,16      5,36    8,73      0,40      1,71  10,00  0,60  0,43  -
            food.nutrients.retinol_mcg = self.validate_nutritional_value(values[0], 'retinol_mcg')
            food.nutrients.rae_mcg = self.validate_nutritional_value(values[1], 'rae_mcg')
            food.nutrients.tiamina_mg = self.validate_nutritional_value(values[2], 'tiamina_mg')
            food.nutrients.riboflavina_mg = self.validate_nutritional_value(values[3], 'riboflavina_mg')
            food.nutrients.niacina_mg = self.validate_nutritional_value(values[4], 'niacina_mg')
            # values[5] é "Niacina NE" - pular por enquanto
            if len(values) >= 7:
                food.nutrients.piridoxina_mg = self.validate_nutritional_value(values[6], 'piridoxina_mg')
            if len(values) >= 8:
                food.nutrients.vitamina_b12_mcg = self.validate_nutritional_value(values[7], 'vitamina_b12_mcg')
            if len(values) >= 9:
                food.nutrients.folato_mcg = self.validate_nutritional_value(values[8], 'folato_mcg')
            if len(values) >= 10:
                food.nutrients.vitamina_d_mcg = self.validate_nutritional_value(values[9], 'vitamina_d_mcg')
            if len(values) >= 11:
                food.nutrients.vitamina_e_mg = self.validate_nutritional_value(values[10], 'vitamina_e_mg')
            if len(values) >= 12:
                food.nutrients.vitamina_c_mg = self.validate_nutritional_value(values[11], 'vitamina_c_mg')

    def process_fixed_extraction(self) -> List[IBGEFixedFood]:
        """Processa extração corrigida"""
        print("=== EXTRATOR IBGE CORRIGIDO ===")
        print("Aplicando validacao rigorosa...")
        
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for range_info in self.processing_ranges:
                print(f"\nProcessando {range_info['name']} (páginas {range_info['start']}-{range_info['end']}, tabela {range_info['table']})...")
                
                range_foods = 0
                for page_num in range(range_info['start'] - 1, range_info['end']):
                    try:
                        if page_num >= len(pdf_reader.pages):
                            continue
                            
                        page = pdf_reader.pages[page_num]
                        text = page.extract_text()
                        
                        if text:
                            # Extrair dados da página
                            foods_from_page = self.extract_food_data_validated(text, range_info['table'])
                            
                            # Aplicar nutrientes
                            for food_data in foods_from_page:
                                self.apply_nutrients_to_food(food_data)
                                range_foods += 1
                    
                    except Exception as e:
                        print(f"  Erro na página {page_num + 1}: {str(e)}")
                        continue
                
                print(f"  {range_info['name']}: +{range_foods} registros processados")
                print(f"  Total único acumulado: {len(self.foods_data)} alimentos")
        
        foods_list = list(self.foods_data.values())
        print(f"\nEXTRACAO CORRIGIDA COMPLETA:")
        print(f"Total de alimentos únicos: {len(foods_list)}")
        
        return foods_list

    def generate_validated_json(self, foods: List[IBGEFixedFood]) -> Dict:
        """Gera JSON validado para o sistema"""
        # Estatísticas de validação
        valid_protein = sum(1 for f in foods if f.nutrients.proteina_g > 0)
        valid_carbs = sum(1 for f in foods if f.nutrients.carboidrato_g > 0)
        valid_energy = sum(1 for f in foods if f.nutrients.energia_kcal > 0)
        valid_minerals = sum(1 for f in foods if f.nutrients.calcio_mg > 0 or f.nutrients.ferro_mg > 0)
        valid_vitamins = sum(1 for f in foods if f.nutrients.vitamina_c_mg > 0 or f.nutrients.tiamina_mg > 0)
        
        print(f"\n=== ESTATISTICAS DE VALIDACAO ===")
        print(f"Alimentos com proteína válida: {valid_protein}/{len(foods)} ({valid_protein/len(foods)*100:.1f}%)")
        print(f"Alimentos com carboidratos válidos: {valid_carbs}/{len(foods)} ({valid_carbs/len(foods)*100:.1f}%)")
        print(f"Alimentos com energia válida: {valid_energy}/{len(foods)} ({valid_energy/len(foods)*100:.1f}%)")
        print(f"Alimentos com minerais válidos: {valid_minerals}/{len(foods)} ({valid_minerals/len(foods)*100:.1f}%)")
        print(f"Alimentos com vitaminas válidas: {valid_vitamins}/{len(foods)} ({valid_vitamins/len(foods)*100:.1f}%)")
        
        # Contar por grupos
        group_stats = {}
        for food in foods:
            group = food.group
            group_stats[group] = group_stats.get(group, 0) + 1
        
        # Converter para formato do sistema
        system_foods = []
        for idx, food in enumerate(foods):
            nutrients_dict = asdict(food.nutrients)
            
            # Garantir que umidade está presente (requerido pelo sistema)
            nutrients_dict['umidade_g'] = 0.0
            
            system_food = {
                "id": 7000 + idx,
                "codigo": f"IBGE{food.code}_{food.preparation_code}",
                "fonte": "IBGE",
                "nome": f"{food.name} - {food.preparation}",
                "nomeIngles": food.name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_'),
                "categoria": food.group,
                "grupoId": self.get_group_id(food.group),
                **nutrients_dict
            }
            system_foods.append(system_food)
        
        # Estrutura JSON final
        return {
            "version": "7.0-validated-fixed",
            "source": "IBGE - Pesquisa de Orçamentos Familiares",
            "description": "Dados CORRIGIDOS com validação rigorosa",
            "lastUpdated": "2025-08-24",
            "totalFoods": len(foods),
            "extractionMethod": "Fixed parser with nutritional validation",
            "validationStats": {
                "validProtein": f"{valid_protein}/{len(foods)} ({valid_protein/len(foods)*100:.1f}%)",
                "validCarbs": f"{valid_carbs}/{len(foods)} ({valid_carbs/len(foods)*100:.1f}%)",
                "validEnergy": f"{valid_energy}/{len(foods)} ({valid_energy/len(foods)*100:.1f}%)",
                "validMinerals": f"{valid_minerals}/{len(foods)} ({valid_minerals/len(foods)*100:.1f}%)",
                "validVitamins": f"{valid_vitamins}/{len(foods)} ({valid_vitamins/len(foods)*100:.1f}%)"
            },
            "grupos": [
                {"id": 1, "nome": "Cereais e Produtos de Cereais", "cor": "#F59E0B"},
                {"id": 2, "nome": "Hortaliças", "cor": "#10B981"},
                {"id": 3, "nome": "Frutas e Produtos de Frutas", "cor": "#F97316"},
                {"id": 4, "nome": "Óleos e Gorduras", "cor": "#EF4444"},
                {"id": 5, "nome": "Peixes e Frutos do Mar", "cor": "#3B82F6"},
                {"id": 6, "nome": "Carnes e Produtos Cárneus", "cor": "#DC2626"},
                {"id": 7, "nome": "Leite e Produtos Lácteos", "cor": "#F3F4F6"},
                {"id": 8, "nome": "Bebidas", "cor": "#8B5CF6"},
                {"id": 9, "nome": "Ovos e Derivados", "cor": "#FBBF24"},
                {"id": 10, "nome": "Açúcares e Produtos de Confeitaria", "cor": "#EC4899"},
                {"id": 11, "nome": "Leguminosas", "cor": "#059669"},
                {"id": 12, "nome": "Diversos", "cor": "#6B7280"}
            ],
            "categorias": list(group_stats.keys()),
            "alimentos": system_foods
        }
    
    def get_group_id(self, group_name: str) -> int:
        """Mapeia nome do grupo para ID"""
        group_mapping = {
            "Cereais e Produtos de Cereais": 1,
            "Hortaliças": 2,
            "Frutas e Produtos de Frutas": 3,
            "Óleos e Gorduras": 4,
            "Peixes e Frutos do Mar": 5,
            "Carnes e Produtos Cárneus": 6,
            "Leite e Produtos Lácteos": 7,
            "Bebidas": 8,
            "Ovos e Derivados": 9,
            "Açúcares e Produtos de Confeitaria": 10,
            "Leguminosas": 11,
            "Diversos": 12
        }
        return group_mapping.get(group_name, 12)

def main():
    """Função principal"""
    extractor = IBGEFixedExtractor()
    
    try:
        # Processar extração corrigida
        foods = extractor.process_fixed_extraction()
        
        # Gerar JSON validado
        print("\nGerando JSON validado...")
        json_data = extractor.generate_validated_json(foods)
        
        # Salvar arquivo
        output_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\ibge_fixed_validated.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n=== EXTRACAO CORRIGIDA FINALIZADA ===")
        print(f"Arquivo: {output_path}")
        print(f"Total: {len(foods)} alimentos validados")
        
        # Mostrar distribuição por categoria
        group_stats = {}
        for food in foods:
            group = food.group
            group_stats[group] = group_stats.get(group, 0) + 1
        
        print(f"\nDistribuicao por categoria:")
        for group, count in sorted(group_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"  {group}: {count} alimentos")
        
    except Exception as e:
        print(f"Erro durante extração: {str(e)}")
        raise

if __name__ == "__main__":
    main()