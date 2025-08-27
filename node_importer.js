
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
