# Importação de Dados Nutricionais IBGE

## Resumo da Análise

Baseado na análise do repositório **taco-ibge-extractor** e das pesquisas realizadas, este projeto fornece uma base de dados com alimentos da **Tabela de Composição Nutricional dos Alimentos Consumidos no Brasil** do IBGE (POF 2008-2009).

## Sobre a Tabela IBGE

- **Fonte**: IBGE - Pesquisa de Orçamentos Familiares (POF) 2008-2009
- **Total estimado**: Aproximadamente **1.971 alimentos**
- **Dados incluídos**: Composição nutricional para cada 100g de porção comestível
- **Componentes**: Energia, macronutrientes, fibras, gorduras, açúcares, minerais e vitaminas

## Arquivos Gerados

### 📄 Dados
- `alimentos_ibge.json` - Base de dados em formato JSON com 21 alimentos representativos
- `create_foods_database.sql` - Script SQL completo com mais de 50 alimentos
- `import_foods_data.sql` - Script de inserção gerado automaticamente

### ⚙️ Scripts
- `import_foods_script.js` - Gerador automático de scripts de importação
- `node_importer.js` - Importador para sistemas Node.js + SQLite
- `ibge_extractor.py` - Extrator Python para processar PDF original (requer PyPDF2)

### 📊 Relatórios
- `import_report.txt` - Relatório detalhado da importação
- `import_log.txt` - Log de execução dos scripts

## Estrutura do Banco de Dados

### Tabela: `food_groups`
```sql
CREATE TABLE food_groups (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `foods`
```sql
CREATE TABLE foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    group_id INTEGER,
    energy_kcal REAL,
    protein_g REAL,
    lipids_g REAL,
    carbohydrates_g REAL,
    dietary_fiber_g REAL,
    -- Minerais e vitaminas (campos adicionais disponíveis)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES food_groups (id)
);
```

## Grupos de Alimentos Incluídos

1. **Açúcares e Produtos de Confeitaria** (2 alimentos)
2. **Cereais e Produtos de Cereais** (8+ alimentos)
3. **Leguminosas** (5+ alimentos)
4. **Carnes e Produtos Cárneos** (6+ alimentos)
5. **Peixes e Frutos do Mar** (4+ alimentos)
6. **Leite e Produtos Lácteos** (6+ alimentos)
7. **Ovos** (2+ alimentos)
8. **Frutas e Produtos de Frutas** (8+ alimentos)
9. **Hortaliças** (8+ alimentos)
10. **Óleos e Gorduras** (4+ alimentos)
11. **Oleaginosas** (4+ alimentos)
12. **Bebidas** (3+ alimentos)

## Como Usar

### Opção 1: Script SQL Direto
```bash
# Para SQLite
sqlite3 nutrition.db < create_foods_database.sql

# Para MySQL/MariaDB
mysql -u username -p database_name < create_foods_database.sql

# Para PostgreSQL
psql -U username -d database_name -f create_foods_database.sql
```

### Opção 2: Node.js + SQLite
```bash
npm install sqlite3
node node_importer.js
```

### Opção 3: Importação Manual via JSON
```javascript
const fs = require('fs');
const foodsData = JSON.parse(fs.readFileSync('alimentos_ibge.json', 'utf8'));

// Use foodsData.foods para acessar os alimentos
// Use foodsData.food_groups para acessar os grupos
```

## Exemplos de Alimentos Incluídos

- Açúcar cristal (387 kcal)
- Arroz branco cozido (128 kcal)
- Feijão preto cozido (77 kcal)
- Frango peito sem pele (159 kcal)
- Banana prata (92 kcal)
- Tomate cru (18 kcal)
- Azeite de oliva (884 kcal)

## Diferenças: TACO vs IBGE

| Tabela | Alimentos | Instituição | Foco |
|--------|-----------|-------------|------|
| TACO 4ª Ed. | ~597 | UNICAMP/NEPA | Alimentos mais consumidos |
| IBGE POF | ~1.971 | IBGE | Alimentos consumidos no Brasil |

## Validação dos Dados

O repositório original **taco-ibge-extractor** foi analisado e considerado seguro:
- ✅ Projeto open-source no GitHub
- ✅ Fonte oficial: IBGE
- ✅ Código limpo em Java/Quarkus
- ✅ Sem conteúdo malicioso

## Próximos Passos

1. **Expandir Base**: Processar PDF completo para obter todos os 1.971 alimentos
2. **Micronutrientes**: Adicionar vitaminas e minerais detalhados
3. **Integração**: Conectar com seu sistema nutricional
4. **Atualizações**: Monitorar novas versões da tabela IBGE

## Suporte

Para dúvidas ou problemas:
1. Verificar logs em `import_log.txt`
2. Consultar relatório em `import_report.txt`
3. Testar scripts em ambiente de desenvolvimento primeiro

---

**Nota**: Esta é uma amostra representativa da tabela IBGE completa. Para obter todos os 1.971 alimentos, seria necessário processar o PDF completo usando ferramentas mais robustas de OCR e parsing.