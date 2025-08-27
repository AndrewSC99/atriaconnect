#!/usr/bin/env node
/**
 * Análise detalhada dos problemas nos dados IBGE
 */

const fs = require('fs');
const path = require('path');

const IBGE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');

console.log('='.repeat(80));
console.log('ANÁLISE DETALHADA DOS PROBLEMAS NOS DADOS IBGE');
console.log('='.repeat(80));

const ibgeData = JSON.parse(fs.readFileSync(IBGE_PATH, 'utf8'));

// 1. Análise de macronutrientes zerados
console.log('\n📊 ANÁLISE DE MACRONUTRIENTES ZERADOS:');

let zeroProtein = 0;
let zeroCarbs = 0;
let zeroFat = 0;
let zeroEnergy = 0;
let allMacrosZero = 0;

// Exemplos de cada categoria
const examplesZeroProtein = [];
const examplesZeroEnergy = [];
const examplesAllZero = [];

// Análise de valores anormais
let abnormalValues = 0;
const examplesAbnormal = [];

ibgeData.alimentos.forEach(alimento => {
    // Verificar zeros
    if (alimento.proteina_g === 0) {
        zeroProtein++;
        if (examplesZeroProtein.length < 3) {
            examplesZeroProtein.push(alimento.nome);
        }
    }
    
    if (alimento.carboidrato_g === 0) zeroCarbs++;
    if (alimento.lipidios_g === 0) zeroFat++;
    
    if (alimento.energia_kcal === 0) {
        zeroEnergy++;
        if (examplesZeroEnergy.length < 3) {
            examplesZeroEnergy.push(alimento.nome);
        }
    }
    
    // Verificar se todos macros são zero
    if (alimento.proteina_g === 0 && 
        alimento.carboidrato_g === 0 && 
        alimento.lipidios_g === 0 &&
        alimento.energia_kcal === 0) {
        allMacrosZero++;
        if (examplesAllZero.length < 3) {
            examplesAllZero.push(alimento.nome);
        }
    }
    
    // Detectar valores anormais (códigos de alimentos como valores nutricionais)
    const checkFields = [
        'proteina_g', 'carboidrato_g', 'lipidios_g', 'fibra_alimentar_g',
        'calcio_mg', 'ferro_mg', 'sodio_mg', 'potassio_mg'
    ];
    
    for (let field of checkFields) {
        if (alimento[field] > 10000) {  // Valor impossível para nutriente
            abnormalValues++;
            if (examplesAbnormal.length < 5) {
                examplesAbnormal.push({
                    nome: alimento.nome,
                    campo: field,
                    valor: alimento[field]
                });
            }
            break;
        }
    }
});

const totalAlimentos = ibgeData.alimentos.length;

console.log(`  SEM proteína: ${zeroProtein}/${totalAlimentos} (${(zeroProtein/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  SEM carboidratos: ${zeroCarbs}/${totalAlimentos} (${(zeroCarbs/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  SEM gorduras: ${zeroFat}/${totalAlimentos} (${(zeroFat/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  SEM energia: ${zeroEnergy}/${totalAlimentos} (${(zeroEnergy/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  TODOS macros zerados: ${allMacrosZero}/${totalAlimentos} (${(allMacrosZero/totalAlimentos*100).toFixed(1)}%)`);

if (examplesZeroProtein.length > 0) {
    console.log('\nExemplos sem proteína:');
    examplesZeroProtein.forEach(nome => console.log(`  • ${nome}`));
}

if (examplesZeroEnergy.length > 0) {
    console.log('\nExemplos sem energia:');
    examplesZeroEnergy.forEach(nome => console.log(`  • ${nome}`));
}

// 2. Análise de valores anormais
console.log('\n⚠️ VALORES ANORMAIS (códigos como nutrientes):');
console.log(`  Total de alimentos com valores anormais: ${abnormalValues}`);

if (examplesAbnormal.length > 0) {
    console.log('\nExemplos de valores anormais:');
    examplesAbnormal.forEach(ex => {
        console.log(`  • ${ex.nome}`);
        console.log(`    Campo: ${ex.campo} = ${ex.valor} (provável código de alimento)`);
    });
}

// 3. Análise do sufixo "- Não"
console.log('\n📝 ANÁLISE DO SUFIXO "- NÃO":');

let withNao = 0;
let withCru = 0;
let withCozido = 0;
let withAssado = 0;
let withFrito = 0;
let withGrelhado = 0;
let withEnsopado = 0;
let withMingau = 0;

const preparationExamples = {};

ibgeData.alimentos.forEach(alimento => {
    const nome = alimento.nome;
    
    if (nome.includes('- Não')) {
        withNao++;
        if (!preparationExamples['Não']) preparationExamples['Não'] = [];
        if (preparationExamples['Não'].length < 3) {
            preparationExamples['Não'].push(nome);
        }
    }
    
    if (nome.includes('Cru(a)')) withCru++;
    if (nome.includes('Cozido(a)')) withCozido++;
    if (nome.includes('Assado(a)')) withAssado++;
    if (nome.includes('Frito(a)')) withFrito++;
    if (nome.includes('Grelhado(a)')) withGrelhado++;
    if (nome.includes('Ensopado')) withEnsopado++;
    if (nome.includes('Mingau')) withMingau++;
});

