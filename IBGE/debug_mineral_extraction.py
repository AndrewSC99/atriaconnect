#!/usr/bin/env python3
"""
Debug específico para extração de minerais
Foca no peito bovino para entender o problema
"""

import PyPDF2
import re

def debug_peito_bovino():
    """Debug específico do peito bovino"""
    pdf_path = r"C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\taco-ibge-extractor\src\main\resources\META-INF\resources\taco\liv50002.pdf"
    
    print("=== DEBUG PEITO BOVINO - MINERAIS ===")
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        # Buscar nas páginas de minerais (158-218)
        peito_bovino_found = False
        for page_num in range(157, 218):  # 0-indexed
            try:
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                if "Peito bovino" in text or "7101101" in text:
                    print(f"\nENCONTRADO NA PAGINA {page_num + 1}")
                    print("─" * 80)
                    
                    # Extrair linhas com peito bovino
                    lines = text.split('\n')
                    for line_num, line in enumerate(lines):
                        if "Peito bovino" in line or "7101101" in line:
                            print(f"Linha {line_num}: {line}")
                            peito_bovino_found = True
                            
                            # Tentar extrair valores usando o padrão atual
                            pattern = r'^(\d{7})\s+([^0-9\n]+?)\s+(\d{1,2})\s+([^0-9\n]+?)\s+(.*)'
                            match = re.match(pattern, line)
                            
                            if match:
                                code = match.group(1)
                                name = match.group(2)
                                prep_code = match.group(3)
                                preparation = match.group(4)
                                values_str = match.group(5)
                                
                                print(f"  PARSED:")
                                print(f"    Codigo: {code}")
                                print(f"    Nome: {name}")
                                print(f"    Prep: {prep_code} - {preparation}")
                                print(f"    Values: {values_str}")
                                
                                # Extrair valores
                                raw_values = re.findall(r'[\d,.-]+', values_str)
                                print(f"    Valores brutos: {raw_values}")
                                
                                if len(raw_values) >= 8:
                                    print(f"    MINERAIS:")
                                    print(f"      Calcio: {raw_values[0]}")
                                    print(f"      Magnesio: {raw_values[1]}")
                                    print(f"      Manganes: {raw_values[2]}")
                                    print(f"      Fosforo: {raw_values[3]}")
                                    print(f"      Ferro: {raw_values[4]}")
                                    print(f"      Sodio: {raw_values[5]}")
                                    print(f"      Potassio: {raw_values[6] if len(raw_values) > 6 else 'N/A'}")
                                else:
                                    print(f"    POUCOS VALORES: {len(raw_values)} (esperado >= 8)")
                            else:
                                print(f"  NAO MATCHED pelo regex")
                                print(f"  Raw line: '{line}'")
                    
                    print("─" * 80)
            
            except Exception as e:
                print(f"Erro na página {page_num + 1}: {str(e)}")
                continue
        
        if not peito_bovino_found:
            print("PEITO BOVINO NAO ENCONTRADO nas paginas de minerais!")
        
        # Verificar se o problema é no range de páginas
        print(f"\nVERIFICANDO TODOS OS RANGES...")
        ranges = [
            {'name': 'Macronutrientes', 'start': 36, 'end': 96},
            {'name': 'Gorduras', 'start': 97, 'end': 157},
            {'name': 'Minerais', 'start': 158, 'end': 218},
            {'name': 'Vitaminas', 'start': 219, 'end': 280},
        ]
        
        for range_info in ranges:
            found_in_range = False
            for page_num in range(range_info['start'] - 1, min(range_info['end'], len(pdf_reader.pages))):
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    if "Peito bovino" in text or "7101101" in text:
                        found_in_range = True
                        print(f"  {range_info['name']}: Pagina {page_num + 1}")
                        break
                except:
                    continue
            
            if not found_in_range:
                print(f"  {range_info['name']}: NAO ENCONTRADO")

if __name__ == "__main__":
    debug_peito_bovino()