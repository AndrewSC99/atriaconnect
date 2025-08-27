#!/usr/bin/env python3
"""
Encontra onde estão os 886 alimentos faltantes do PDF IBGE
Analisa todo o PDF para identificar padrões não capturados
"""

import PyPDF2
import re
import json

def analyze_full_pdf():
    """Analisa todo o PDF para encontrar padrões de alimentos"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    food_codes_found = set()
    page_food_count = {}
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"=== ANÁLISE COMPLETA DO PDF IBGE ===")
        print(f"Total de páginas: {total_pages}")
        
        # Analisar todas as páginas
        for page_num in range(total_pages):
            try:
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                if text:
                    # Buscar códigos de 7 dígitos (padrão IBGE)
                    codes = re.findall(r'\b(\d{7})\b', text)
                    
                    # Filtrar códigos que parecem ser de alimentos (começam com 6, 7, 8)
                    food_codes = [code for code in codes if code.startswith(('6', '7', '8'))]
                    
                    if food_codes:
                        page_food_count[page_num + 1] = len(food_codes)
                        food_codes_found.update(food_codes)
                        
                        # Mostrar progresso a cada 25 páginas
                        if (page_num + 1) % 25 == 0:
                            print(f"Página {page_num + 1}: {len(food_codes_found)} códigos únicos encontrados até agora")
                
            except Exception as e:
                print(f"Erro na página {page_num + 1}: {str(e)}")
                continue
    
    print(f"\n=== RESULTADOS ===")
    print(f"Total de códigos únicos encontrados: {len(food_codes_found)}")
    print(f"Esperado conforme documentação: 1971")
    print(f"Atualmente no sistema: 1085")
    print(f"Faltando no sistema: {1971 - 1085} = 886")
    print(f"Códigos encontrados no PDF: {len(food_codes_found)}")
    
    # Mostrar distribuição por páginas
    print(f"\nDistribuição de alimentos por páginas:")
    pages_with_foods = sorted(page_food_count.items())
    
    for page, count in pages_with_foods[:20]:  # Primeiras 20 páginas
        print(f"  Página {page}: {count} códigos")
    
    if len(pages_with_foods) > 20:
        print(f"  ... (mais {len(pages_with_foods) - 20} páginas)")
        
        # Mostrar últimas páginas também
        print("  Últimas páginas:")
        for page, count in pages_with_foods[-10:]:
            print(f"  Página {page}: {count} códigos")
    
    # Identificar faixas de páginas com mais alimentos
    print(f"\nFaixas de páginas com mais alimentos:")
    max_pages = sorted(page_food_count.items(), key=lambda x: x[1], reverse=True)[:15]
    for page, count in max_pages:
        print(f"  Página {page}: {count} códigos")
    
    return food_codes_found, page_food_count

def find_table_ranges(page_food_count):
    """Identifica ranges de páginas que devem ser processados"""
    print(f"\n=== IDENTIFICANDO RANGES DE TABELAS ===")
    
    # Agrupar páginas consecutivas com alimentos
    ranges = []
    current_start = None
    current_end = None
    
    sorted_pages = sorted(page_food_count.keys())
    
    for page in sorted_pages:
        if current_start is None:
            current_start = page
            current_end = page
        elif page == current_end + 1:  # Página consecutiva
            current_end = page
        else:
            # Quebra na sequência - salvar range anterior
            if current_end - current_start >= 5:  # Ranges de pelo menos 5 páginas
                ranges.append((current_start, current_end))
            current_start = page
            current_end = page
    
    # Adicionar último range
    if current_start is not None and current_end - current_start >= 5:
        ranges.append((current_start, current_end))
    
    print("Ranges de páginas identificados:")
    total_foods_in_ranges = 0
    for start, end in ranges:
        foods_in_range = sum(page_food_count.get(p, 0) for p in range(start, end + 1))
        total_foods_in_ranges += foods_in_range
        print(f"  Páginas {start}-{end}: ~{foods_in_range} códigos")
    
    print(f"\nTotal de alimentos em todos os ranges: {total_foods_in_ranges}")
    
    return ranges

def analyze_missing_patterns():
    """Analisa padrões específicos que podem estar sendo perdidos"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    print(f"\n=== ANÁLISE DE PADRÕES PERDIDOS ===")
    
    # Testar diferentes padrões regex
    patterns_to_test = [
        r'(\d{7})\s+([^0-9\n]+?)\s+(\d{1,2})\s+([^0-9\n]+?)\s+([\d,.-]+)',  # Padrão atual
        r'(\d{7})\s+([^0-9\n]{5,})',  # Padrão mais simples
        r'(\d{7})[^\n]*?(\d+[\.,]\d+)',  # Códigos seguidos de números
        r'^(\d{7})',  # Qualquer código de 7 dígitos no início da linha
    ]
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        # Testar em algumas páginas específicas
        test_pages = [50, 100, 150, 200, 250, 300]
        
        for page_num in test_pages:
            if page_num < len(pdf_reader.pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                print(f"\nTeste na página {page_num + 1}:")
                
                for i, pattern in enumerate(patterns_to_test):
                    matches = re.findall(pattern, text, re.MULTILINE)
                    print(f"  Padrão {i+1}: {len(matches)} matches")
                    
                    if matches and i == 0:  # Mostrar exemplos do padrão principal
                        print(f"    Exemplo: {str(matches[0])[:100]}...")

if __name__ == "__main__":
    food_codes, page_counts = analyze_full_pdf()
    ranges = find_table_ranges(page_counts)
    analyze_missing_patterns()
    
    # Salvar resultados para uso posterior
    results = {
        "total_codes_found": len(food_codes),
        "page_ranges": ranges,
        "codes_sample": list(food_codes)[:50]  # Amostra dos códigos
    }
    
    with open("missing_foods_analysis.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nAnálise salva em: missing_foods_analysis.json")