console.log(`  Com "- Não": ${withNao}/${totalAlimentos} (${(withNao/totalAlimentos*100).toFixed(1)}%)`);
console.log(`  Com "Cru(a)": ${withCru}`);
console.log(`  Com "Cozido(a)": ${withCozido}`);
console.log(`  Com "Assado(a)": ${withAssado}`);
console.log(`  Com "Frito(a)": ${withFrito}`);
console.log(`  Com "Grelhado(a)": ${withGrelhado}`);

console.log('\n📌 EXPLICAÇÃO DO "- NÃO":');
console.log('  O sufixo "- Não" indica que o alimento está SEM preparação específica.');
console.log('  É o estado base/natural do alimento antes de qualquer preparo.');
console.log('  Outros códigos indicam diferentes preparações do mesmo alimento.');

if (preparationExamples['Não']) {
    console.log('\nExemplos com "- Não":');
    preparationExamples['Não'].forEach(nome => console.log(`  • ${nome}`));
}

// 4. Análise por categorias
console.log('\n📊 PROBLEMAS POR CATEGORIA:');

const categoryProblems = {};

ibgeData.alimentos.forEach(alimento => {
    const cat = alimento.categoria;
    if (!categoryProblems[cat]) {
        categoryProblems[cat] = {
            total: 0,
            semProteina: 0,
            semEnergia: 0,
            comValoresAnormais: 0
        };
    }
    
    categoryProblems[cat].total++;
    
    if (alimento.proteina_g === 0) categoryProblems[cat].semProteina++;
    if (alimento.energia_kcal === 0) categoryProblems[cat].semEnergia++;
    
    // Verificar valores anormais
    const hasAbnormal = ['proteina_g', 'carboidrato_g', 'lipidios_g', 'fibra_alimentar_g']
        .some(field => alimento[field] > 10000);
    if (hasAbnormal) categoryProblems[cat].comValoresAnormais++;
});

Object.entries(categoryProblems)
    .sort(([,a], [,b]) => b.total - a.total)
    .forEach(([categoria, stats]) => {
        const percentSemProteina = (stats.semProteina/stats.total*100).toFixed(1);
        const percentSemEnergia = (stats.semEnergia/stats.total*100).toFixed(1);
        console.log(`\n  ${categoria}:`);
        console.log(`    Total: ${stats.total} alimentos`);
        console.log(`    Sem proteína: ${stats.semProteina} (${percentSemProteina}%)`);
        console.log(`    Sem energia: ${stats.semEnergia} (${percentSemEnergia}%)`);
        if (stats.comValoresAnormais > 0) {
            console.log(`    ⚠️ Com valores anormais: ${stats.comValoresAnormais}`);
        }
    });

// 5. Resumo dos problemas
console.log('\n' + '='.repeat(80));
console.log('RESUMO DOS PROBLEMAS IDENTIFICADOS');
console.log('='.repeat(80));

console.log('\n🔴 PROBLEMAS CRÍTICOS:');
console.log(`  1. ${zeroProtein} alimentos (${(zeroProtein/totalAlimentos*100).toFixed(1)}%) sem proteína`);
console.log(`  2. ${zeroCarbs} alimentos (${(zeroCarbs/totalAlimentos*100).toFixed(1)}%) sem carboidratos`);
console.log(`  3. ${zeroEnergy} alimentos (${(zeroEnergy/totalAlimentos*100).toFixed(1)}%) sem energia`);
console.log(`  4. ${abnormalValues} alimentos com valores nutricionais anormais (códigos como valores)`);

console.log('\n🟡 OBSERVAÇÕES:');
console.log(`  • ${withNao} alimentos (${(withNao/totalAlimentos*100).toFixed(1)}%) têm "- Não" no nome (sem preparação)`);
console.log(`  • Os valores anormais parecem ser códigos de alimentos inseridos incorretamente`);
console.log(`  • Muitos alimentos têm macronutrientes zerados incorretamente`);

console.log('\n💡 CAUSA PROVÁVEL:');
console.log('  O extrator está confundindo códigos de alimentos com valores nutricionais');
console.log('  em algumas linhas do PDF, especialmente quando há quebras de página ou');
console.log('  formatação irregular nas tabelas.');

console.log('\n🔧 SOLUÇÃO NECESSÁRIA:');
console.log('  1. Corrigir o parser para distinguir códigos de valores nutricionais');
console.log('  2. Implementar validação de ranges para valores nutricionais');
console.log('  3. Re-processar as páginas com problemas');
console.log('  4. Adicionar verificação de sanidade dos dados extraídos');