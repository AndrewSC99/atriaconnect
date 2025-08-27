-- Inserção dos grupos de alimentos
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (1, 'Açúcares e Produtos de Confeitaria', 'Açúcar, mel, doces e produtos açucarados');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (2, 'Cereais e Produtos de Cereais', 'Arroz, trigo, aveia, milho e derivados');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (3, 'Leguminosas', 'Feijões, lentilhas, grão de bico e outras leguminosas');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (4, 'Carnes e Produtos Cárneos', 'Carnes bovinas, suínas, aves e produtos');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (5, 'Peixes e Frutos do Mar', 'Peixes, crustáceos e moluscos');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (6, 'Leite e Produtos Lácteos', 'Leite, queijos, iogurtes e derivados');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (7, 'Ovos', 'Ovos de galinha e outras aves');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (8, 'Frutas e Produtos de Frutas', 'Frutas frescas, secas e sucos naturais');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (9, 'Hortaliças', 'Verduras, legumes e tubérculos');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (10, 'Óleos e Gorduras', 'Óleos vegetais, gorduras e margarinas');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (11, 'Oleaginosas', 'Castanhas, nozes, amendoim e sementes');
INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (12, 'Bebidas', 'Bebidas não alcoólicas');

-- Inserção dos alimentos
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (10001, 'Açúcar cristal', 1, 387, 0, 0, 99.9, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (10002, 'Açúcar mascavo', 1, 369, 0.1, 0.1, 95, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (20001, 'Arroz branco cozido', 2, 128, 2.5, 0.2, 28.1, 1.6);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (20002, 'Arroz integral cozido', 2, 124, 2.6, 1, 25.8, 2.7);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (20003, 'Aveia em flocos crua', 2, 394, 13.9, 8.5, 66.6, 9.1);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (30001, 'Feijão preto cozido', 3, 77, 4.5, 0.5, 14, 8.4);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (30002, 'Feijão carioca cozido', 3, 76, 4.8, 0.5, 13.6, 8.5);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (40001, 'Carne bovina - acém moído cru', 4, 186, 20, 11.8, 0, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (40003, 'Frango - peito sem pele cozido', 4, 159, 32, 3, 0, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (41001, 'Tilápia crua', 5, 96, 20.1, 1.7, 0, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (50001, 'Leite integral', 6, 61, 2.9, 3.2, 4.3, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (50002, 'Queijo muçarela', 6, 280, 17.8, 22.4, 3.4, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (51001, 'Ovo de galinha cru', 7, 143, 13, 8.9, 1.6, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (60001, 'Banana prata', 8, 92, 1.3, 0.1, 22, 2);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (60002, 'Maçã com casca', 8, 56, 0.3, 0.4, 13.3, 2);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (60003, 'Laranja pêra', 8, 45, 1, 0.2, 10.5, 4);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (70001, 'Alface crespa crua', 9, 11, 1.6, 0.3, 1.7, 1.7);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (70002, 'Tomate cru', 9, 18, 1.2, 0.2, 3.5, 1.2);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (70004, 'Batata inglesa cozida', 9, 52, 1.4, 0.1, 11.9, 1.3);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (80001, 'Azeite de oliva', 10, 884, 0, 100, 0, 0);
INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (90001, 'Castanha do Pará', 11, 643, 14.5, 63.5, 12.8, 7.9);