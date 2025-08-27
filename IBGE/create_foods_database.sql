-- Criação da Base de Dados de Alimentos IBGE
-- Baseada na Tabela de Composição Nutricional dos Alimentos Consumidos no Brasil

-- Tabela de grupos de alimentos
CREATE TABLE IF NOT EXISTS food_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alimentos
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
    calcium_mg REAL,
    magnesium_mg REAL,
    phosphorus_mg REAL,
    iron_mg REAL,
    sodium_mg REAL,
    potassium_mg REAL,
    zinc_mg REAL,
    vitamin_c_mg REAL,
    thiamine_mg REAL,
    riboflavin_mg REAL,
    niacin_mg REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES food_groups (id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_foods_code ON foods (code);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods (name);
CREATE INDEX IF NOT EXISTS idx_foods_group ON foods (group_id);

-- Inserção dos grupos de alimentos
INSERT OR IGNORE INTO food_groups (name, description) VALUES 
('Açúcares e Produtos de Confeitaria', 'Açúcar, mel, doces e produtos açucarados'),
('Cereais e Produtos de Cereais', 'Arroz, trigo, aveia, milho e derivados'),
('Leguminosas', 'Feijões, lentilhas, grão de bico e outras leguminosas'),
('Carnes e Produtos Cárneos', 'Carnes bovinas, suínas, aves e produtos'),
('Peixes e Frutos do Mar', 'Peixes, crustáceos e moluscos'),
('Leite e Produtos Lácteos', 'Leite, queijos, iogurtes e derivados'),
('Ovos', 'Ovos de galinha e outras aves'),
('Frutas e Produtos de Frutas', 'Frutas frescas, secas e sucos naturais'),
('Hortaliças', 'Verduras, legumes e tubérculos'),
('Óleos e Gorduras', 'Óleos vegetais, gorduras e margarinas'),
('Oleaginosas', 'Castanhas, nozes, amendoim e sementes'),
('Bebidas', 'Bebidas não alcoólicas'),
('Produtos Industrializados', 'Alimentos processados e ultraprocessados'),
('Temperos e Condimentos', 'Sal, especiarias e temperos'),
('Preparações', 'Pratos prontos e preparações culinárias');

-- Inserção de alimentos representativos da tabela IBGE
-- Grupo: Açúcares e Produtos de Confeitaria
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(10001, 'Açúcar cristal', 1, 387, 0.0, 0.0, 99.9, 0.0),
(10002, 'Açúcar mascavo', 1, 369, 0.1, 0.1, 95.0, 0.0),
(10003, 'Mel de abelha', 1, 309, 0.4, 0.0, 84.0, 0.0);

-- Grupo: Cereais e Produtos de Cereais
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(20001, 'Arroz branco cozido', 2, 128, 2.5, 0.2, 28.1, 1.6),
(20002, 'Arroz integral cozido', 2, 124, 2.6, 1.0, 25.8, 2.7),
(20003, 'Aveia em flocos crua', 2, 394, 13.9, 8.5, 66.6, 9.1),
(20004, 'Farinha de trigo', 2, 360, 10.3, 1.4, 75.1, 2.3),
(20005, 'Macarrão cozido', 2, 111, 3.7, 0.6, 22.0, 1.3),
(20006, 'Pão francês', 2, 300, 8.9, 3.1, 58.6, 6.7),
(20007, 'Pão de forma integral', 2, 253, 9.4, 3.5, 43.5, 5.9),
(20008, 'Milho verde cozido', 2, 123, 4.9, 1.1, 25.7, 5.3);

-- Grupo: Leguminosas
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(30001, 'Feijão preto cozido', 3, 77, 4.5, 0.5, 14.0, 8.4),
(30002, 'Feijão carioca cozido', 3, 76, 4.8, 0.5, 13.6, 8.5),
(30003, 'Lentilha cozida', 3, 93, 6.3, 0.5, 16.3, 7.9),
(30004, 'Grão de bico cozido', 3, 121, 8.4, 1.4, 18.8, 12.4),
(30005, 'Ervilha verde cozida', 3, 79, 5.4, 0.2, 14.5, 5.5);

-- Grupo: Carnes e Produtos Cárneos
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(40001, 'Carne bovina - acém moído cru', 4, 186, 20.0, 11.8, 0.0, 0.0),
(40002, 'Carne bovina - costela assada', 4, 250, 26.1, 15.8, 0.0, 0.0),
(40003, 'Carne bovina - contrafilé grelhado', 4, 216, 30.2, 9.8, 0.0, 0.0),
(40004, 'Carne suína - lombo assado', 4, 201, 27.4, 9.2, 0.0, 0.0),
(40005, 'Frango - peito sem pele cozido', 4, 159, 32.0, 3.0, 0.0, 0.0),
(40006, 'Frango - coxa com pele assada', 4, 204, 26.2, 10.2, 0.0, 0.0);

-- Grupo: Peixes e Frutos do Mar
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(41001, 'Tilápia crua', 5, 96, 20.1, 1.7, 0.0, 0.0),
(41002, 'Salmão grelhado', 5, 231, 25.4, 14.0, 0.0, 0.0),
(41003, 'Sardinha em conserva', 5, 208, 21.1, 13.6, 0.0, 0.0),
(41004, 'Camarão cozido', 5, 82, 18.1, 1.2, 0.2, 0.0);

-- Grupo: Leite e Produtos Lácteos
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(50001, 'Leite integral', 6, 61, 2.9, 3.2, 4.3, 0.0),
(50002, 'Leite desnatado', 6, 35, 3.4, 0.2, 4.9, 0.0),
(50003, 'Queijo muçarela', 6, 280, 17.8, 22.4, 3.4, 0.0),
(50004, 'Queijo prato', 6, 360, 25.8, 28.0, 0.0, 0.0),
(50005, 'Iogurte natural', 6, 56, 3.8, 1.6, 6.7, 0.0),
(50006, 'Requeijão cremoso', 6, 264, 11.6, 23.0, 3.0, 0.0);

-- Grupo: Ovos
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(51001, 'Ovo de galinha cru', 7, 143, 13.0, 8.9, 1.6, 0.0),
(51002, 'Ovo de galinha cozido', 7, 146, 13.3, 9.5, 0.7, 0.0);

-- Grupo: Frutas e Produtos de Frutas
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(60001, 'Banana prata', 8, 92, 1.3, 0.1, 22.0, 2.0),
(60002, 'Maçã com casca', 8, 56, 0.3, 0.4, 13.3, 2.0),
(60003, 'Laranja pêra', 8, 45, 1.0, 0.2, 10.5, 4.0),
(60004, 'Manga palmer', 8, 64, 0.4, 0.2, 15.6, 1.7),
(60005, 'Abacaxi', 8, 48, 0.5, 0.1, 12.0, 1.0),
(60006, 'Uva rubi', 8, 62, 0.7, 0.2, 15.5, 0.9),
(60007, 'Mamão formosa', 8, 32, 0.5, 0.1, 8.3, 1.8),
(60008, 'Melancia', 8, 24, 0.6, 0.2, 5.9, 0.3);

-- Grupo: Hortaliças
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(70001, 'Alface crespa crua', 9, 11, 1.6, 0.3, 1.7, 1.7),
(70002, 'Tomate cru', 9, 18, 1.2, 0.2, 3.5, 1.2),
(70003, 'Cenoura crua', 9, 34, 1.3, 0.2, 7.7, 3.2),
(70004, 'Batata inglesa cozida', 9, 52, 1.4, 0.1, 11.9, 1.3),
(70005, 'Cebola crua', 9, 34, 1.4, 0.2, 7.6, 2.2),
(70006, 'Abobrinha italiana refogada', 9, 29, 2.5, 0.2, 5.7, 2.7),
(70007, 'Brócolis cozido', 9, 20, 3.6, 0.4, 2.4, 3.4),
(70008, 'Couve manteiga refogada', 9, 27, 2.9, 0.5, 4.7, 4.2);

-- Grupo: Óleos e Gorduras
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(80001, 'Azeite de oliva', 10, 884, 0.0, 100.0, 0.0, 0.0),
(80002, 'Óleo de soja', 10, 884, 0.0, 100.0, 0.0, 0.0),
(80003, 'Manteiga com sal', 10, 760, 0.9, 84.0, 0.6, 0.0),
(80004, 'Margarina com sal', 10, 596, 0.9, 65.0, 1.4, 0.0);

-- Grupo: Oleaginosas
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(90001, 'Castanha do Pará', 11, 643, 14.5, 63.5, 12.8, 7.9),
(90002, 'Amendoim torrado', 11, 606, 27.2, 50.2, 11.7, 8.0),
(90003, 'Castanha de caju', 11, 570, 18.5, 46.3, 22.5, 3.7),
(90004, 'Nozes', 11, 651, 15.8, 64.0, 13.5, 6.5);

-- Grupo: Bebidas
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES
(91001, 'Água', 12, 0, 0.0, 0.0, 0.0, 0.0),
(91002, 'Café sem açúcar', 12, 2, 0.2, 0.0, 0.3, 0.0),
(91003, 'Suco de laranja natural', 12, 42, 0.7, 0.1, 10.4, 0.4);

-- Views para consultas úteis
CREATE VIEW IF NOT EXISTS v_foods_complete AS
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
LEFT JOIN food_groups g ON f.group_id = g.id;

-- View para estatísticas por grupo
CREATE VIEW IF NOT EXISTS v_group_statistics AS
SELECT 
    g.name as group_name,
    COUNT(f.id) as total_foods,
    ROUND(AVG(f.energy_kcal), 2) as avg_energy,
    ROUND(AVG(f.protein_g), 2) as avg_protein,
    ROUND(AVG(f.lipids_g), 2) as avg_lipids,
    ROUND(AVG(f.carbohydrates_g), 2) as avg_carbs
FROM food_groups g
LEFT JOIN foods f ON g.id = f.group_id
GROUP BY g.id, g.name
ORDER BY total_foods DESC;