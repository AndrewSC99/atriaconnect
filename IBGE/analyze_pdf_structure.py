#!/usr/bin/env python3
"""
Análise detalhada da estrutura do PDF IBGE para identificar as tabelas
"""

import PyPDF2
import re

def analyze_pdf_structure():
    """Analisa a estrutura das tabelas no PDF"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        print(f"=== ANÁLISE DA ESTRUTURA DO PDF IBGE ===")
        print(f"Total de páginas: {len(pdf_reader.pages)}")
        
        # Analisar diferentes faixas de páginas
        page_ranges = [
            (40, 60, "Tabela 1 - Macronutrientes"),
            (100, 120, "Tabela 2 - Possíveis Minerais"),
            (150, 170, "Tabela 3 - Possíveis Vitaminas"),
            (200, 220, "Tabela 4 - Outros dados"),
        ]
        
        for start, end, description in page_ranges:
            print(f"\n{'='*50}")
            print(f"{description} (Páginas {start}-{end})")
            print('='*50)
            
            # Examinar algumas páginas da faixa
            sample_pages = [start, start + 5, start + 10]
            
            for page_num in sample_pages:
                if page_num < len(pdf_reader.pages):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    print(f"\n--- PÁGINA {page_num + 1} ---")
                    
                    # Identificar cabeçalhos de tabela
                    headers = re.findall(r'Tabela \d+.*?(?=\n)', text, re.IGNORECASE)
                    if headers:
                        for header in headers:
                            print(f"Cabeçalho: {header.strip()}")
                    
                    # Identificar colunas (linhas que parecem cabeçalhos de colunas)
                    lines = text.split('\n')
                    for i, line in enumerate(lines[:20]):  # Primeiras 20 linhas
                        if any(word in line.lower() for word in ['energia', 'proteina', 'calcio', 'ferro', 'vitamina']):
                            print(f"Coluna detectada: {line.strip()}")
                    
                    # Buscar padrões de dados (códigos + valores)
                    data_patterns = re.findall(r'\d{7}\s+[^\d\n]+?\s+(?:\d+\s+)*[\d,.-]+', text)
                    if data_patterns:
                        print(f"Padrões de dados encontrados: {len(data_patterns)}")
                        print(f"Exemplo: {data_patterns[0][:100]}...")

def find_table_boundaries():
    """Encontra os limites exatos das tabelas"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        print(f"\n{'='*50}")
        print(f"MAPEAMENTO DETALHADO DAS TABELAS")
        print('='*50)
        
        table_info = {}
        
        for page_num in range(30, min(250, len(pdf_reader.pages))):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # Identificar início de tabelas
            table_matches = re.findall(r'Tabela (\d+)[^\n]*', text, re.IGNORECASE)
            if table_matches:
                for table_num in table_matches:
                    if table_num not in table_info:
                        table_info[table_num] = {'start': page_num + 1, 'content': []}
                    
                    # Capturar descrição da tabela
                    table_desc = re.search(r'Tabela ' + table_num + r'[^\n]*', text, re.IGNORECASE)
                    if table_desc:
                        table_info[table_num]['description'] = table_desc.group().strip()
        
        # Exibir informações das tabelas
        for table_num, info in sorted(table_info.items()):
            print(f"\nTabela {table_num}:")
            print(f"  Início: Página {info['start']}")
            print(f"  Descrição: {info.get('description', 'N/A')}")

if __name__ == "__main__":
    analyze_pdf_structure()
    find_table_boundaries()