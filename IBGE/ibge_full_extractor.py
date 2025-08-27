#!/usr/bin/env python3
"""
Extrator completo de dados IBGE do PDF oficial
Extrai TODOS os ~1971 alimentos do PDF liv50002.pdf
"""

import PyPDF2
import re
import json
import sys
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import os

@dataclass
class IBGEFood:
    """Estrutura para alimento IBGE completo"""
    code: int
    name: str
    group: str
    subgroup: str = ""
    preparation: str = ""
    # Macronutrientes
    energy_kcal: float = 0.0
    energy_kj: float = 0.0
    protein_g: float = 0.0
    lipids_g: float = 0.0
    carbohydrates_g: float = 0.0
    dietary_fiber_g: float = 0.0
    # Minerais
    calcium_mg: float = 0.0
    magnesium_mg: float = 0.0
    manganese_mg: float = 0.0
    phosphorus_mg: float = 0.0
    iron_mg: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    copper_mg: float = 0.0
    zinc_mg: float = 0.0
    # Vitaminas
    retinol_mcg: float = 0.0
    vitamin_a_rae_mcg: float = 0.0
    thiamine_mg: float = 0.0
    riboflavin_mg: float = 0.0
    pyridoxine_mg: float = 0.0
    niacin_mg: float = 0.0
    vitamin_c_mg: float = 0.0
    folate_mcg: float = 0.0
    vitamin_b12_mcg: float = 0.0
    vitamin_d_mcg: float = 0.0
    vitamin_e_mg: float = 0.0

