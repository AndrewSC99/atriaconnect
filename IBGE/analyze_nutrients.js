#!/usr/bin/env node
/**
 * Análise completa dos dados nutricionais IBGE
 * Verifica minerais, vitaminas e compara com total esperado
 */

const fs = require('fs');
const path = require('path');

// Caminhos
const IBGE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');
const TACO_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/taco-expanded.json');

console.log('='.repeat(60));
console.log('ANÁLISE COMPLETA DOS DADOS NUTRICIONAIS');
console.log('='.repeat(60));

// Carregar dados
const ibgeData = JSON.parse(fs.readFileSync(IBGE_PATH, 'utf8'));
const tacoData = JSON.parse(fs.readFileSync(TACO_PATH, 'utf8'));

// Análise 1: Totais
console.log('\n📊 TOTAIS DE ALIMENTOS:');
console.log(`  ✅ TACO: ${tacoData.alimentos.length} alimentos`);
console.log(`  ✅ IBGE: ${ibgeData.totalFoods} alimentos`);
console.log(`  📈 Total no sistema: ${tacoData.alimentos.length + ibgeData.totalFoods} alimentos`);

// Análise 2: Alimentos esperados vs reais IBGE
const IBGE_ESPERADO = 1971;  // Conforme documentação
const IBGE_ATUAL = ibgeData.totalFoods;
const FALTANDO = IBGE_ESPERADO - IBGE_ATUAL;

console.log('\n🎯 ANÁLISE IBGE:');
console.log(`  📋 Esperado (conforme PDF): ${IBGE_ESPERADO} alimentos`);
console.log(`  📦 Atual no sistema: ${IBGE_ATUAL} alimentos`);
console.log(`  ❌ Faltando extrair: ${FALTANDO} alimentos (${(FALTANDO/IBGE_ESPERADO*100).toFixed(1)}%)`);

// Análise 3: Qualidade dos dados nutricionais
console.log('\n🔬 ANÁLISE DE MINERAIS E VITAMINAS IBGE:');

let semMinerais = 0;
let semVitaminas = 0;
let semAmbos = 0;
let comTudo = 0;
let comParcial = 0;

// Exemplos de alimentos sem dados
const exemplosSemDados = [];

ibgeData.alimentos.forEach(alimento => {
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
                         alimento.vitamina_e_mg > 0;
    
    if (!temMinerais) semMinerais++;
    if (!temVitaminas) semVitaminas++;
    if (!temMinerais && !temVitaminas) {
        semAmbos++;
        if (exemplosSemDados.length < 5) {
            exemplosSemDados.push(alimento.nome);
        }
    }
    if (temMinerais && temVitaminas) comTudo++;
    if (temMinerais || temVitaminas) comParcial++;
});

console.log(`  ❌ SEM minerais: ${semMinerais}/${IBGE_ATUAL} (${(semMinerais/IBGE_ATUAL*100).toFixed(1)}%)`);
console.log(`  ❌ SEM vitaminas: ${semVitaminas}/${IBGE_ATUAL} (${(semVitaminas/IBGE_ATUAL*100).toFixed(1)}%)`);
console.log(`  ❌ SEM minerais E vitaminas: ${semAmbos}/${IBGE_ATUAL} (${(semAmbos/IBGE_ATUAL*100).toFixed(1)}%)`);
console.log(`  ⚠️ COM dados parciais: ${comParcial}/${IBGE_ATUAL} (${(comParcial/IBGE_ATUAL*100).toFixed(1)}%)`);
console.log(`  ✅ COM minerais E vitaminas: ${comTudo}/${IBGE_ATUAL} (${(comTudo/IBGE_ATUAL*100).toFixed(1)}%)`);

if (exemplosSemDados.length > 0) {
    console.log('\n🔍 Exemplos de alimentos SEM minerais/vitaminas:');
    exemplosSemDados.forEach(nome => {
        console.log(`  • ${nome}`);
    });
}

// Análise 4: Categorias IBGE
console.log('\n📂 DISTRIBUIÇÃO POR CATEGORIA IBGE:');
const categorias = {};
ibgeData.alimentos.forEach(alimento => {
    const cat = alimento.categoria;
    if (!categorias[cat]) {
        categorias[cat] = { total: 0, semDados: 0 };
    }
    categorias[cat].total++;
    
    const temDados = alimento.calcio_mg > 0 || alimento.ferro_mg > 0 || alimento.vitamina_c_mg > 0;
    if (!temDados) {
        categorias[cat].semDados++;
    }
});

Object.entries(categorias)
    .sort(([,a], [,b]) => b.total - a.total)
    .forEach(([categoria, stats]) => {
        const percentSemDados = (stats.semDados/stats.total*100).toFixed(1);
        const status = stats.semDados === 0 ? '✅' : 
                      stats.semDados < stats.total/2 ? '⚠️' : '❌';
        console.log(`  ${status} ${categoria}: ${stats.total} alimentos (${stats.semDados} sem dados - ${percentSemDados}%)`);
    });

// Análise 5: Resumo final
console.log('\n' + '='.repeat(60));
console.log('RESUMO E DIAGNÓSTICO');
console.log('='.repeat(60));

console.log('\n📌 SITUAÇÃO ATUAL:');
console.log(`  • Sistema tem ${tacoData.alimentos.length} alimentos TACO (completo)`);
console.log(`  • Sistema tem ${IBGE_ATUAL} alimentos IBGE de ${IBGE_ESPERADO} possíveis`);
console.log(`  • Faltam adicionar ${FALTANDO} alimentos IBGE`);

console.log('\n⚠️ PROBLEMAS IDENTIFICADOS:');
console.log(`  1. Faltam ${FALTANDO} alimentos IBGE (${(FALTANDO/IBGE_ESPERADO*100).toFixed(1)}% do total)`);
console.log(`  2. ${semMinerais} alimentos sem dados de minerais (${(semMinerais/IBGE_ATUAL*100).toFixed(1)}%)`);
console.log(`  3. ${semVitaminas} alimentos sem dados de vitaminas (${(semVitaminas/IBGE_ATUAL*100).toFixed(1)}%)`);

console.log('\n🎯 AÇÕES NECESSÁRIAS:');
console.log('  1. Extrair os ~886 alimentos faltantes do PDF IBGE');
console.log('  2. Melhorar extração das tabelas 3 e 4 (minerais e vitaminas)');
console.log('  3. Implementar fallback para dados faltantes usando valores médios por categoria');

// Salvar relatório
const relatorio = {
    data: new Date().toISOString(),
    totais: {
        taco: tacoData.alimentos.length,
        ibge_atual: IBGE_ATUAL,
        ibge_esperado: IBGE_ESPERADO,
        ibge_faltando: FALTANDO
    },
    qualidade: {
        sem_minerais: semMinerais,
        sem_vitaminas: semVitaminas,
        sem_ambos: semAmbos,
        com_tudo: comTudo,
        com_parcial: comParcial
    },
    percentuais: {
        cobertura_ibge: ((IBGE_ATUAL/IBGE_ESPERADO)*100).toFixed(1) + '%',
        sem_minerais: ((semMinerais/IBGE_ATUAL)*100).toFixed(1) + '%',
        sem_vitaminas: ((semVitaminas/IBGE_ATUAL)*100).toFixed(1) + '%'
    }
};

const relatorioPath = path.resolve(__dirname, 'relatorio_nutrientes.json');
fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2), 'utf8');
console.log(`\n📄 Relatório salvo em: ${relatorioPath}`);