#!/usr/bin/env node
/**
 * Importa os dados expandidos do IBGE com 1,963 alimentos
 * Substitui dados antigos e integra ao sistema
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('IMPORTAÇÃO IBGE EXPANDIDA - 1,963 ALIMENTOS');
console.log('='.repeat(60));

// Caminhos
const EXPANDED_DATA = path.resolve(__dirname, 'ibge_expanded_complete.json');
const SYSTEM_DATA = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');
const BACKUP_DIR = path.resolve(__dirname, 'sistema-nutricional/src/data');

// Verificar arquivos
if (!fs.existsSync(EXPANDED_DATA)) {
    console.log('❌ Arquivo expandido não encontrado:', EXPANDED_DATA);
    process.exit(1);
}

// Carregar dados expandidos
console.log('📖 Carregando dados expandidos...');
const expandedData = JSON.parse(fs.readFileSync(EXPANDED_DATA, 'utf8'));
console.log(`✅ Carregados: ${expandedData.totalFoods} alimentos`);

// Backup do arquivo atual
if (fs.existsSync(SYSTEM_DATA)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `ibge-pof_backup_${timestamp}.json`);
    
    console.log('💾 Fazendo backup do arquivo atual...');
    fs.copyFileSync(SYSTEM_DATA, backupPath);
    console.log(`✅ Backup salvo: ${backupPath}`);
}

// Análise da qualidade dos dados
console.log('\n🔬 ANÁLISE DA QUALIDADE DOS DADOS:');

let comMinerais = 0;
let comVitaminas = 0;
let comAmbos = 0;
let exemplosMinerais = [];
let exemplosVitaminas = [];

expandedData.alimentos.forEach(alimento => {
    // Verificar minerais
    const temMinerais = alimento.calcio_mg > 0 || 
                        alimento.ferro_mg > 0 || 
                        alimento.sodio_mg > 0 || 
                        alimento.potassio_mg > 0 || 
                        alimento.magnesio_mg > 0 ||
                        alimento.zinco_mg > 0;
    
    // Verificar vitaminas
    const temVitaminas = alimento.vitamina_c_mg > 0 || 
                         alimento.tiamina_mg > 0 || 
                         alimento.riboflavina_mg > 0 || 
                         alimento.niacina_mg > 0 || 
                         alimento.vitamina_b12_mcg > 0 ||
                         alimento.vitamina_d_mcg > 0 ||
                         alimento.vitamina_e_mg > 0 ||
                         alimento.retinol_mcg > 0;
    
    if (temMinerais) {
        comMinerais++;
        if (exemplosMinerais.length < 3) {
            exemplosMinerais.push(`${alimento.nome} (Fe: ${alimento.ferro_mg}mg, Ca: ${alimento.calcio_mg}mg)`);
        }
    }
    
    if (temVitaminas) {
        comVitaminas++;
        if (exemplosVitaminas.length < 3) {
            exemplosVitaminas.push(`${alimento.nome} (C: ${alimento.vitamina_c_mg}mg, B1: ${alimento.tiamina_mg}mg)`);
        }
    }
    
    if (temMinerais && temVitaminas) comAmbos++;
});

const totalAlimentos = expandedData.totalFoods;
console.log(`✅ COM minerais: ${comMinerais}/${totalAlimentos} (${(comMinerais/totalAlimentos*100).toFixed(1)}%)`);
console.log(`✅ COM vitaminas: ${comVitaminas}/${totalAlimentos} (${(comVitaminas/totalAlimentos*100).toFixed(1)}%)`);
console.log(`✅ COM minerais E vitaminas: ${comAmbos}/${totalAlimentos} (${(comAmbos/totalAlimentos*100).toFixed(1)}%)`);

if (exemplosMinerais.length > 0) {
    console.log('\n🔍 Exemplos com minerais:');
    exemplosMinerais.forEach(exemplo => console.log(`  • ${exemplo}`));
}

if (exemplosVitaminas.length > 0) {
    console.log('\n🔍 Exemplos com vitaminas:');
    exemplosVitaminas.forEach(exemplo => console.log(`  • ${exemplo}`));
}

// Comparação com dados anteriores
if (fs.existsSync(SYSTEM_DATA)) {
    const currentData = JSON.parse(fs.readFileSync(SYSTEM_DATA, 'utf8'));
    console.log(`\n📊 COMPARAÇÃO:`);
    console.log(`  📈 Antes: ${currentData.totalFoods} alimentos`);
    console.log(`  📈 Depois: ${totalAlimentos} alimentos`);
    console.log(`  🚀 Ganho: +${totalAlimentos - currentData.totalFoods} alimentos`);
}

// Integrar ao sistema
console.log('\n💾 INTEGRANDO AO SISTEMA...');

// Escrever arquivo final
fs.writeFileSync(SYSTEM_DATA, JSON.stringify(expandedData, null, 2), 'utf8');
console.log(`✅ Dados integrados ao sistema: ${SYSTEM_DATA}`);

// Verificar integração
const verificacao = JSON.parse(fs.readFileSync(SYSTEM_DATA, 'utf8'));
console.log(`✅ Verificação: ${verificacao.totalFoods} alimentos no sistema`);

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('INTEGRAÇÃO FINALIZADA COM SUCESSO');
console.log('='.repeat(60));

console.log('\n📌 RESULTADO FINAL:');
console.log(`  • Sistema agora tem ${verificacao.totalFoods} alimentos IBGE`);
console.log(`  • ${comMinerais} alimentos com dados de minerais (${(comMinerais/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  • ${comVitaminas} alimentos com dados de vitaminas (${(comVitaminas/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  • Meta de 1,971 alimentos: ${(totalAlimentos/1971*100).toFixed(1)}% alcançada`);

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('  1. Testar busca avançada no sistema');
console.log('  2. Verificar cards nutricionais');
console.log('  3. Validar exibição de minerais e vitaminas');

console.log(`\n📄 Logs salvos automaticamente pelo sistema`);