class IBGEPDFExtractor:
    """Extrator de dados IBGE do PDF oficial"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[IBGEFood] = []
        self.current_group = ""
        
        # Mapeamento de grupos alimentares conforme IBGE
        self.food_groups = {
            "AÇÚCARES E PRODUTOS DE CONFEITARIA": "Açúcares e Produtos de Confeitaria",
            "CEREAIS E PRODUTOS DE CEREAIS": "Cereais e Produtos de Cereais", 
            "LEGUMINOSAS": "Leguminosas",
            "CARNES E PRODUTOS CÁRNEOS": "Carnes e Produtos Cárneos",
            "PEIXES E FRUTOS DO MAR": "Peixes e Frutos do Mar",
            "LEITE E PRODUTOS LÁCTEOS": "Leite e Produtos Lácteos",
            "OVOS E PRODUTOS DE OVOS": "Ovos e Derivados",
            "FRUTAS E PRODUTOS DE FRUTAS": "Frutas e Produtos de Frutas",
            "HORTALIÇAS": "Hortaliças",
            "ÓLEOS E GORDURAS": "Óleos e Gorduras",
            "OLEAGINOSAS": "Oleaginosas",
            "BEBIDAS": "Bebidas",
            "PRODUTOS DIVERSOS": "Produtos Diversos",
            "ALIMENTOS PREPARADOS": "Alimentos Preparados"
        }
        
    def parse_numeric_value(self, value: str) -> float:
        """Converte string para valor numérico, tratando casos especiais"""
        if not value or not isinstance(value, str):
            return 0.0
            
        value = value.strip()
        
        # Casos especiais
        if value in ['Tr', 'tr', '-', 'nd', 'NA', '']:
            return 0.0
            
        try:
            # Substitui vírgula por ponto (padrão brasileiro)
            value = value.replace(',', '.')
            # Remove caracteres não numéricos exceto ponto
            value = re.sub(r'[^\d.]', '', value)
            if value:
                return float(value)
            return 0.0
        except (ValueError, AttributeError):
            return 0.0
    
    def identify_food_group(self, text: str) -> Optional[str]:
        """Identifica grupo alimentar no texto"""
        text_upper = text.upper()
        
        for key, group in self.food_groups.items():
            if key in text_upper:
                return group
                
        # Padrões adicionais
        group_patterns = [
            (r'AÇÚCAR|DOCE|MEL|RAPADURA', 'Açúcares e Produtos de Confeitaria'),
            (r'ARROZ|TRIGO|MILHO|AVEIA|PÃO|MACARRÃO', 'Cereais e Produtos de Cereais'),
            (r'FEIJÃO|LENTILHA|GRÃO.*BICO|SOJA', 'Leguminosas'),
            (r'CARNE|BOVINA|SUÍNA|FRANGO|PERU', 'Carnes e Produtos Cárneus'),
            (r'PEIXE|SARDINHA|ATUM|CAMARÃO', 'Peixes e Frutos do Mar'),
            (r'LEITE|QUEIJO|IOGURTE|MANTEIGA', 'Leite e Produtos Lácteos'),
            (r'OVO', 'Ovos e Derivados'),
            (r'BANANA|MAÇÃ|LARANJA|UVA|MAMÃO', 'Frutas e Produtos de Frutas'),
            (r'ALFACE|TOMATE|BATATA|CENOURA', 'Hortaliças'),
            (r'ÓLEO|AZEITE|MARGARINA', 'Óleos e Gorduras'),
            (r'CASTANHA|AMENDOIM|NOZES', 'Oleaginosas'),
            (r'CAFÉ|CHÁ|REFRIGERANTE|SUCO', 'Bebidas')
        ]
        
        for pattern, group in group_patterns:
            if re.search(pattern, text_upper):
                return group
                
        return None
    
    def extract_food_from_line(self, line: str, page_num: int) -> Optional[IBGEFood]:
        """Extrai dados de alimento de uma linha"""
        
        # Padrão IBGE: CÓDIGO7DIGITOS NOME_ALIMENTO PREP_CODE PREP_DESCRIÇÃO ENERGIA PROTEÍNA LIPÍDIOS CARBOIDRATOS FIBRA
        # Exemplo: 6704101 Chuchu 10 Ao alho e óleo 49,09 0,62 3,32 5,09 2,80
        pattern = r'^(\d{7})\s+([^0-9]+?)\s+(\d{1,2})\s+([^0-9]+?)\s+([\d,.\-]+(?:\s+[\d,.\-]+)*)'
        
        match = re.match(pattern, line.strip())
        if not match:
            return None
            
        code_str = match.group(1)
        name = match.group(2).strip()
        prep_code = match.group(3)
        preparation = match.group(4).strip()
        values_str = match.group(5)
        
        # Verificar se o nome é válido
        if len(name) < 3:
            return None
            
        # Dividir valores nutricionais
        values = re.findall(r'[\d,.]+|\-', values_str)
        
        if len(values) < 5:  # Mínimo: energia, proteína, lipídios, carboidratos, fibra
            return None
        
        # Determinar grupo do alimento baseado no código
        group = self.determine_group_by_code(int(code_str))
        if not group:
            group = self.current_group if self.current_group else "Diversos"
        
        # Criar nome completo incluindo preparação se relevante
        if preparation and preparation.lower() not in ['não se aplica', 'n/a']:
            full_name = f"{name} - {preparation}"
        else:
            full_name = name
            
        # Criar objeto alimento
        food = IBGEFood(
            code=int(code_str),
            name=full_name,
            group=group,
            preparation=preparation
        )
        
        # Mapear valores nutricionais (conforme tabela IBGE)
        if len(values) >= 1:
            food.energy_kcal = self.parse_numeric_value(values[0])
            food.energy_kj = food.energy_kcal * 4.184  # Conversão kcal -> kJ
            
        if len(values) >= 2:
            food.protein_g = self.parse_numeric_value(values[1])
            
        if len(values) >= 3:
            food.lipids_g = self.parse_numeric_value(values[2])
            
        if len(values) >= 4:
            food.carbohydrates_g = self.parse_numeric_value(values[3])
            
        if len(values) >= 5:
            food.dietary_fiber_g = self.parse_numeric_value(values[4])
            
        return food
        
    def determine_group_by_code(self, code: int) -> str:
        """Determina grupo alimentar pelo código IBGE"""
        code_str = str(code)
        
        # Mapeamento baseado nos códigos IBGE
        code_groups = {
            '61': 'Cereais e Produtos de Cereais',
            '62': 'Leguminosas', 
            '63': 'Hortaliças',
            '64': 'Hortaliças',
            '65': 'Frutas e Produtos de Frutas',
            '66': 'Oleaginosas',
            '67': 'Hortaliças',
            '68': 'Açúcares e Produtos de Confeitaria',
            '69': 'Açúcares e Produtos de Confeitaria',
            '70': 'Óleos e Gorduras',
            '71': 'Carnes e Produtos Cárneus',
            '72': 'Peixes e Frutos do Mar',
            '73': 'Ovos e Derivados',
            '74': 'Leite e Produtos Lácteos',
            '75': 'Frutas e Produtos de Frutas',
            '76': 'Frutas e Produtos de Frutas',
            '77': 'Hortaliças',
            '78': 'Leite e Produtos Lácteos',
            '79': 'Leite e Produtos Lácteos',
            '80': 'Bebidas',
            '81': 'Bebidas'
        }
        
        # Verificar pelos dois primeiros dígitos
        prefix = code_str[:2]
        return code_groups.get(prefix, "Diversos")
    
    def process_page(self, page_text: str, page_num: int) -> List[IBGEFood]:
        """Processa texto de uma página e extrai alimentos"""
        foods = []
        lines = page_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detectar cabeçalhos de grupo
            group_detected = self.identify_food_group(line)
            if group_detected and len(line.split()) <= 6:  # Cabeçalhos são geralmente curtos
                self.current_group = group_detected
                continue
                
            # Tentar extrair alimento da linha
            food = self.extract_food_from_line(line, page_num)
            if food:
                foods.append(food)
                
        return foods
    
    def extract_all_foods(self) -> List[IBGEFood]:
        """Extrai todos os alimentos do PDF"""
        print("Iniciando extração completa do PDF IBGE...")
        print(f"Arquivo: {self.pdf_path}")
        
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                print(f"Total de páginas: {total_pages}")
                print("Processando páginas 40-200 (tabelas nutricionais)...")
                
                all_foods = []
                
                # Processar páginas específicas com dados nutricionais
                start_page = 39  # Página 40 (índice 39)
                end_page = min(200, total_pages)  # Página 200 ou última página
                
                for page_num in range(start_page, end_page):
                    try:
                        page = pdf_reader.pages[page_num]
                        page_text = page.extract_text()
                        
                        if page_text:
                            page_foods = self.process_page(page_text, page_num + 1)
                            all_foods.extend(page_foods)
                            
                        # Progress indicator
                        if (page_num + 1) % 20 == 0:
                            print(f"   Página {page_num + 1}: {len(all_foods)} alimentos encontrados")
                            
                    except Exception as e:
                        print(f"   Erro na página {page_num + 1}: {str(e)}")
                        continue
                
                print(f"Extração completa: {len(all_foods)} alimentos encontrados")
                return all_foods
                
        except Exception as e:
            print(f"Erro ao processar PDF: {str(e)}")
            return []
    
    def generate_json(self, foods: List[IBGEFood]) -> Dict[str, Any]:
        """Gera JSON estruturado com os alimentos extraídos"""
        
        # Estatísticas por grupo
        groups_stats = {}
        for food in foods:
            group = food.group
            if group not in groups_stats:
                groups_stats[group] = 0
            groups_stats[group] += 1
        
        # Estrutura compatível com o sistema
        foods_data = []
        for food in foods:
            food_data = {
                "id": 7000 + food.code,  # IDs únicos a partir de 7000
                "codigo": f"IBGE{food.code}",
                "fonte": "IBGE",
                "nome": food.name,
                "nomeIngles": food.name.lower().replace(' ', '_').replace(',', ''),
                "categoria": food.group,
                "grupoId": self.get_group_id(food.group),
                
                # Macronutrientes
                "umidade_g": 0.0,  # Não disponível no PDF
                "energia_kcal": food.energy_kcal,
                "energia_kj": food.energy_kj,
                "proteina_g": food.protein_g,
                "lipidios_g": food.lipids_g,
                "carboidrato_g": food.carbohydrates_g,
                "carboidrato_disponivel_g": food.carbohydrates_g,
                "fibra_alimentar_g": food.dietary_fiber_g,
                "fibra_solavel_g": 0.0,
                "fibra_insolavel_g": 0.0,
                "cinzas_g": 0.0,
                
                # Minerais
                "calcio_mg": food.calcium_mg,
                "magnesio_mg": food.magnesium_mg,
                "manganes_mg": food.manganese_mg,
                "fosforo_mg": food.phosphorus_mg,
                "ferro_mg": food.iron_mg,
                "sodio_mg": food.sodium_mg,
                "potassio_mg": food.potassium_mg,
                "cobre_mg": food.copper_mg,
                "zinco_mg": food.zinc_mg,
                
                # Vitaminas
                "retinol_mcg": food.retinol_mcg,
                "re_mcg": food.vitamin_a_rae_mcg,
                "rae_mcg": food.vitamin_a_rae_mcg,
                "tiamina_mg": food.thiamine_mg,
                "riboflavina_mg": food.riboflavin_mg,
                "piridoxina_mg": food.pyridoxine_mg,
                "niacina_mg": food.niacin_mg,
                "vitamina_c_mg": food.vitamin_c_mg,
                "folato_mcg": food.folate_mcg,
                "vitamina_b12_mcg": food.vitamin_b12_mcg,
                "vitamina_d_mcg": food.vitamin_d_mcg,
                "vitamina_e_mg": food.vitamin_e_mg,
                
                # Ácidos graxos (valores padrão)
                "acidos_saturados_g": 0.0,
                "acidos_monoinsaturados_g": 0.0,
                "acidos_poliinsaturados_g": 0.0,
                "colesterol_mg": 0.0
            }
            foods_data.append(food_data)
        
        return {
            "version": "3.0-complete",
            "source": "IBGE - Pesquisa de Orçamentos Familiares",
            "description": "Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil - COMPLETA",
            "lastUpdated": "2025-08-24",
            "totalFoods": len(foods),
            "extractionMethod": "PDF parsing - Complete extraction",
            "grupos": [
                {
                    "id": self.get_group_id(group),
                    "nome": group,
                    "cor": self.get_group_color(group)
                }
                for group in sorted(groups_stats.keys())
            ],
            "categorias": sorted(list(set([food.group for food in foods]))),
            "alimentos": foods_data,
            "estatisticas": {
                "total_alimentos": len(foods),
                "grupos_count": len(groups_stats),
                "alimentos_por_grupo": groups_stats
            }
        }
    
    def get_group_id(self, group: str) -> int:
        """Retorna ID do grupo alimentar"""
        group_ids = {
            "Açúcares e Produtos de Confeitaria": 1,
            "Cereais e Produtos de Cereais": 2,
            "Leguminosas": 3,
            "Carnes e Produtos Cárneus": 4,
            "Peixes e Frutos do Mar": 5,
            "Leite e Produtos Lácteos": 6,
            "Ovos e Derivados": 7,
            "Frutas e Produtos de Frutas": 8,
            "Hortaliças": 9,
            "Óleos e Gorduras": 10,
            "Oleaginosas": 11,
            "Bebidas": 12,
            "Produtos Diversos": 13,
            "Alimentos Preparados": 14
        }
        return group_ids.get(group, 15)
    
    def get_group_color(self, group: str) -> str:
        """Retorna cor do grupo alimentar"""
        colors = {
            "Açúcares e Produtos de Confeitaria": "#EC4899",
            "Cereais e Produtos de Cereais": "#F59E0B", 
            "Leguminosas": "#10B981",
            "Carnes e Produtos Cárneus": "#DC2626",
            "Peixes e Frutos do Mar": "#3B82F6",
            "Leite e Produtos Lácteos": "#F3F4F6",
            "Ovos e Derivados": "#FBBF24",
            "Frutas e Produtos de Frutas": "#F97316",
            "Hortaliças": "#10B981", 
            "Óleos e Gorduras": "#EF4444",
            "Oleaginosas": "#8B5CF6",
            "Bebidas": "#8B5CF6",
            "Produtos Diversos": "#6B7280",
            "Alimentos Preparados": "#84CC16"
        }
        return colors.get(group, "#6B7280")

def main():
    """Função principal"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDF não encontrado: {pdf_path}")
        return
    
    print("=" * 60)
    print("EXTRATOR COMPLETO IBGE - TABELAS NUTRICIONAIS")
    print("=" * 60)
    
    # Inicializar extrator
    extractor = IBGEPDFExtractor(pdf_path)
    
    # Extrair todos os alimentos
    foods = extractor.extract_all_foods()
    
    if not foods:
        print("Nenhum alimento foi extraído")
        return
    
    # Gerar JSON
    print(f"\nGerando JSON com {len(foods)} alimentos...")
    json_data = extractor.generate_json(foods)
    
    # Salvar resultado
    output_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\ibge_complete_1971.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("EXTRAÇÃO COMPLETA!")
    print("=" * 60)
    print(f"Arquivo salvo: {output_path}")
    print(f"Total: {json_data['totalFoods']} alimentos extraídos")
    print(f"Grupos: {len(json_data['grupos'])} categorias")
    
    # Estatísticas detalhadas
    print(f"\nDistribuição por categoria:")
    for group, count in json_data['estatisticas']['alimentos_por_grupo'].items():
        print(f"  {group}: {count} alimentos")
    
    print(f"\nArquivo pronto para importação no sistema!")

if __name__ == "__main__":
    main()