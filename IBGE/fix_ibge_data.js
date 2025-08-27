#!/usr/bin/env node
/**
 * Script para corrigir dados IBGE:
 * 1. Remover duplicatas
 * 2. Limpar dados inválidos
 * 3. Melhorar categorização
 */

const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const FIXED_DATA_PATH = path.resolve(__dirname, 'ibge_complete_fixed.json');
const OUTPUT_PATH = path.resolve(__dirname, 'ibge_cleaned_final.json');

console.log('='.repeat(60));
console.log('LIMPEZA E CORREÇÃO DOS DADOS IBGE');
console.log('='.repeat(60));

/**
 * Remove duplicatas mantendo o item com mais dados nutricionais
 */
function removeDuplicates(alimentos) {
    console.log('\n🧹 Removendo duplicatas...');
    
    const uniqueFoods = new Map();
    
    alimentos.forEach(alimento => {
        // Criar chave única baseada no nome base (sem preparação)
        const baseNameKey = alimento.nome.split(' - ')[0].trim().toLowerCase();
        
        if (!uniqueFoods.has(baseNameKey)) {
            uniqueFoods.set(baseNameKey, alimento);
        } else {
            const existing = uniqueFoods.get(baseNameKey);
            
            // Comparar qual tem mais dados nutricionais não-zero
            const currentNutrientCount = countNonZeroNutrients(alimento);
            const existingNutrientCount = countNonZeroNutrients(existing);
            
            // Manter o que tem mais dados ou o que tem maior energia
            if (currentNutrientCount > existingNutrientCount || 
                (currentNutrientCount === existingNutrientCount && alimento.energia_kcal > existing.energia_kcal)) {
                uniqueFoods.set(baseNameKey, alimento);
            }
        }
    });
    
    const result = Array.from(uniqueFoods.values());
    console.log(`  Removidas ${alimentos.length - result.length} duplicatas`);
    console.log(`  Restaram ${result.length} alimentos únicos`);
    
    return result;
}

/**
 * Conta quantos nutrientes não são zero
 */
function countNonZeroNutrients(alimento) {
    const nutrients = [
        'energia_kcal', 'proteina_g', 'lipidios_g', 'carboidrato_g', 'fibra_alimentar_g',
        'calcio_mg', 'ferro_mg', 'sodio_mg', 'potassio_mg', 'vitamina_c_mg'
    ];
    
    return nutrients.reduce((count, nutrient) => {
        return count + (alimento[nutrient] > 0 ? 1 : 0);
    }, 0);
}

/**
 * Corrige categorias baseado no nome do alimento
 */
function fixCategories(alimentos) {
    console.log('\n📂 Corrigindo categorias...');
    
    const categoryMappings = {
        // Cereais
        'cereais': ['arroz', 'aveia', 'trigo', 'milho', 'cevada', 'centeio', 'quinoa', 'farinha', 'fubá', 'pão', 'macarrão', 'biscoito'],
        
        // Frutas
        'frutas': ['banana', 'maçã', 'laranja', 'uva', 'manga', 'abacaxi', 'melancia', 'mamão', 'morango', 'pêra', 'limão', 'caju', 'goiaba', 'abacate'],
        
        // Hortaliças
        'hortalicas': ['alface', 'tomate', 'cenoura', 'batata', 'cebola', 'alho', 'brócolis', 'couve', 'espinafre', 'repolho', 'abobrinha', 'chuchu', 'beterraba', 'pepino'],
        
        // Carnes
        'carnes': ['boi', 'bovina', 'carne', 'frango', 'peixe', 'salmão', 'sardinha', 'atum', 'camarão', 'porco', 'suína', 'cordeiro'],
        
        // Laticínios
        'laticinios': ['leite', 'queijo', 'iogurte', 'manteiga', 'nata', 'creme de leite', 'ricota', 'muçarela'],
        
        // Leguminosas
        'leguminosas': ['feijão', 'lentilha', 'grão de bico', 'ervilha', 'soja'],
        
        // Óleos e gorduras
        'oleos': ['óleo', 'azeite', 'margarina', 'banha'],
        
        // Bebidas
        'bebidas': ['suco', 'refrigerante', 'água', 'chá', 'café', 'vinho', 'cerveja', 'cachaça'],
        
        // Açúcares
        'acucares': ['açúcar', 'mel', 'chocolate', 'bala', 'doce', 'sobremesa', 'pudim', 'sorvete'],
        
        // Ovos
        'ovos': ['ovo']
    };
    
    const categoryNames = {
        'cereais': 'Cereais e Produtos de Cereais',
        'frutas': 'Frutas e Produtos de Frutas', 
        'hortalicas': 'Hortaliças',
        'carnes': 'Carnes e Produtos Cárneus',
        'laticinios': 'Leite e Produtos Lácteos',
        'leguminosas': 'Leguminosas',
        'oleos': 'Óleos e Gorduras',
        'bebidas': 'Bebidas',
        'acucares': 'Açúcares e Produtos de Confeitaria',
        'ovos': 'Ovos e Derivados'
    };
    
    let corrected = 0;
    
    alimentos.forEach(alimento => {
        const nomeLower = alimento.nome.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categoryMappings)) {
            if (keywords.some(keyword => nomeLower.includes(keyword))) {
                const newCategory = categoryNames[category];
                if (alimento.categoria !== newCategory) {
                    alimento.categoria = newCategory;
                    alimento.grupoId = getGroupId(newCategory);
                    corrected++;
                }
                break;
            }
        }
    });
    
    console.log(`  Categorias corrigidas: ${corrected} alimentos`);
    return alimentos;
}

