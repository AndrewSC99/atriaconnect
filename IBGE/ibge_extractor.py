#!/usr/bin/env python3
"""
Extrator de dados nutricionais da Tabela IBGE POF 2008-2009
Processa o PDF e gera arquivo JSON com os alimentos e seus dados nutricionais
"""

import json
import re
import requests
from typing import List, Dict, Optional
import PyPDF2
from io import BytesIO

class IBGEFoodExtractor:
    def __init__(self):
        self.pdf_url = "https://biblioteca.ibge.gov.br/visualizacao/livros/liv50002.pdf"
        self.foods_data = []
        
    def download_pdf(self) -> BytesIO:
        """Baixa o PDF do IBGE"""
        print("Baixando PDF do IBGE...")
        response = requests.get(self.pdf_url)
        response.raise_for_status()
        return BytesIO(response.content)
        
    def extract_foods_from_pdf(self, pdf_stream: BytesIO) -> List[Dict]:
        """Extrai os alimentos do PDF"""
        print("Extraindo dados do PDF...")
        foods = []
        
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            # Páginas que contêm as tabelas de alimentos (aproximadamente páginas 40-200)
            for page_num in range(40, min(200, len(pdf_reader.pages))):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                # Processa o texto da página para extrair alimentos
                page_foods = self.parse_food_data(text, page_num)
                foods.extend(page_foods)
                
                if page_num % 20 == 0:
                    print(f"Processada página {page_num}, {len(foods)} alimentos encontrados...")
                    
        except Exception as e:
            print(f"Erro ao processar PDF: {e}")
            
        return foods
        
    def parse_food_data(self, text: str, page_num: int) -> List[Dict]:
        """Analisa o texto da página e extrai dados dos alimentos"""
        foods = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Padrão para identificar linhas com códigos de alimentos
            # Formato: código seguido de descrição e valores nutricionais
            food_pattern = r'^(\d{4,5})\s+(.+?)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)'
            match = re.match(food_pattern, line)
            
            if match:
                code = match.group(1)
                description = match.group(2).strip()
                energy = self.parse_number(match.group(3))
                protein = self.parse_number(match.group(4)) 
                lipids = self.parse_number(match.group(5))
                carbs = self.parse_number(match.group(6))
                fiber = self.parse_number(match.group(7))
                
                # Verifica se a descrição não é apenas números ou muito curta
                if len(description) > 3 and not description.isdigit():
                    food_item = {
                        "code": int(code),
                        "description": description,
                        "preparation": self.extract_preparation(description),
                        "macronutrients": {
                            "energy_kcal": energy,
                            "protein_g": protein,
                            "lipids_g": lipids,
                            "carbohydrates_g": carbs,
                            "dietary_fiber_g": fiber
                        },
                        "source_page": page_num
                    }
                    foods.append(food_item)
                    
        return foods
        
    def parse_number(self, value: str) -> Optional[float]:
        """Converte string para número, lidando com vírgulas decimais"""
        if not value or value.strip() == '-' or value.strip() == 'tr':
            return None
            
        try:
            # Substitui vírgula por ponto para decimais brasileiros
            clean_value = value.replace(',', '.').strip()
            return float(clean_value)
        except (ValueError, AttributeError):
            return None
            
    def extract_preparation(self, description: str) -> str:
        """Extrai o modo de preparo da descrição do alimento"""
        preparation_keywords = ['cru', 'cozido', 'assado', 'frito', 'grelhado', 'refogado', 
                              'in natura', 'fresco', 'seco', 'tostado', 'doce', 'salgado']
        
        desc_lower = description.lower()
        for keyword in preparation_keywords:
            if keyword in desc_lower:
                return keyword
                
        return "não especificado"
        
    def save_to_json(self, foods: List[Dict], filename: str = "alimentos_ibge.json"):
        """Salva os dados em arquivo JSON"""
        print(f"Salvando {len(foods)} alimentos em {filename}...")
        
        output_data = {
            "metadata": {
                "source": "IBGE - Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil",
                "url": self.pdf_url,
                "total_foods": len(foods),
                "extraction_method": "Python PDF extraction"
            },
            "foods": foods
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
            
    def run_extraction(self) -> List[Dict]:
        """Executa o processo completo de extração"""
        print("=== Extrator de Dados Nutricionais IBGE ===")
        
        try:
            # Baixa o PDF
            pdf_stream = self.download_pdf()
            
            # Extrai os alimentos
            foods = self.extract_foods_from_pdf(pdf_stream)
            
            if foods:
                # Salva em JSON
                self.save_to_json(foods)
                
                print(f"\n=== RESULTADOS ===")
                print(f"Total de alimentos extraídos: {len(foods)}")
                print(f"Arquivo salvo: alimentos_ibge.json")
                
                # Mostra alguns exemplos
                print(f"\nPrimeiros 5 alimentos encontrados:")
                for i, food in enumerate(foods[:5]):
                    print(f"{i+1}. {food['description']} (Código: {food['code']})")
                    
            else:
                print("Nenhum alimento foi extraído. Verificar formato do PDF.")
                
            return foods
            
        except Exception as e:
            print(f"Erro durante a extração: {e}")
            return []

if __name__ == "__main__":
    extractor = IBGEFoodExtractor()
    foods = extractor.run_extraction()