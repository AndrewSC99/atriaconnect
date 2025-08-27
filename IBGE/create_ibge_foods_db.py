#!/usr/bin/env python3
"""
Criador de base de dados com alimentos do IBGE
Baseado na estrutura da Tabela de Composição Nutricional dos Alimentos Consumidos no Brasil
"""

import json
import sqlite3
from datetime import datetime

# Dados de exemplo baseados na tabela IBGE POF 2008-2009
# Esta é uma amostra dos principais alimentos brasileiros
IBGE_FOODS_SAMPLE = [
    {"code": 10001, "name": "Açúcar cristal", "group": "Açúcares", "energy": 387, "protein": 0.0, "lipids": 0.0, "carbs": 99.9, "fiber": 0.0},
    {"code": 10002, "name": "Açúcar mascavo", "group": "Açúcares", "energy": 369, "protein": 0.1, "lipids": 0.1, "carbs": 95.0, "fiber": 0.0},
    {"code": 20001, "name": "Arroz branco cozido", "group": "Cereais", "energy": 128, "protein": 2.5, "lipids": 0.2, "carbs": 28.1, "fiber": 1.6},
    {"code": 20002, "name": "Arroz integral cozido", "group": "Cereais", "energy": 124, "protein": 2.6, "lipids": 1.0, "carbs": 25.8, "fiber": 2.7},
    {"code": 20003, "name": "Aveia em flocos crua", "group": "Cereais", "energy": 394, "protein": 13.9, "lipids": 8.5, "carbs": 66.6, "fiber": 9.1},
    {"code": 20004, "name": "Farinha de trigo", "group": "Cereais", "energy": 360, "protein": 10.3, "lipids": 1.4, "carbs": 75.1, "fiber": 2.3},
    {"code": 20005, "name": "Macarrão cozido", "group": "Cereais", "energy": 111, "protein": 3.7, "lipids": 0.6, "carbs": 22.0, "fiber": 1.3},
    {"code": 20006, "name": "Pão francês", "group": "Cereais", "energy": 300, "protein": 8.9, "lipids": 3.1, "carbs": 58.6, "fiber": 6.7},
    {"code": 30001, "name": "Feijão preto cozido", "group": "Leguminosas", "energy": 77, "protein": 4.5, "lipids": 0.5, "carbs": 14.0, "fiber": 8.4},
    {"code": 30002, "name": "Feijão carioca cozido", "group": "Leguminosas", "energy": 76, "protein": 4.8, "lipids": 0.5, "carbs": 13.6, "fiber": 8.5},
    {"code": 30003, "name": "Lentilha cozida", "group": "Leguminosas", "energy": 93, "protein": 6.3, "lipids": 0.5, "carbs": 16.3, "fiber": 7.9},
    {"code": 30004, "name": "Grão de bico cozido", "group": "Leguminosas", "energy": 121, "protein": 8.4, "lipids": 1.4, "carbs": 18.8, "fiber": 12.4},
    {"code": 40001, "name": "Carne bovina - acém moído cru", "group": "Carnes", "energy": 186, "protein": 20.0, "lipids": 11.8, "carbs": 0.0, "fiber": 0.0},
    {"code": 40002, "name": "Carne bovina - costela assada", "group": "Carnes", "energy": 250, "protein": 26.1, "lipids": 15.8, "carbs": 0.0, "fiber": 0.0},
    {"code": 40003, "name": "Frango - peito sem pele cozido", "group": "Carnes", "energy": 159, "protein": 32.0, "lipids": 3.0, "carbs": 0.0, "fiber": 0.0},
    {"code": 40004, "name": "Peixe - tilápia crua", "group": "Carnes", "energy": 96, "protein": 20.1, "lipids": 1.7, "carbs": 0.0, "fiber": 0.0},
    {"code": 50001, "name": "Leite integral", "group": "Laticínios", "energy": 61, "protein": 2.9, "lipids": 3.2, "carbs": 4.3, "fiber": 0.0},
    {"code": 50002, "name": "Queijo muçarela", "group": "Laticínios", "energy": 280, "protein": 17.8, "lipids": 22.4, "carbs": 3.4, "fiber": 0.0},
    {"code": 50003, "name": "Iogurte natural", "group": "Laticínios", "energy": 56, "protein": 3.8, "lipids": 1.6, "carbs": 6.7, "fiber": 0.0},
    {"code": 60001, "name": "Banana prata", "group": "Frutas", "energy": 92, "protein": 1.3, "lipids": 0.1, "carbs": 22.0, "fiber": 2.0},
    {"code": 60002, "name": "Maçã com casca", "group": "Frutas", "energy": 56, "protein": 0.3, "lipids": 0.4, "carbs": 13.3, "fiber": 2.0},
    {"code": 60003, "name": "Laranja pêra", "group": "Frutas", "energy": 45, "protein": 1.0, "lipids": 0.2, "carbs": 10.5, "fiber": 4.0},
    {"code": 60004, "name": "Manga palmer", "group": "Frutas", "energy": 64, "protein": 0.4, "lipids": 0.2, "carbs": 15.6, "fiber": 1.7},
    {"code": 70001, "name": "Alface crespa crua", "group": "Hortaliças", "energy": 11, "protein": 1.6, "lipids": 0.3, "carbs": 1.7, "fiber": 1.7},
    {"code": 70002, "name": "Tomate cru", "group": "Hortaliças", "energy": 18, "protein": 1.2, "lipids": 0.2, "carbs": 3.5, "fiber": 1.2},
    {"code": 70003, "name": "Cenoura crua", "group": "Hortaliças", "energy": 34, "protein": 1.3, "lipids": 0.2, "carbs": 7.7, "fiber": 3.2},
    {"code": 70004, "name": "Batata inglesa cozida", "group": "Hortaliças", "energy": 52, "protein": 1.4, "lipids": 0.1, "carbs": 11.9, "fiber": 1.3},
    {"code": 80001, "name": "Azeite de oliva", "group": "Óleos e Gorduras", "energy": 884, "protein": 0.0, "lipids": 100.0, "carbs": 0.0, "fiber": 0.0},
    {"code": 80002, "name": "Manteiga com sal", "group": "Óleos e Gorduras", "energy": 760, "protein": 0.9, "lipids": 84.0, "carbs": 0.6, "fiber": 0.0},
    {"code": 90001, "name": "Castanha do Pará", "group": "Oleaginosas", "energy": 643, "protein": 14.5, "lipids": 63.5, "carbs": 12.8, "fiber": 7.9},
    {"code": 90002, "name": "Amendoim torrado", "group": "Oleaginosas", "energy": 606, "protein": 27.2, "lipids": 50.2, "carbs": 11.7, "fiber": 8.0},
]

