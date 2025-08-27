#!/usr/bin/env node
/**
 * Script para importar TODOS os 3.727 alimentos IBGE extraídos do PDF
 * Atualiza o arquivo ibge-pof.json do sistema com dados completos
 */

const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const IBGE_COMPLETE_PATH = path.resolve(__dirname, 'ibge_complete_1971.json');
const SYSTEM_IBGE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');

console.log('='.repeat(60));
console.log('IMPORTAÇÃO COMPLETA IBGE - 3.727 ALIMENTOS');
console.log('='.repeat(60));

/**
 * Carrega dados do arquivo JSON completo
 */
function loadCompleteIBGEData() {
    console.log('Carregando dados extraídos do PDF...');
    
    try {
        const rawData = fs.readFileSync(IBGE_COMPLETE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        console.log(`✓ Dados carregados: ${data.totalFoods} alimentos`);
        console.log(`✓ Grupos: ${data.grupos.length} categorias`);
        
        return data;
        
    } catch (error) {
        console.error(`✗ Erro ao carregar dados: ${error.message}`);
        return null;
    }
}

/**
 * Converte alimento do formato extraído para formato do sistema
 */
function convertToSystemFormat(food, index) {
    // Os alimentos já vêm no formato correto do extrator
    // Apenas ajustar ID para evitar conflitos
    const systemFood = {
        ...food,
        id: 7000 + index  // IDs únicos começando em 7000
    };
    
    return systemFood;
}

/**
 * Mapeia categoria para ID do grupo
 */
function getGroupId(categoria) {
    const groupMap = {
        "Açúcares e Produtos de Confeitaria": 10,
        "Cereais e Produtos de Cereais": 1,
        "Leguminosas": 14,
        "Carnes e Produtos Cárneus": 6,
        "Peixes e Frutos do Mar": 5,
        "Leite e Produtos Lácteos": 7,
        "Ovos e Derivados": 9,
        "Frutas e Produtos de Frutas": 3,
        "Hortaliças": 2,
        "Óleos e Gorduras": 4,
        "Oleaginosas": 14,
        "Bebidas": 8,
        "Diversos": 11
    };
    
    return groupMap[categoria] || 11;
}

/**
 * Gera estrutura completa para o sistema
 */
function generateSystemData(ibgeData) {
    console.log('\nConvertendo dados para formato do sistema...');
    
    // Converter alimentos
    const systemFoods = ibgeData.alimentos.map((food, index) => 
        convertToSystemFormat(food, index)
    );
    
    // Gerar grupos atualizados
    const grupos = [
        { id: 1, nome: "Cereais e derivados", cor: "#F59E0B" },
        { id: 2, nome: "Verduras, hortaliças e derivados", cor: "#10B981" },
        { id: 3, nome: "Frutas e derivados", cor: "#F97316" },
        { id: 4, nome: "Gorduras e óleos", cor: "#EF4444" },
        { id: 5, nome: "Pescados e frutos do mar", cor: "#3B82F6" },
        { id: 6, nome: "Carnes e derivados", cor: "#DC2626" },
        { id: 7, nome: "Leite e derivados", cor: "#F3F4F6" },
        { id: 8, nome: "Bebidas (alcoólicas e não alcoólicas)", cor: "#8B5CF6" },
        { id: 9, nome: "Ovos e derivados", cor: "#FBBF24" },
        { id: 10, nome: "Produtos açucarados", cor: "#EC4899" },
        { id: 11, nome: "Diversos", cor: "#6B7280" },
        { id: 12, nome: "Oleaginosas", cor: "#8B5CF6" },
        { id: 13, nome: "Leguminosas", cor: "#10B981" },
        { id: 14, nome: "Oleaginosas e Leguminosas", cor: "#059669" }
    ];
    
    // Gerar categorias
    const categorias = [...new Set(systemFoods.map(food => food.categoria))].sort();
    
    const systemData = {
        version: "3.0-complete-ibge",
        source: "IBGE - Pesquisa de Orçamentos Familiares",
        description: "Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil - COMPLETA",
        lastUpdated: new Date().toISOString().split('T')[0],
        totalFoods: systemFoods.length,
        extractionMethod: "PDF parsing + sistema integration",
        grupos,
        categorias,
        alimentos: systemFoods
    };
    
    console.log(`✓ ${systemFoods.length} alimentos convertidos`);
    console.log(`✓ ${categorias.length} categorias identificadas`);
    
    return systemData;
}

/**
 * Salva dados no arquivo do sistema
 */
function saveToSystem(systemData) {
    console.log('\nSalvando dados no sistema...');
    
    try {
        // Criar backup do arquivo atual se existir
        if (fs.existsSync(SYSTEM_IBGE_PATH)) {
            const backupPath = SYSTEM_IBGE_PATH.replace('.json', '_backup.json');
            fs.copyFileSync(SYSTEM_IBGE_PATH, backupPath);
            console.log(`✓ Backup criado: ${backupPath}`);
        }
        
        // Salvar dados completos
        fs.writeFileSync(SYSTEM_IBGE_PATH, JSON.stringify(systemData, null, 2), 'utf8');
        console.log(`✓ Arquivo atualizado: ${SYSTEM_IBGE_PATH}`);
        
        return true;
        
    } catch (error) {
        console.error(`✗ Erro ao salvar: ${error.message}`);
        return false;
    }
}

/**
 * Gera relatório de importação
 */
function generateReport(systemData) {
    console.log('\n' + '='.repeat(60));
    console.log('RELATÓRIO DE IMPORTAÇÃO');
    console.log('='.repeat(60));
    
    console.log(`📊 Total de alimentos importados: ${systemData.totalFoods}`);
    console.log(`📂 Categorias: ${systemData.categorias.length}`);
    console.log(`🏷️  Grupos: ${systemData.grupos.length}`);
    
    // Estatísticas por categoria
    const stats = {};
    systemData.alimentos.forEach(food => {
        const cat = food.categoria;
        stats[cat] = (stats[cat] || 0) + 1;
    });
    
    console.log('\n📈 Distribuição por categoria:');
    Object.entries(stats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([categoria, count]) => {
            console.log(`  📂 ${categoria}: ${count} alimentos`);
        });
    
    console.log('\n✅ Importação concluída com sucesso!');
    console.log('🚀 Sistema pronto para usar todos os alimentos IBGE');
}

/**
 * Função principal
 */
function main() {
    // Verificar se arquivo de dados existe
    if (!fs.existsSync(IBGE_COMPLETE_PATH)) {
        console.error(`✗ Arquivo não encontrado: ${IBGE_COMPLETE_PATH}`);
        process.exit(1);
    }
    
    // Carregar dados extraídos
    const ibgeData = loadCompleteIBGEData();
    if (!ibgeData) {
        console.error('✗ Falha ao carregar dados');
        process.exit(1);
    }
    
    // Converter para formato do sistema
    const systemData = generateSystemData(ibgeData);
    
    // Salvar no sistema
    const success = saveToSystem(systemData);
    if (!success) {
        console.error('✗ Falha ao salvar dados');
        process.exit(1);
    }
    
    // Gerar relatório
    generateReport(systemData);
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    loadCompleteIBGEData,
    convertToSystemFormat,
    generateSystemData,
    saveToSystem
};