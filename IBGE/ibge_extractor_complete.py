#!/usr/bin/env python3
"""
Extrator COMPLETO IBGE - Todas as 4 tabelas nutricionais
Extrai dados de macronutrientes, gorduras, minerais e vitaminas
"""

import PyPDF2
import re
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import os

@dataclass
class CompleteNutrientData:
    """Dados nutricionais completos de todas as tabelas"""
    # Tabela 1: Macronutrientes
    energia_kcal: float = 0.0
    energia_kj: float = 0.0
    proteina_g: float = 0.0
    lipidios_g: float = 0.0
    carboidrato_g: float = 0.0
    fibra_alimentar_g: float = 0.0
    
    # Tabela 2: Gorduras e açúcar
    colesterol_mg: float = 0.0
    acidos_saturados_g: float = 0.0
    acidos_monoinsaturados_g: float = 0.0
    acidos_poliinsaturados_g: float = 0.0
    acidos_linoleico_g: float = 0.0
    acidos_linolenico_g: float = 0.0
    acidos_trans_g: float = 0.0
    acucar_total_g: float = 0.0
    acucar_adicao_g: float = 0.0
    
    # Tabela 3: Minerais
    calcio_mg: float = 0.0
    magnesio_mg: float = 0.0
    manganes_mg: float = 0.0
    fosforo_mg: float = 0.0
    ferro_mg: float = 0.0
    sodio_mg: float = 0.0
    potassio_mg: float = 0.0
    cobre_mg: float = 0.0
    zinco_mg: float = 0.0
    selenio_mcg: float = 0.0
    
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
class IBGECompleteFood:
    """Alimento IBGE com dados completos"""
    code: int
    name: str
    preparation_code: int = 0
    preparation: str = ""
    group: str = ""
    nutrients: CompleteNutrientData = None
    
    def __post_init__(self):
        if self.nutrients is None:
            self.nutrients = CompleteNutrientData()

