#!/usr/bin/env python3
"""
Extrator IBGE EXPANDIDO - Páginas 36-340
Captura TODOS os alimentos do PDF incluindo preparações múltiplas
"""

import PyPDF2
import re
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
import os

@dataclass
class ExpandedNutrientData:
    """Dados nutricionais expandidos"""
    # Tabela 1: Macronutrientes
    energia_kcal: float = 0.0
    energia_kj: float = 0.0
    proteina_g: float = 0.0
    lipidios_g: float = 0.0
    carboidrato_g: float = 0.0
    fibra_alimentar_g: float = 0.0
    
    # Tabela 2: Gorduras
    colesterol_mg: float = 0.0
    acidos_saturados_g: float = 0.0
    acidos_monoinsaturados_g: float = 0.0
    acidos_poliinsaturados_g: float = 0.0
    acidos_trans_g: float = 0.0
    
    # Tabela 3: Minerais
    calcio_mg: float = 0.0
    magnesio_mg: float = 0.0
    fosforo_mg: float = 0.0
    ferro_mg: float = 0.0
    sodio_mg: float = 0.0
    potassio_mg: float = 0.0
    zinco_mg: float = 0.0
    cobre_mg: float = 0.0
    manganes_mg: float = 0.0
    
    # Tabela 4: Vitaminas
    retinol_mcg: float = 0.0
    vitamina_a_rae_mcg: float = 0.0
    tiamina_mg: float = 0.0
    riboflavina_mg: float = 0.0
    piridoxina_mg: float = 0.0
    niacina_mg: float = 0.0
    vitamina_c_mg: float = 0.0
    folato_mcg: float = 0.0
    vitamina_b12_mcg: float = 0.0
    vitamina_d_mcg: float = 0.0
    vitamina_e_mg: float = 0.0

@dataclass
class IBGEExpandedFood:
    """Alimento IBGE expandido"""
    code: int
    name: str
    preparation_code: int = 0
    preparation: str = ""
    group: str = ""
    nutrients: ExpandedNutrientData = None
    table_source: int = 1  # 1=Macros, 2=Gorduras, 3=Minerais, 4=Vitaminas
    
    def __post_init__(self):
        if self.nutrients is None:
            self.nutrients = ExpandedNutrientData()

