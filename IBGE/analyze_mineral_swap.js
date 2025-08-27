#!/usr/bin/env node
/**
 * Análise da troca de minerais no mapeamento IBGE
 */

const fs = require('fs');
const path = require('path');

const IBGE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');

console.log('='.repeat(80));
console.log('ANÁLISE DA TROCA DE MINERAIS - IBGE');
console.log('='.repeat(80));

const ibgeData = JSON.parse(fs.readFileSync(IBGE_PATH, 'utf8'));

// Analisar padrões suspeitos
let ferroAlto = 0;  // Ferro > 10mg/100g é suspeito
let sodioMuitoBaixo = 0;  // Sódio < 1mg/100g é suspeito
let potassioBaixo = 0;  // Potássio < 10mg/100g é suspeito

const exemplos = [];
const padroesAnormais = [];

ibgeData.alimentos.forEach(alimento => {
    const ferro = alimento.ferro_mg;
    const sodio = alimento.sodio_mg;
    const potassio = alimento.potassio_mg;
    const calcio = alimento.calcio_mg;
    const magnesio = alimento.magnesio_mg;
    const fosforo = alimento.fosforo_mg;
    
    // Detectar padrões anormais
    if (ferro > 10) {
        ferroAlto++;
        if (exemplos.length < 10) {
            exemplos.push({
                nome: alimento.nome,
                calcio: calcio,
                magnesio: magnesio,
                fosforo: fosforo,
                ferro: ferro,
                sodio: sodio,
                potassio: potassio
            });
        }
    }
    
    if (sodio < 1 && sodio > 0) {
        sodioMuitoBaixo++;
    }
    
    if (potassio < 10 && potassio > 0) {
        potassioBaixo++;
    }
    
    // Detectar se há um padrão de troca sistemática
    // Se ferro tem valores típicos de sódio (10-1000mg) e sódio tem valores típicos de potássio (0.01-10mg)
    if (ferro > 10 && ferro < 1000 && sodio < 10 && potassio < 500) {
        if (padroesAnormais.length < 5) {
            padroesAnormais.push({
                nome: alimento.nome,
                suspeita: 'Possível troca: Ferro↔Sódio, Sódio↔Potássio',
                ferro: ferro,
                sodio: sodio,
                potassio: potassio
            });
        }
    }
});

const total = ibgeData.alimentos.length;

console.log('\n📊 PADRÕES SUSPEITOS DETECTADOS:');
console.log(`  • Ferro > 10mg/100g: ${ferroAlto}/${total} alimentos (${(ferroAlto/total*100).toFixed(1)}%)`);
console.log(`  • Sódio < 1mg/100g: ${sodioMuitoBaixo}/${total} alimentos (${(sodioMuitoBaixo/total*100).toFixed(1)}%)`);
console.log(`  • Potássio < 10mg/100g: ${potassioBaixo}/${total} alimentos (${(potassioBaixo/total*100).toFixed(1)}%)`);

console.log('\n🔍 EXEMPLOS COM VALORES SUSPEITOS:');
console.log('(Valores em mg/100g)');
console.log('─'.repeat(80));
console.log('Alimento                                 Ca     Mg    P     Fe    Na     K');
console.log('─'.repeat(80));

exemplos.forEach(ex => {
    const nome = ex.nome.substring(0, 40).padEnd(40, ' ');
    const ca = ex.calcio.toFixed(1).padStart(5, ' ');
    const mg = ex.magnesio.toFixed(1).padStart(5, ' ');
    const p = ex.fosforo.toFixed(1).padStart(5, ' ');
    const fe = ex.ferro.toFixed(1).padStart(5, ' ');
    const na = ex.sodio.toFixed(1).padStart(5, ' ');
    const k = ex.potassio.toFixed(1).padStart(5, ' ');
    console.log(`${nome} ${ca} ${mg} ${p} ${fe} ${na} ${k}`);
});

console.log('\n⚠️ DIAGNÓSTICO DA TROCA:');
console.log('─'.repeat(80));
console.log('ORDEM CORRETA NO PDF (Tabela 3):');
console.log('  1. Cálcio');
console.log('  2. Magnésio');
console.log('  3. Manganês (NÃO ESTÁ SENDO EXTRAÍDO)');
console.log('  4. Fósforo');
console.log('  5. Ferro');
console.log('  6. Sódio');
console.log('  7. Sódio de adição (IGNORADO)');
console.log('  8. Potássio');
console.log('  9. Cobre');
console.log('  10. Zinco');

console.log('\n❌ MAPEAMENTO ATUAL ERRADO:');
console.log('  values[0] → Cálcio     ✓ Correto');
console.log('  values[1] → Magnésio   ✓ Correto');
console.log('  values[2] → Fósforo    ✗ ERRADO (é Manganês no PDF)');
console.log('  values[3] → Ferro      ✗ ERRADO (é Fósforo no PDF)');
console.log('  values[4] → Sódio      ✗ ERRADO (é Ferro no PDF)');
console.log('  values[5] → Potássio   ✗ ERRADO (é Sódio no PDF)');

console.log('\n✅ MAPEAMENTO CORRETO DEVERIA SER:');
console.log('  values[0] → Cálcio');
console.log('  values[1] → Magnésio');
console.log('  values[2] → Manganês');
console.log('  values[3] → Fósforo');
console.log('  values[4] → Ferro');
console.log('  values[5] → Sódio');
console.log('  values[6] → Sódio de adição (pular)');
console.log('  values[7] → Potássio');
console.log('  values[8] → Cobre');
console.log('  values[9] → Zinco');

console.log('\n💡 EXEMPLO REAL DO PDF:');
console.log('Arroz polido (valores corretos do PDF):');
console.log('  • Cálcio: 3.51mg');
console.log('  • Magnésio: 2.23mg');
console.log('  • Manganês: 0.29mg');
console.log('  • Fósforo: 17.77mg');
console.log('  • Ferro: 0.08mg');
console.log('  • Sódio: 1.19mg');
console.log('  • Potássio: 382.00mg');

console.log('\n❌ Como está no sistema (ERRADO):');
console.log('  • Cálcio: 3.51mg ✓');
console.log('  • Magnésio: 2.23mg ✓');
console.log('  • Fósforo: 0.29mg (é o Manganês)');
console.log('  • Ferro: 17.77mg (é o Fósforo)');
console.log('  • Sódio: 0.08mg (é o Ferro)');
console.log('  • Potássio: 1.19mg (é o Sódio)');

console.log('\n🔧 SOLUÇÃO NECESSÁRIA:');
console.log('  1. Corrigir o mapeamento na linha 272-278 do extrator');
console.log('  2. Adicionar campo manganês');
console.log('  3. Ajustar índices para pular "Sódio de adição"');
console.log('  4. Re-processar todos os dados');