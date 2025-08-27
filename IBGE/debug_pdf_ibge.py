#!/usr/bin/env python3
"""
Script para debug do PDF IBGE - examinar formato das páginas
"""

import PyPDF2
import re

def debug_pdf_pages():
    """Debug das páginas específicas do PDF"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        # Examinar páginas específicas
        test_pages = [45, 50, 60, 80, 100]
        
        for page_num in test_pages:
            if page_num < len(pdf_reader.pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                print(f"\n{'='*50}")
                print(f"PÁGINA {page_num + 1}")
                print('='*50)
                print(text[:1000] + "..." if len(text) > 1000 else text)
                
                # Buscar padrões de códigos e números
                codes = re.findall(r'\b\d{4,5}\b', text)
                if codes:
                    print(f"\nCódigos encontrados: {codes[:10]}")  # Primeiros 10
                
                # Buscar possíveis linhas de alimentos
                lines = text.split('\n')
                food_lines = []
                for line in lines:
                    if re.search(r'\d{4,5}.*\d+', line):
                        food_lines.append(line.strip())
                
                if food_lines:
                    print(f"\nPossíveis linhas de alimentos:")
                    for line in food_lines[:5]:  # Primeiras 5
                        print(f"  {line}")

if __name__ == "__main__":
    debug_pdf_pages()