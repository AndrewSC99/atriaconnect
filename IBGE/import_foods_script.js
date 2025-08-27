/**
 * Script para importar alimentos do IBGE para o banco de dados do sistema nutricional
 * Compatible com Node.js e sistemas modernos
 */

const fs = require('fs');
const path = require('path');

class IBGEFoodsImporter {
    constructor() {
        this.foodsData = null;
        this.logFile = 'import_log.txt';
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async loadFoodsData() {
        try {
            const jsonPath = path.join(__dirname, 'alimentos_ibge.json');
            const rawData = fs.readFileSync(jsonPath, 'utf8');
            this.foodsData = JSON.parse(rawData);
            this.log(`Carregados dados de ${this.foodsData.foods.length} alimentos do arquivo JSON`);
            return true;
        } catch (error) {
            this.log(`Erro ao carregar dados: ${error.message}`);
            return false;
        }
    }

    generateSQLInserts() {
        if (!this.foodsData) {
            this.log('Dados não carregados. Execute loadFoodsData() primeiro.');
            return false;
        }

        const sqlStatements = [];
        
        // Inserir grupos de alimentos
        sqlStatements.push('-- Inserção dos grupos de alimentos');
        this.foodsData.food_groups.forEach(group => {
            const sql = `INSERT OR IGNORE INTO food_groups (id, name, description) VALUES (${group.id}, '${group.name.replace(/'/g, "''")}', '${group.description.replace(/'/g, "''")}');`;
            sqlStatements.push(sql);
        });

        sqlStatements.push('\n-- Inserção dos alimentos');
        
        // Inserir alimentos
        this.foodsData.foods.forEach(food => {
            const groupId = this.getGroupIdByName(food.group);
            const sql = `INSERT OR REPLACE INTO foods (code, name, group_id, energy_kcal, protein_g, lipids_g, carbohydrates_g, dietary_fiber_g) VALUES (${food.code}, '${food.name.replace(/'/g, "''")}', ${groupId}, ${food.macronutrients.energy_kcal}, ${food.macronutrients.protein_g}, ${food.macronutrients.lipids_g}, ${food.macronutrients.carbohydrates_g}, ${food.macronutrients.dietary_fiber_g});`;
            sqlStatements.push(sql);
        });

        // Salvar arquivo SQL
        const sqlContent = sqlStatements.join('\n');
        fs.writeFileSync('import_foods_data.sql', sqlContent);
        this.log(`Script SQL gerado: import_foods_data.sql`);
        
        return true;
    }

    getGroupIdByName(groupName) {
        const group = this.foodsData.food_groups.find(g => g.name === groupName);
        return group ? group.id : 1; // Default para grupo 1 se não encontrar
    }

    generateCreateTableScript() {
        const createScript = `
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
`;

        fs.writeFileSync('create_tables.sql', createScript);
        this.log('Script de criação de tabelas gerado: create_tables.sql');
    }

    generateNodeJSImporter() {
        const importerScript = `
// Importador para sistemas que usam SQLite com Node.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DatabaseImporter {
    constructor(dbPath = 'nutrition.db') {
        this.dbPath = dbPath;
    }

    async importFoods() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            // Lê e executa o script SQL
            const sqlScript = fs.readFileSync('import_foods_data.sql', 'utf8');
            
            db.exec(sqlScript, (err) => {
                if (err) {
                    console.error('Erro ao importar dados:', err);
                    reject(err);
                } else {
                    console.log('Dados importados com sucesso!');
                    resolve(true);
                }
                db.close();
            });
        });
    }
}

// Uso:
const importer = new DatabaseImporter();
importer.importFoods().then(() => {
    console.log('Importação concluída!');
}).catch(console.error);
`;

        fs.writeFileSync('node_importer.js', importerScript);
        this.log('Script Node.js gerado: node_importer.js');
    }

    generateReport() {
        if (!this.foodsData) return;

        const report = `
=== RELATÓRIO DE IMPORTAÇÃO IBGE ===
Data: ${new Date().toLocaleString('pt-BR')}

RESUMO DOS DADOS:
- Total de alimentos: ${this.foodsData.foods.length}
- Total de grupos: ${this.foodsData.food_groups.length}
- Fonte: ${this.foodsData.metadata.source}

DISTRIBUIÇÃO POR GRUPOS:
${this.foodsData.food_groups.map(group => {
    const count = this.foodsData.foods.filter(f => f.group === group.name).length;
    return `- ${group.name}: ${count} alimentos`;
}).join('\n')}

EXEMPLOS DE ALIMENTOS:
${this.foodsData.foods.slice(0, 10).map(f => 
    `- ${f.name} (${f.macronutrients.energy_kcal} kcal)`
).join('\n')}

ARQUIVOS GERADOS:
- alimentos_ibge.json: Dados originais em JSON
- create_tables.sql: Script para criação das tabelas
- import_foods_data.sql: Script para inserção dos dados
- node_importer.js: Importador para Node.js/SQLite
- import_log.txt: Log da execução

NOTA: Esta é uma amostra representativa da tabela IBGE completa 
que contém aproximadamente 1.971 alimentos.
        `;

        fs.writeFileSync('import_report.txt', report);
        this.log('Relatório gerado: import_report.txt');
    }

    async run() {
        this.log('=== IMPORTADOR IBGE INICIADO ===');
        
        // Limpa log anterior
        if (fs.existsSync(this.logFile)) {
            fs.unlinkSync(this.logFile);
        }

        try {
            // Carrega dados
            const loaded = await this.loadFoodsData();
            if (!loaded) {
                throw new Error('Falha ao carregar dados');
            }

            // Gera scripts
            this.generateCreateTableScript();
            this.generateSQLInserts();
            this.generateNodeJSImporter();
            this.generateReport();

            this.log('=== IMPORTAÇÃO CONCLUÍDA COM SUCESSO ===');
            
            console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!');
            console.log('\nArquivos gerados:');
            console.log('📄 alimentos_ibge.json - Dados em JSON');
            console.log('🗃️  create_tables.sql - Script de criação das tabelas');
            console.log('📝 import_foods_data.sql - Script de inserção dos dados');
            console.log('⚙️  node_importer.js - Importador para Node.js');
            console.log('📊 import_report.txt - Relatório detalhado');
            
            console.log('\n📈 ESTATÍSTICAS:');
            console.log(`Total de alimentos: ${this.foodsData.foods.length}`);
            console.log(`Total de grupos: ${this.foodsData.food_groups.length}`);

            return true;

        } catch (error) {
            this.log(`ERRO: ${error.message}`);
            console.error('❌ Erro durante a importação:', error.message);
            return false;
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const importer = new IBGEFoodsImporter();
    importer.run();
}

module.exports = IBGEFoodsImporter;