class IBGECompleteExtractor:
    """Extrator completo de todas as 4 tabelas IBGE"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods_data = {}  # Usar dict para facilitar merge de dados
        
        # Definição das tabelas e suas faixas de páginas
        self.tables = {
            'macronutrients': {
                'start': 35, 'end': 96, 
                'name': 'Tabela 1 - Macronutrientes'
            },
            'fats': {
                'start': 97, 'end': 157,
                'name': 'Tabela 2 - Gorduras e açúcar'  
            },
            'minerals': {
                'start': 158, 'end': 218,
                'name': 'Tabela 3 - Minerais'
            },
            'vitamins': {
                'start': 219, 'end': 280,
                'name': 'Tabela 4 - Vitaminas'
            }
        }
        
    def parse_numeric_value(self, value: str) -> float:
        """Converte string para valor numérico"""
        if not value or not isinstance(value, str):
            return 0.0
            
        value = value.strip()
        if value in ['Tr', 'tr', '-', 'nd', 'NA', '']:
            return 0.0
            
        try:
            # Substitui vírgula por ponto
            value = value.replace(',', '.')
            # Remove caracteres não numéricos exceto ponto
            value = re.sub(r'[^\d.-]', '', value)
            if value:
                return float(value)
            return 0.0
        except (ValueError, AttributeError):
            return 0.0
    
    def determine_group_by_code(self, code: int) -> str:
        """Determina grupo correto pelo código IBGE"""
        code_str = str(code)
        
        # Mapeamento correto baseado nos códigos reais IBGE
        code_groups = {
            '65': 'Cereais e Produtos de Cereais',      # Cereais
            '66': 'Leguminosas',                        # Leguminosas  
            '67': 'Hortaliças',                         # Hortaliças
            '68': 'Frutas e Produtos de Frutas',        # Frutas
            '69': 'Açúcares e Produtos de Confeitaria', # Açúcares
            '70': 'Óleos e Gorduras',                   # Óleos
            '71': 'Carnes e Produtos Cárneus',          # Carnes
            '72': 'Peixes e Frutos do Mar',             # Peixes
            '73': 'Ovos e Derivados',                   # Ovos
            '74': 'Laticínios',                         # Laticínios (parte 1)
            '75': 'Frutas e Produtos de Frutas',        # Mais frutas
            '76': 'Frutas e Produtos de Frutas',        # Mais frutas
            '77': 'Hortaliças',                         # Mais hortaliças
            '78': 'Laticínios',                         # Laticínios (parte 2)  
            '79': 'Leite e Produtos Lácteos',           # Leite
            '80': 'Açúcares e Produtos de Confeitaria', # Mais açúcares
            '81': 'Bebidas',                            # Bebidas (parte 1)
            '82': 'Bebidas',                            # Bebidas (parte 2) 
            '83': 'Bebidas',                            # Bebidas (parte 3)
            '84': 'Diversos',                           # Diversos
            '85': 'Ovos e Derivados'                    # Mais ovos
        }
        
        prefix = code_str[:2]
        return code_groups.get(prefix, "Diversos")
    
    def extract_macronutrients(self, text: str) -> List[IBGECompleteFood]:
        """Extrai macronutrientes da Tabela 1"""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Padrão: CÓDIGO7DIGITOS NOME PREP_CODE PREP_DESC ENERGIA PROTEINA LIPIDIOS CARBOIDRATO FIBRA
            pattern = r'^(\d{7})\s+([^0-9]+?)\s+(\d{1,2})\s+([^0-9]+?)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)'
            match = re.match(pattern, line)
            
            if match:
                code = int(match.group(1))
                name = match.group(2).strip()
                prep_code = int(match.group(3))
                preparation = match.group(4).strip()
                
                # Criar alimento único
                unique_key = f"{code}_{prep_code}"
                
                if unique_key not in self.foods_data:
                    food = IBGECompleteFood(
                        code=code,
                        name=name,
                        preparation_code=prep_code,
                        preparation=preparation,
                        group=self.determine_group_by_code(code)
                    )
                    self.foods_data[unique_key] = food
                
                # Adicionar dados de macronutrientes
                food = self.foods_data[unique_key]
                food.nutrients.energia_kcal = self.parse_numeric_value(match.group(5))
                food.nutrients.energia_kj = food.nutrients.energia_kcal * 4.184
                food.nutrients.proteina_g = self.parse_numeric_value(match.group(6))
                food.nutrients.lipidios_g = self.parse_numeric_value(match.group(7))
                food.nutrients.carboidrato_g = self.parse_numeric_value(match.group(8))
                food.nutrients.fibra_alimentar_g = self.parse_numeric_value(match.group(9))
                
        return list(self.foods_data.values())
    
    def extract_fats_data(self, text: str):
        """Extrai dados de gorduras da Tabela 2"""
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Padrão similar mas com dados de gorduras
            pattern = r'^(\d{7})\s+([^0-9]+?)\s+(\d{1,2})\s+([^0-9]+?)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)'
            match = re.match(pattern, line)
            
            if match:
                code = int(match.group(1))
                prep_code = int(match.group(3))
                unique_key = f"{code}_{prep_code}"
                
                if unique_key in self.foods_data:
                    food = self.foods_data[unique_key]
                    # Mapear valores de gorduras (ordem pode variar)
                    values = [match.group(i) for i in range(5, 14)]
                    
                    if len(values) >= 4:
                        food.nutrients.colesterol_mg = self.parse_numeric_value(values[0])
                        food.nutrients.acidos_saturados_g = self.parse_numeric_value(values[1])
                        food.nutrients.acidos_monoinsaturados_g = self.parse_numeric_value(values[2])
                        food.nutrients.acidos_poliinsaturados_g = self.parse_numeric_value(values[3])
                    
                    if len(values) >= 8:
                        food.nutrients.acidos_linoleico_g = self.parse_numeric_value(values[4])
                        food.nutrients.acidos_linolenico_g = self.parse_numeric_value(values[5])
                        food.nutrients.acidos_trans_g = self.parse_numeric_value(values[6])
                        food.nutrients.acucar_total_g = self.parse_numeric_value(values[7])
    
    def extract_minerals_data(self, text: str):
        """Extrai dados de minerais da Tabela 3"""
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Padrão para minerais
            pattern = r'^(\d{7})\s+([^0-9]+?)\s+(\d{1,2})\s+([^0-9]+?)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)'
            match = re.match(pattern, line)
            
            if match:
                code = int(match.group(1))
                prep_code = int(match.group(3))
                unique_key = f"{code}_{prep_code}"
                
                if unique_key in self.foods_data:
                    food = self.foods_data[unique_key]
                    values = [match.group(i) for i in range(5, 14)]
                    
                    # Mapear minerais (ordem baseada na tabela IBGE)
                    if len(values) >= 9:
                        food.nutrients.calcio_mg = self.parse_numeric_value(values[0])
                        food.nutrients.magnesio_mg = self.parse_numeric_value(values[1])
                        food.nutrients.manganes_mg = self.parse_numeric_value(values[2])
                        food.nutrients.fosforo_mg = self.parse_numeric_value(values[3])
                        food.nutrients.ferro_mg = self.parse_numeric_value(values[4])
                        food.nutrients.sodio_mg = self.parse_numeric_value(values[5])
                        food.nutrients.potassio_mg = self.parse_numeric_value(values[6])
                        food.nutrients.cobre_mg = self.parse_numeric_value(values[7])
                        food.nutrients.zinco_mg = self.parse_numeric_value(values[8])
    
    def extract_vitamins_data(self, text: str):
        """Extrai dados de vitaminas da Tabela 4"""
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Padrão para vitaminas
            pattern = r'^(\d{7})\s+([^0-9]+?)\s+(\d{1,2})\s+([^0-9]+?)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)\s+([\d,.-]+)'
            match = re.match(pattern, line)
            
            if match:
                code = int(match.group(1))
                prep_code = int(match.group(3))
                unique_key = f"{code}_{prep_code}"
                
                if unique_key in self.foods_data:
                    food = self.foods_data[unique_key]
                    values = [match.group(i) for i in range(5, 13)]
                    
                    # Mapear vitaminas
                    if len(values) >= 8:
                        food.nutrients.retinol_mcg = self.parse_numeric_value(values[0])
                        food.nutrients.vitamina_a_rae_mcg = self.parse_numeric_value(values[1])
                        food.nutrients.tiamina_mg = self.parse_numeric_value(values[2])
                        food.nutrients.riboflavina_mg = self.parse_numeric_value(values[3])
                        food.nutrients.piridoxina_mg = self.parse_numeric_value(values[4])
                        food.nutrients.niacina_mg = self.parse_numeric_value(values[5])
                        food.nutrients.vitamina_c_mg = self.parse_numeric_value(values[6])
                        food.nutrients.folato_mcg = self.parse_numeric_value(values[7])
    
    def process_table(self, table_name: str, table_info: Dict) -> int:
        """Processa uma tabela específica"""
        print(f"Processando {table_info['name']}...")
        
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            foods_count = 0
            start_page = table_info['start']
            end_page = min(table_info['end'], len(pdf_reader.pages))
            
            for page_num in range(start_page, end_page):
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    if text:
                        # Processar baseado no tipo de tabela
                        if table_name == 'macronutrients':
                            self.extract_macronutrients(text)
                        elif table_name == 'fats':
                            self.extract_fats_data(text)
                        elif table_name == 'minerals':
                            self.extract_minerals_data(text)
                        elif table_name == 'vitamins':
                            self.extract_vitamins_data(text)
                    
                    # Progress update
                    if (page_num - start_page + 1) % 10 == 0:
                        current_count = len(self.foods_data)
                        print(f"  Página {page_num + 1}: {current_count} alimentos")
                        
                except Exception as e:
                    print(f"  Erro na página {page_num + 1}: {str(e)}")
                    continue
            
            return len(self.foods_data)
    
    def extract_all_data(self) -> List[IBGECompleteFood]:
        """Extrai dados de todas as 4 tabelas"""
        print("=== EXTRATOR COMPLETO IBGE - 4 TABELAS ===")
        
        # Processar cada tabela em sequência
        for table_name, table_info in self.tables.items():
            self.process_table(table_name, table_info)
        
        foods_list = list(self.foods_data.values())
        
        print(f"\nEXTRAÇÃO COMPLETA:")
        print(f"Total de alimentos únicos: {len(foods_list)}")
        
        return foods_list
    
    def generate_system_json(self, foods: List[IBGECompleteFood]) -> Dict[str, Any]:
        """Gera JSON compatível com o sistema"""
        
        # Estatísticas por grupo
        group_stats = {}
        for food in foods:
            group = food.group
            group_stats[group] = group_stats.get(group, 0) + 1
        
        # Converter alimentos para formato do sistema
        system_foods = []
        for i, food in enumerate(foods):
            # Nome único combinando alimento + preparação
            full_name = f"{food.name}"
            if food.preparation and food.preparation.lower() not in ['não se aplica', 'n/a']:
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
        
        # Estrutura final
        return {
            "version": "4.0-complete-fixed",
            "source": "IBGE - Pesquisa de Orçamentos Familiares",
            "description": "Tabelas COMPLETAS de Composição Nutricional - 4 tabelas processadas",
            "lastUpdated": "2025-08-24",
            "totalFoods": len(system_foods),
            "extractionMethod": "Multi-table PDF parsing - Complete data",
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
        """Retorna ID do grupo"""
        group_ids = {
            "Cereais e Produtos de Cereais": 1,
            "Hortaliças": 2,
            "Frutas e Produtos de Frutas": 3,
            "Óleos e Gorduras": 4,
            "Peixes e Frutos do Mar": 5,
            "Carnes e Produtos Cárneus": 6,
            "Leite e Produtos Lácteos": 7,
            "Laticínios": 7,  # Mesmo grupo
            "Bebidas": 8,
            "Ovos e Derivados": 9,
            "Açúcares e Produtos de Confeitaria": 10,
            "Leguminosas": 11,
            "Diversos": 12
        }
        return group_ids.get(group, 12)
    
    def get_group_color(self, group: str) -> str:
        """Retorna cor do grupo"""
        colors = {
            "Cereais e Produtos de Cereais": "#F59E0B",
            "Hortaliças": "#10B981", 
            "Frutas e Produtos de Frutas": "#F97316",
            "Óleos e Gorduras": "#EF4444",
            "Peixes e Frutos do Mar": "#3B82F6",
            "Carnes e Produtos Cárneus": "#DC2626",
            "Leite e Produtos Lácteos": "#F3F4F6",
            "Laticínios": "#F3F4F6",
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
    
    # Executar extração completa
    extractor = IBGECompleteExtractor(pdf_path)
    foods = extractor.extract_all_data()
    
    if not foods:
        print("Nenhum alimento foi extraído")
        return
    
    # Gerar JSON do sistema
    print(f"\nGerando JSON do sistema...")
    system_data = extractor.generate_system_json(foods)
    
    # Salvar resultado
    output_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\ibge_complete_fixed.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(system_data, f, ensure_ascii=False, indent=2)
    
    print("\n=== EXTRAÇÃO COMPLETA FINALIZADA ===")
    print(f"Arquivo salvo: {output_path}")
    print(f"Total: {system_data['totalFoods']} alimentos únicos")
    print(f"Grupos: {len(system_data['grupos'])} categorias")
    
    # Estatísticas detalhadas
    print(f"\nDistribuição por categoria:")
    for group, count in system_data['estatisticas']['alimentos_por_grupo'].items():
        print(f"  {group}: {count} alimentos")

if __name__ == "__main__":
    main()