class IBGEExpandedExtractor:
    """Extrator expandido para páginas 36-340"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods_data = {}  # key: codigo_preparacao
        
        # Configuração expandida de páginas
        self.processing_ranges = [
            # Tabela 1: Macronutrientes
            {'name': 'Macronutrientes', 'start': 36, 'end': 96, 'table': 1},
            # Tabela 2: Gorduras
            {'name': 'Gorduras', 'start': 97, 'end': 157, 'table': 2}, 
            # Tabela 3: Minerais
            {'name': 'Minerais', 'start': 158, 'end': 218, 'table': 3},
            # Tabela 4: Vitaminas
            {'name': 'Vitaminas', 'start': 219, 'end': 280, 'table': 4},
            # Páginas adicionais encontradas
            {'name': 'Adicionais 1', 'start': 281, 'end': 320, 'table': 1},
            {'name': 'Adicionais 2', 'start': 321, 'end': 340, 'table': 1}
        ]
        
    def parse_numeric_value(self, value: str) -> float:
        """Parse robusto de valores numéricos"""
        if not value or not isinstance(value, str):
            return 0.0
            
        value = value.strip()
        
        # Casos especiais IBGE
        if value in ['Tr', 'tr', '-', 'nd', 'NA', '', 'n.d.', 'n/d']:
            return 0.0
            
        try:
            # Limpar e converter
            value = value.replace(',', '.')
            # Remover caracteres não numéricos exceto ponto e menos
            value = re.sub(r'[^\d.-]', '', value)
            if value and value != '-':
                return float(value)
            return 0.0
        except (ValueError, AttributeError):
            return 0.0
    
    def determine_group_by_code(self, code: int) -> str:
        """Determina grupo pelo código IBGE (expandido)"""
        code_str = str(code)
        prefix = code_str[:2]
        
        # Mapeamento expandido baseado na análise do PDF
        code_groups = {
            # Faixa 63-64: Cereais
            '63': 'Cereais e Produtos de Cereais',
            '64': 'Cereais e Produtos de Cereais',
            
            # Faixa 65-66: Leguminosas/Cereais
            '65': 'Cereais e Produtos de Cereais',
            '66': 'Leguminosas',
            
            # Faixa 67-68: Hortaliças 
            '67': 'Hortaliças',
            '68': 'Frutas e Produtos de Frutas',
            
            # Faixa 69-70: Açúcares/Óleos
            '69': 'Açúcares e Produtos de Confeitaria',
            '70': 'Óleos e Gorduras',
            
            # Faixa 71-72: Carnes/Peixes
            '71': 'Carnes e Produtos Cárneus',
            '72': 'Peixes e Frutos do Mar',
            
            # Faixa 73-74: Ovos/Laticínios
            '73': 'Ovos e Derivados', 
            '74': 'Leite e Produtos Lácteos',
            
            # Faixa 75-79: Frutas/Laticínios
            '75': 'Frutas e Produtos de Frutas',
            '76': 'Frutas e Produtos de Frutas',
            '77': 'Hortaliças',
            '78': 'Leite e Produtos Lácteos',
            '79': 'Leite e Produtos Lácteos',
            
            # Faixa 80-85: Bebidas/Diversos
            '80': 'Açúcares e Produtos de Confeitaria',
            '81': 'Bebidas',
            '82': 'Bebidas', 
            '83': 'Bebidas',
            '84': 'Diversos',
            '85': 'Ovos e Derivados'
        }
        
        return code_groups.get(prefix, "Diversos")
    
    def extract_food_data_flexible(self, text: str, table_num: int) -> List[Dict]:
        """Extração flexível baseada na tabela"""
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
                
                # Extrair valores numéricos
                values = re.findall(r'[\d,.-]+', values_str)
                parsed_values = [self.parse_numeric_value(v) for v in values]
                
                # Criar chave única
                unique_key = f"{code}_{prep_code}"
                
                food_data = {
                    'key': unique_key,
                    'code': code,
                    'name': name,
                    'prep_code': prep_code,
                    'preparation': preparation,
                    'group': self.determine_group_by_code(code),
                    'values': parsed_values,
                    'table': table_num,
                    'line': line  # Para debug
                }
                
                foods_data.append(food_data)
        
        return foods_data
    
    def merge_nutritional_data(self, food_data: Dict, table_num: int):
        """Mescla dados nutricionais baseado na tabela"""
        unique_key = food_data['key']
        
        # Criar ou recuperar alimento
        if unique_key not in self.foods_data:
            food = IBGEExpandedFood(
                code=food_data['code'],
                name=food_data['name'],
                preparation_code=food_data['prep_code'],
                preparation=food_data['preparation'],
                group=food_data['group']
            )
            self.foods_data[unique_key] = food
        else:
            food = self.foods_data[unique_key]
        
        values = food_data['values']
        
        # Mapear valores baseado na tabela
        if table_num == 1 and len(values) >= 5:  # Macronutrientes
            food.nutrients.energia_kcal = values[0]
            food.nutrients.energia_kj = values[0] * 4.184
            food.nutrients.proteina_g = values[1]
            food.nutrients.lipidios_g = values[2] 
            food.nutrients.carboidrato_g = values[3]
            food.nutrients.fibra_alimentar_g = values[4]
            
        elif table_num == 2 and len(values) >= 4:  # Gorduras
            food.nutrients.colesterol_mg = values[0] if len(values) > 0 else 0.0
            food.nutrients.acidos_saturados_g = values[1] if len(values) > 1 else 0.0
            food.nutrients.acidos_monoinsaturados_g = values[2] if len(values) > 2 else 0.0
            food.nutrients.acidos_poliinsaturados_g = values[3] if len(values) > 3 else 0.0
            
        elif table_num == 3 and len(values) >= 6:  # Minerais
            food.nutrients.calcio_mg = values[0] if len(values) > 0 else 0.0
            food.nutrients.magnesio_mg = values[1] if len(values) > 1 else 0.0
            food.nutrients.fosforo_mg = values[2] if len(values) > 2 else 0.0
            food.nutrients.ferro_mg = values[3] if len(values) > 3 else 0.0
            food.nutrients.sodio_mg = values[4] if len(values) > 4 else 0.0
            food.nutrients.potassio_mg = values[5] if len(values) > 5 else 0.0
            
        elif table_num == 4 and len(values) >= 6:  # Vitaminas
            food.nutrients.retinol_mcg = values[0] if len(values) > 0 else 0.0
            food.nutrients.vitamina_a_rae_mcg = values[1] if len(values) > 1 else 0.0
            food.nutrients.tiamina_mg = values[2] if len(values) > 2 else 0.0
            food.nutrients.riboflavina_mg = values[3] if len(values) > 3 else 0.0
            food.nutrients.vitamina_c_mg = values[4] if len(values) > 4 else 0.0
            food.nutrients.niacina_mg = values[5] if len(values) > 5 else 0.0
    
    def process_expanded_ranges(self) -> List[IBGEExpandedFood]:
        """Processa todas as faixas expandidas"""
        print("=== EXTRATOR IBGE EXPANDIDO ===")
        print("Processando páginas 36-340...")
        
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            for range_info in self.processing_ranges:
                start = range_info['start'] - 1  # Converter para índice 0
                end = min(range_info['end'], total_pages) 
                table_num = range_info['table']
                
                print(f"\nProcessando {range_info['name']} (páginas {start+1}-{end}, tabela {table_num})...")
                
                range_foods = 0
                for page_num in range(start, end):
                    try:
                        page = pdf_reader.pages[page_num]
                        text = page.extract_text()
                        
                        if text:
                            # Extrair dados da página
                            page_foods = self.extract_food_data_flexible(text, table_num)
                            
                            # Mesclar com dados existentes
                            for food_data in page_foods:
                                self.merge_nutritional_data(food_data, table_num)
                            
                            range_foods += len(page_foods)
                        
                        # Progress
                        if (page_num - start + 1) % 20 == 0:
                            print(f"  Página {page_num + 1}: {len(self.foods_data)} alimentos únicos")
                            
                    except Exception as e:
                        print(f"  Erro na página {page_num + 1}: {str(e)}")
                        continue
                
                print(f"  {range_info['name']}: +{range_foods} novos registros")
        
        foods_list = list(self.foods_data.values())
        print(f"\nEXTRACAO EXPANDIDA COMPLETA:")
        print(f"Total de alimentos únicos: {len(foods_list)}")
        
        return foods_list
    
    def generate_system_json(self, foods: List[IBGEExpandedFood]) -> Dict:
        """Gera JSON para o sistema"""
        # Contar por grupos
        group_stats = {}
        for food in foods:
            group = food.group
            group_stats[group] = group_stats.get(group, 0) + 1
        
        # Converter para formato do sistema
        system_foods = []
        for i, food in enumerate(foods):
            # Nome completo com preparação
            full_name = food.name
            if food.preparation and food.preparation.lower() not in ['não se aplica', 'n/a', 'n.a.']:
                full_name += f" - {food.preparation}"
            
            system_food = {
                "id": 7000 + i,
                "codigo": f"IBGE{food.code}_{food.preparation_code}",
                "fonte": "IBGE",
                "nome": full_name,
                "nomeIngles": full_name.lower().replace(' ', '_').replace(',', '').replace('-', '_')[:50],
                "categoria": food.group,
                "grupoId": self.get_group_id(food.group),
                
                # Macronutrientes
                "umidade_g": 0.0,
                "energia_kcal": food.nutrients.energia_kcal,
                "energia_kj": food.nutrients.energia_kj,
                "proteina_g": food.nutrients.proteina_g,
                "lipidios_g": food.nutrients.lipidios_g,
                "carboidrato_g": food.nutrients.carboidrato_g,
                "carboidrato_disponivel_g": food.nutrients.carboidrato_g,
                "fibra_alimentar_g": food.nutrients.fibra_alimentar_g,
                "fibra_solavel_g": 0.0,
                "fibra_insolavel_g": 0.0,
                "cinzas_g": 0.0,
                
                # Minerais
                "calcio_mg": food.nutrients.calcio_mg,
                "magnesio_mg": food.nutrients.magnesio_mg,
                "manganes_mg": food.nutrients.manganes_mg,
                "fosforo_mg": food.nutrients.fosforo_mg,
                "ferro_mg": food.nutrients.ferro_mg,
                "sodio_mg": food.nutrients.sodio_mg,
                "potassio_mg": food.nutrients.potassio_mg,
                "cobre_mg": food.nutrients.cobre_mg,
                "zinco_mg": food.nutrients.zinco_mg,
                
                # Vitaminas
                "retinol_mcg": food.nutrients.retinol_mcg,
                "re_mcg": food.nutrients.vitamina_a_rae_mcg,
                "rae_mcg": food.nutrients.vitamina_a_rae_mcg,
                "tiamina_mg": food.nutrients.tiamina_mg,
                "riboflavina_mg": food.nutrients.riboflavina_mg,
                "piridoxina_mg": food.nutrients.piridoxina_mg,
                "niacina_mg": food.nutrients.niacina_mg,
                "vitamina_c_mg": food.nutrients.vitamina_c_mg,
                "folato_mcg": food.nutrients.folato_mcg,
                "vitamina_b12_mcg": food.nutrients.vitamina_b12_mcg,
                "vitamina_d_mcg": food.nutrients.vitamina_d_mcg,
                "vitamina_e_mg": food.nutrients.vitamina_e_mg,
                
                # Ácidos graxos
                "acidos_saturados_g": food.nutrients.acidos_saturados_g,
                "acidos_monoinsaturados_g": food.nutrients.acidos_monoinsaturados_g,
                "acidos_poliinsaturados_g": food.nutrients.acidos_poliinsaturados_g,
                "colesterol_mg": food.nutrients.colesterol_mg
            }
            system_foods.append(system_food)
        
        return {
            "version": "6.0-expanded-complete",
            "source": "IBGE - Pesquisa de Orçamentos Familiares", 
            "description": "Tabelas COMPLETAS - Páginas 36-340 processadas",
            "lastUpdated": "2025-08-24",
            "totalFoods": len(system_foods),
            "extractionMethod": "Expanded multi-table parsing (pages 36-340)",
            "grupos": [
                {"id": self.get_group_id(group), "nome": group, "cor": self.get_group_color(group)}
                for group in sorted(group_stats.keys())
            ],
            "categorias": sorted(list(group_stats.keys())),
            "alimentos": system_foods,
            "estatisticas": {
                "total_alimentos": len(system_foods),
                "grupos_count": len(group_stats),
                "alimentos_por_grupo": group_stats
            }
        }
    
    def get_group_id(self, group: str) -> int:
        group_ids = {
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
        return group_ids.get(group, 12)
    
    def get_group_color(self, group: str) -> str:
        colors = {
            "Cereais e Produtos de Cereais": "#F59E0B",
            "Hortaliças": "#10B981",
            "Frutas e Produtos de Frutas": "#F97316", 
            "Óleos e Gorduras": "#EF4444",
            "Peixes e Frutos do Mar": "#3B82F6",
            "Carnes e Produtos Cárneus": "#DC2626",
            "Leite e Produtos Lácteos": "#F3F4F6",
            "Bebidas": "#8B5CF6",
            "Ovos e Derivados": "#FBBF24",
            "Açúcares e Produtos de Confeitaria": "#EC4899",
            "Leguminosas": "#059669",
            "Diversos": "#6B7280"
        }
        return colors.get(group, "#6B7280")

def main():
    """Função principal"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDF não encontrado: {pdf_path}")
        return
    
    # Executar extração expandida
    extractor = IBGEExpandedExtractor(pdf_path)
    foods = extractor.process_expanded_ranges()
    
    if not foods:
        print("Nenhum alimento foi extraído")
        return
    
    # Gerar JSON do sistema
    print(f"\nGerando JSON expandido...")
    system_data = extractor.generate_system_json(foods)
    
    # Salvar resultado
    output_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\ibge_expanded_complete.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(system_data, f, ensure_ascii=False, indent=2)
    
    print("\n=== EXTRAÇÃO EXPANDIDA FINALIZADA ===")
    print(f"Arquivo: {output_path}")
    print(f"Total: {system_data['totalFoods']} alimentos")
    print(f"Grupos: {len(system_data['grupos'])} categorias")
    
    # Estatísticas
    print(f"\nDistribuição por categoria:")
    for group, count in system_data['estatisticas']['alimentos_por_grupo'].items():
        print(f"  {group}: {count} alimentos")

if __name__ == "__main__":
    main()