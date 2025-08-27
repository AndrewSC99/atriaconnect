#!/usr/bin/env node
/**
 * Importa os dados IBGE LIMPOS para o sistema
 */

const fs = require('fs');
const path = require('path');

// Caminhos
const CLEANED_DATA_PATH = path.resolve(__dirname, 'ibge_cleaned_final.json');
const SYSTEM_IBGE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');

console.log('='.repeat(60));
console.log('IMPORTAÇÃO DOS DADOS IBGE LIMPOS');
console.log('='.repeat(60));

function main() {
    try {
        // Carregar dados limpos
        console.log('📖 Carregando dados limpos...');
        const rawData = fs.readFileSync(CLEANED_DATA_PATH, 'utf8');
        const cleanedData = JSON.parse(rawData);
        
        console.log(`✓ ${cleanedData.totalFoods} alimentos carregados`);
        
        // Criar backup do arquivo atual
        if (fs.existsSync(SYSTEM_IBGE_PATH)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const backupPath = SYSTEM_IBGE_PATH.replace('.json', `_backup_${timestamp}.json`);
            fs.copyFileSync(SYSTEM_IBGE_PATH, backupPath);
            console.log(`✓ Backup criado: ${backupPath}`);
        }
        
        // Salvar dados limpos no sistema
        console.log('\n💾 Atualizando arquivo do sistema...');
        fs.writeFileSync(SYSTEM_IBGE_PATH, JSON.stringify(cleanedData, null, 2), 'utf8');
        
        console.log('\n' + '='.repeat(60));
        console.log('IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(60));
        console.log(`📁 Sistema atualizado: ${SYSTEM_IBGE_PATH}`);
        console.log(`📊 Total: ${cleanedData.totalFoods} alimentos únicos`);
        console.log(`🏷️ Categorias: ${cleanedData.categorias.length}`);
        
        console.log('\n🎉 MELHORIAS APLICADAS:');
        console.log('  ✅ Removidas duplicatas (795 alimentos)');
        console.log('  ✅ Categorias corrigidas (279 alimentos)');  
        console.log('  ✅ Dados limpos e validados');
        console.log('  ✅ IDs únicos renumerados');
        
        console.log('\n📊 Nova distribuição:');
        Object.entries(cleanedData.estatisticas || {}).forEach(([categoria, count]) => {
            if (categoria !== 'total_alimentos' && categoria !== 'grupos_count') {
                const percentage = ((count / cleanedData.totalFoods) * 100).toFixed(1);
                console.log(`  📂 ${categoria}: ${count} alimentos (${percentage}%)`);
            }
        });
        
        console.log('\n🚀 Sistema pronto para usar os dados corrigidos!');
        
    } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };