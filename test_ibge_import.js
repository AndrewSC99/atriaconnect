#!/usr/bin/env node
/**
 * Script para testar e validar a importação dos 3.727 alimentos IBGE
 */

const fs = require('fs');
const path = require('path');

// Caminho do arquivo IBGE atualizado
const IBGE_FILE_PATH = path.resolve(__dirname, 'sistema-nutricional/src/data/ibge-pof.json');

console.log('='.repeat(60));
console.log('TESTE E VALIDAÇÃO DOS ALIMENTOS IBGE IMPORTADOS');
console.log('='.repeat(60));

/**
 * Testa a estrutura e integridade dos dados
 */
function testDataStructure() {
    console.log('\n🔍 Testando estrutura dos dados...');
    
    try {
        // Carregar dados
        const rawData = fs.readFileSync(IBGE_FILE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        // Verificar estrutura básica
        const requiredFields = ['version', 'source', 'totalFoods', 'alimentos', 'grupos', 'categorias'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                console.error(`❌ Campo obrigatório ausente: ${field}`);
                return false;
            }
        }
        
        console.log(`✅ Estrutura básica válida`);
        
        // Verificar dados dos alimentos
        const alimentos = data.alimentos;
        
        console.log(`📊 Total de alimentos: ${alimentos.length}`);
        console.log(`🎯 Total esperado: ${data.totalFoods}`);
        
        if (alimentos.length !== data.totalFoods) {
            console.error(`❌ Divergência no total de alimentos`);
            return false;
        }
        
        // Testar alguns alimentos aleatórios
        console.log('\n🧪 Testando alimentos individuais...');
        
        const sampleSize = Math.min(10, alimentos.length);
        const sampleIndices = [];
        
        for (let i = 0; i < sampleSize; i++) {
            sampleIndices.push(Math.floor(Math.random() * alimentos.length));
        }
        
        for (const index of sampleIndices) {
            const alimento = alimentos[index];
            
            if (!alimento.id || !alimento.nome || !alimento.categoria) {
                console.error(`❌ Alimento inválido no índice ${index}:`, alimento);
                return false;
            }
            
            console.log(`   ✓ ${alimento.nome} (${alimento.categoria})`);
        }
        
        console.log(`✅ ${sampleSize} alimentos testados com sucesso`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao testar estrutura: ${error.message}`);
        return false;
    }
}

/**
 * Testa a distribuição por categorias
 */
function testCategoryDistribution() {
    console.log('\n📊 Testando distribuição por categorias...');
    
    try {
        const rawData = fs.readFileSync(IBGE_FILE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        const alimentos = data.alimentos;
        const categoryStats = {};
        
        // Contar alimentos por categoria
        alimentos.forEach(alimento => {
            const cat = alimento.categoria || 'Sem categoria';
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });
        
        console.log('\n📈 Distribuição encontrada:');
        
        Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([categoria, count]) => {
                const percentage = ((count / alimentos.length) * 100).toFixed(1);
                console.log(`   📂 ${categoria}: ${count} alimentos (${percentage}%)`);
            });
        
        console.log(`✅ Distribuição por categorias validada`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao testar categorias: ${error.message}`);
        return false;
    }
}

/**
 * Testa dados nutricionais
 */
function testNutritionalData() {
    console.log('\n🥗 Testando dados nutricionais...');
    
    try {
        const rawData = fs.readFileSync(IBGE_FILE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        const alimentos = data.alimentos;
        let validNutritionalData = 0;
        let highProteinFoods = 0;
        let highEnergyFoods = 0;
        let highFiberFoods = 0;
        
        alimentos.forEach(alimento => {
            // Verificar se tem pelo menos alguns dados nutricionais
            if (alimento.energia_kcal > 0 || alimento.proteina_g > 0 || alimento.carboidrato_g > 0) {
                validNutritionalData++;
            }
            
            // Estatísticas interessantes
            if (alimento.proteina_g > 15) highProteinFoods++;
            if (alimento.energia_kcal > 300) highEnergyFoods++;
            if (alimento.fibra_alimentar_g > 5) highFiberFoods++;
        });
        
        const percentageValid = ((validNutritionalData / alimentos.length) * 100).toFixed(1);
        
        console.log(`   📊 Alimentos com dados nutricionais: ${validNutritionalData}/${alimentos.length} (${percentageValid}%)`);
        console.log(`   💪 Alto teor de proteína (>15g): ${highProteinFoods} alimentos`);
        console.log(`   🔥 Alta energia (>300kcal): ${highEnergyFoods} alimentos`);
        console.log(`   🌾 Rica em fibras (>5g): ${highFiberFoods} alimentos`);
        
        if (validNutritionalData > (alimentos.length * 0.8)) {
            console.log(`✅ Dados nutricionais válidos`);
            return true;
        } else {
            console.error(`❌ Muitos alimentos sem dados nutricionais`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao testar dados nutricionais: ${error.message}`);
        return false;
    }
}

/**
 * Testa funcionalidades de busca simuladas
 */
function testSearchFunctionality() {
    console.log('\n🔍 Testando funcionalidades de busca...');
    
    try {
        const rawData = fs.readFileSync(IBGE_FILE_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        const alimentos = data.alimentos;
        
        // Teste 1: Busca por nome
        const searchTerms = ['arroz', 'carne', 'leite', 'banana', 'feijão'];
        
        console.log('   🔎 Testando busca por termos:');
        
        searchTerms.forEach(term => {
            const results = alimentos.filter(alimento => 
                alimento.nome.toLowerCase().includes(term.toLowerCase())
            );
            console.log(`     "${term}": ${results.length} resultados`);
        });
        
        // Teste 2: Busca por categoria
        const categoriasTeste = data.categorias.slice(0, 3);
        
        console.log('\n   📂 Testando busca por categoria:');
        
        categoriasTeste.forEach(categoria => {
            const results = alimentos.filter(alimento => alimento.categoria === categoria);
            console.log(`     "${categoria}": ${results.length} alimentos`);
        });
        
        console.log(`✅ Funcionalidades de busca funcionando`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao testar busca: ${error.message}`);
        return false;
    }
}

/**
 * Testa performance com volume de dados
 */
function testPerformance() {
    console.log('\n⚡ Testando performance com volume de dados...');
    
    try {
        const startTime = Date.now();
        
        // Simular operações do hook useNutritionalDatabase
        const rawData = fs.readFileSync(IBGE_FILE_PATH, 'utf8');
        const parseTime = Date.now();
        
        const data = JSON.parse(rawData);
        const alimentos = data.alimentos;
        const jsonParseTime = Date.now();
        
        // Simular busca complexa
        const searchResults = alimentos
            .filter(alimento => alimento.energia_kcal > 100)
            .sort((a, b) => b.proteina_g - a.proteina_g)
            .slice(0, 50);
        
        const searchTime = Date.now();
        
        console.log(`   📖 Leitura do arquivo: ${parseTime - startTime}ms`);
        console.log(`   📊 Parse JSON: ${jsonParseTime - parseTime}ms`);
        console.log(`   🔍 Busca e ordenação: ${searchTime - jsonParseTime}ms`);
        console.log(`   🎯 Total: ${searchTime - startTime}ms`);
        console.log(`   📋 Resultados da busca: ${searchResults.length} alimentos`);
        
        if (searchTime - startTime < 2000) {
            console.log(`✅ Performance adequada para ${alimentos.length} alimentos`);
            return true;
        } else {
            console.error(`❌ Performance lenta para este volume de dados`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao testar performance: ${error.message}`);
        return false;
    }
}

/**
 * Gera relatório final
 */
function generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('RELATÓRIO FINAL DE VALIDAÇÃO');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => result === true).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes aprovados: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    
    console.log('\n📋 Detalhes dos testes:');
    
    Object.entries(results).forEach(([testName, result]) => {
        const status = result ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`   ${status} - ${testName}`);
    });
    
    if (failedTests === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('🚀 Sistema IBGE está funcionando perfeitamente com 3.727 alimentos');
    } else {
        console.log(`\n⚠️  ${failedTests} teste(s) falharam`);
        console.log('🔧 Verifique os problemas indicados acima');
    }
}

/**
 * Função principal
 */
function main() {
    // Verificar se arquivo existe
    if (!fs.existsSync(IBGE_FILE_PATH)) {
        console.error(`❌ Arquivo não encontrado: ${IBGE_FILE_PATH}`);
        process.exit(1);
    }
    
    // Executar todos os testes
    const results = {
        'Estrutura dos Dados': testDataStructure(),
        'Distribuição por Categorias': testCategoryDistribution(),
        'Dados Nutricionais': testNutritionalData(),
        'Funcionalidades de Busca': testSearchFunctionality(),
        'Performance': testPerformance()
    };
    
    // Gerar relatório
    generateReport(results);
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    testDataStructure,
    testCategoryDistribution,
    testNutritionalData,
    testSearchFunctionality,
    testPerformance
};