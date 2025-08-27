
-- Script de criação das tabelas para alimentos IBGE
CREATE TABLE IF NOT EXISTS food_groups (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES food_groups (id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_foods_code ON foods (code);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods (name);
CREATE INDEX IF NOT EXISTS idx_foods_group ON foods (group_id);

-- Views úteis
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