class IBGEFoodsDatabase:
    def __init__(self, db_path: str = "alimentos_ibge.db"):
        self.db_path = db_path
        
    def create_database(self):
        """Cria o banco de dados e as tabelas necessárias"""
        print("Criando banco de dados SQLite...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabela de grupos de alimentos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        )
        ''')
        
        # Tabela de alimentos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code INTEGER UNIQUE NOT NULL,
            name TEXT NOT NULL,
            group_id INTEGER,
            energy_kcal REAL,
            protein_g REAL,
            lipids_g REAL,
            carbohydrates_g REAL,
            dietary_fiber_g REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES food_groups (id)
        )
        ''')
        
        # Índices para melhor performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_foods_code ON foods (code)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_foods_name ON foods (name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_foods_group ON foods (group_id)')
        
        conn.commit()
        conn.close()
        print("Banco de dados criado com sucesso!")
        
    def insert_food_groups(self):
        """Insere os grupos de alimentos"""
        print("Inserindo grupos de alimentos...")
        
        groups = [
            ("Açúcares", "Açúcar e produtos açucarados"),
            ("Cereais", "Cereais e produtos derivados"),
            ("Leguminosas", "Feijões e outras leguminosas"),
            ("Carnes", "Carnes, aves, peixes e ovos"),
            ("Laticínios", "Leite e produtos lácteos"),
            ("Frutas", "Frutas e sucos naturais"),
            ("Hortaliças", "Verduras e legumes"),
            ("Óleos e Gorduras", "Óleos, gorduras e oleaginosas"),
            ("Oleaginosas", "Castanhas, nozes e sementes"),
            ("Bebidas", "Bebidas não alcoólicas"),
        ]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.executemany('''
        INSERT OR IGNORE INTO food_groups (name, description) VALUES (?, ?)
        ''', groups)
        
        conn.commit()
        conn.close()
        print(f"Inseridos {len(groups)} grupos de alimentos!")
        
    def insert_foods(self):
        """Insere os alimentos na base de dados"""
        print("Inserindo alimentos...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Primeiro, busca os IDs dos grupos
        group_ids = {}
        cursor.execute("SELECT id, name FROM food_groups")
        for group_id, group_name in cursor.fetchall():
            group_ids[group_name] = group_id
        
        # Prepara os dados para inserção
        foods_data = []
        for food in IBGE_FOODS_SAMPLE:
            group_id = group_ids.get(food["group"])
            foods_data.append((
                food["code"],
                food["name"],
                group_id,
                food["energy"],
                food["protein"],
                food["lipids"],
                food["carbs"],
                food["fiber"]
            ))
        
        # Insere os alimentos
        cursor.executemany('''
        INSERT OR REPLACE INTO foods 
        (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', foods_data)
        
        conn.commit()
        conn.close()
        print(f"Inseridos {len(foods_data)} alimentos na base de dados!")
        
    def export_to_json(self, output_file: str = "alimentos_ibge_completo.json"):
        """Exporta toda a base de dados para JSON"""
        print("Exportando dados para JSON...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Busca todos os alimentos com seus grupos
        cursor.execute('''
        SELECT 
            f.code,
            f.name,
            g.name as group_name,
            f.energy_kcal,
            f.protein_g,
            f.lipids_g,
            f.carbohydrates_g,
            f.dietary_fiber_g
        FROM foods f
        LEFT JOIN food_groups g ON f.group_id = g.id
        ORDER BY f.code
        ''')
        
        foods = []
        for row in cursor.fetchall():
            foods.append({
                "code": row[0],
                "name": row[1],
                "group": row[2],
                "macronutrients": {
                    "energy_kcal": row[3],
                    "protein_g": row[4],
                    "lipids_g": row[5],
                    "carbohydrates_g": row[6],
                    "dietary_fiber_g": row[7]
                }
            })
        
        # Dados de metadados
        output_data = {
            "metadata": {
                "source": "IBGE - Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil",
                "description": "Amostra representativa dos principais alimentos brasileiros",
                "total_foods": len(foods),
                "created_at": datetime.now().isoformat(),
                "note": "Esta é uma amostra dos principais alimentos da tabela IBGE. A tabela completa contém aproximadamente 1.971 alimentos."
            },
            "foods": foods
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        conn.close()
        print(f"Dados exportados para {output_file}")
        return foods
        
    def get_statistics(self):
        """Retorna estatísticas da base de dados"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total de alimentos
        cursor.execute("SELECT COUNT(*) FROM foods")
        total_foods = cursor.fetchone()[0]
        
        # Alimentos por grupo
        cursor.execute('''
        SELECT g.name, COUNT(f.id) as count
        FROM food_groups g
        LEFT JOIN foods f ON g.id = f.group_id
        GROUP BY g.id, g.name
        ORDER BY count DESC
        ''')
        groups_stats = cursor.fetchall()
        
        conn.close()
        
        return {
            "total_foods": total_foods,
            "groups": groups_stats
        }
        
    def setup_complete_database(self):
        """Executa o setup completo da base de dados"""
        print("=== Setup Base de Dados IBGE ===")
        
        self.create_database()
        self.insert_food_groups()
        self.insert_foods()
        
        # Exporta para JSON
        foods = self.export_to_json()
        
        # Mostra estatísticas
        stats = self.get_statistics()
        
        print(f"\n=== RESULTADOS ===")
        print(f"Total de alimentos: {stats['total_foods']}")
        print(f"Arquivo SQLite: {self.db_path}")
        print(f"Arquivo JSON: alimentos_ibge_completo.json")
        
        print(f"\nDistribuição por grupos:")
        for group_name, count in stats['groups']:
            if count > 0:
                print(f"  {group_name}: {count} alimentos")
        
        print(f"\nPrimeiros 5 alimentos:")
        for i, food in enumerate(foods[:5]):
            print(f"  {i+1}. {food['name']} ({food['group']})")
            
        print(f"\nNOTA: Esta é uma amostra representativa dos principais alimentos.")
        print(f"A tabela IBGE completa contém aproximadamente 1.971 alimentos.")
        
        return True

if __name__ == "__main__":
    db = IBGEFoodsDatabase()
    db.setup_complete_database()