/**
 * Mapeia categoria para ID do grupo
 */
function getGroupId(categoria) {
    const groupMap = {
        "Cereais e Produtos de Cereais": 1,
        "Hortaliças": 2,
        "Frutas e Produtos de Frutas": 3,
        "Óleos e Gorduras": 4,
        "Peixes e Frutos do Mar": 5,
        "Carnes e Produtos Cárneus": 6,
        "Leite e Produtos Lácteos": 7,
        "Bebidas": 8,
        "Ovos e Derivados": 9,
        "Açúcares e Produtos de Confeitaria": 10,
        "Leguminosas": 11,
        "Diversos": 12
    };
    
    return groupMap[categoria] || 12;
}

/**
 * Remove alimentos com dados insuficientes
 */
function filterValidFoods(alimentos) {
    console.log('\n🔍 Filtrando alimentos válidos...');
    
    const validFoods = alimentos.filter(alimento => {
        // Deve ter pelo menos nome e algum dado nutricional
        return alimento.nome && 
               alimento.nome.length > 2 && 
               (alimento.energia_kcal > 0 || alimento.proteina_g > 0 || alimento.carboidrato_g > 0);
    });
    
    console.log(`  Removidos ${alimentos.length - validFoods.length} alimentos inválidos`);
    console.log(`  Alimentos válidos: ${validFoods.length}`);
    
    return validFoods;
}

/**
 * Renumera IDs dos alimentos
 */
function renumberIds(alimentos) {
    console.log('\n🔢 Renumerando IDs...');
    
    alimentos.forEach((alimento, index) => {
        alimento.id = 7000 + index;
    });
    
    return alimentos;
}

/**
 * Gera estatísticas finais
 */
function generateStats(alimentos) {
    const stats = {};
    
    alimentos.forEach(alimento => {
        const cat = alimento.categoria;
        stats[cat] = (stats[cat] || 0) + 1;
    });
    
    return stats;
}

/**
 * Função principal
 */
function main() {
    try {
        // Carregar dados
        console.log('📖 Carregando dados...');
        const rawData = fs.readFileSync(FIXED_DATA_PATH, 'utf8');
        const data = JSON.parse(rawData);
        
        console.log(`  Total inicial: ${data.alimentos.length} alimentos`);
        
        // Pipeline de limpeza
        let cleanedFoods = data.alimentos;
        
        cleanedFoods = removeDuplicates(cleanedFoods);
        cleanedFoods = filterValidFoods(cleanedFoods);
        cleanedFoods = fixCategories(cleanedFoods);
        cleanedFoods = renumberIds(cleanedFoods);
        
        // Gerar nova estrutura
        const finalStats = generateStats(cleanedFoods);
        
        const finalData = {
            version: "5.0-cleaned-final",
            source: "IBGE - Pesquisa de Orçamentos Familiares",
            description: "Tabelas de Composição Nutricional - LIMPAS e CORRIGIDAS",
            lastUpdated: new Date().toISOString().split('T')[0],
            totalFoods: cleanedFoods.length,
            extractionMethod: "Multi-table parsing + deduplication + category correction",
            grupos: [
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
                { id: 11, nome: "Leguminosas", cor: "#059669" },
                { id: 12, nome: "Diversos", cor: "#6B7280" }
            ],
            categorias: Object.keys(finalStats).sort(),
            alimentos: cleanedFoods
        };
        
        // Salvar resultado
        console.log('\n💾 Salvando dados limpos...');
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2), 'utf8');
        
        console.log('\n' + '='.repeat(60));
        console.log('DADOS IBGE CORRIGIDOS COM SUCESSO!');
        console.log('='.repeat(60));
        console.log(`📁 Arquivo: ${OUTPUT_PATH}`);
        console.log(`📊 Total final: ${finalData.totalFoods} alimentos únicos`);
        console.log(`📂 Categorias: ${finalData.categorias.length}`);
        
        console.log('\n📈 Distribuição final por categoria:');
        Object.entries(finalStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([categoria, count]) => {
                const percentage = ((count / cleanedFoods.length) * 100).toFixed(1);
                console.log(`  📂 ${categoria}: ${count} alimentos (${percentage}%)`);
            });
        
    } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
        process.exit(1);
    }
}

// Executar
if (require.main === module) {
    main();
}

module.exports = {
    removeDuplicates,
    fixCategories,
    filterValidFoods
};