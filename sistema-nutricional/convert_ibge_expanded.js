const fs = require('fs');
const path = require('path');

console.log('🔄 Convertendo dados IBGE expandidos com micronutrientes...');

// Lê o arquivo com dados IBGE expandidos
const ibgeExpandedPath = path.join(__dirname, '..', 'ibge_completo_expandido.json');
const ibgeExpandedData = JSON.parse(fs.readFileSync(ibgeExpandedPath, 'utf8'));

// Lê o arquivo atual do sistema
const currentIbgePath = path.join(__dirname, 'src', 'data', 'ibge-pof.json');
const currentIbgeData = JSON.parse(fs.readFileSync(currentIbgePath, 'utf8'));

console.log(`📊 Dados atuais: ${currentIbgeData.alimentos.length} alimentos`);
console.log(`📈 Dados expandidos: ${ibgeExpandedData.foods.length} alimentos`);

// Função para mapear nome do grupo para ID
function getGroupIdFromName(groupName) {
  const groupMap = {
    "Açúcares e Produtos de Confeitaria": 10,
    "Cereais e Produtos de Cereais": 1,
    "Leguminosas": 1,
    "Carnes e Produtos Cárneos": 6,
    "Peixes e Frutos do Mar": 5,
    "Leite e Produtos Lácteos": 7,
    "Ovos e Derivados": 9,
    "Frutas e Produtos de Frutas": 3,
    "Hortaliças": 2,
    "Óleos e Gorduras": 4,
    "Oleaginosas": 10,
    "Bebidas": 8
  };
  
  return groupMap[groupName] || 1;
}

// Converter dados do formato expandido para o formato do sistema
const convertedFoods = ibgeExpandedData.foods.map((food, index) => {
  const id = 7000 + index + 1; // IDs começando em 7001 para evitar conflitos
  
  return {
    id: id,
    codigo: `IBGE${String(id).padStart(4, '0')}`,
    fonte: "IBGE",
    nome: food.name,
    nomeIngles: food.name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, ''),
    categoria: food.group,
    grupoId: getGroupIdFromName(food.group),
    
    // Dados básicos
    umidade_g: 0, // Dados não disponíveis na fonte
    
    // Energia
    energia_kcal: food.macronutrients.energy_kcal || 0,
    energia_kj: food.macronutrients.energy_kj || Math.round((food.macronutrients.energy_kcal || 0) * 4.184),
    
    // Macronutrientes
    proteina_g: food.macronutrients.protein_g || 0,
    lipidios_g: food.macronutrients.lipids_g || 0,
    carboidrato_g: food.macronutrients.carbohydrates_g || 0,
    carboidrato_disponivel_g: food.macronutrients.carbohydrates_g || 0,
    fibra_alimentar_g: food.macronutrients.dietary_fiber_g || 0,
    fibra_solavel_g: 0, // Dados não disponíveis
    fibra_insolavel_g: 0, // Dados não disponíveis
    cinzas_g: 0, // Dados não disponíveis
    
    // Minerais (mg) - AGORA COM DADOS REAIS!
    calcio_mg: food.minerals.calcium_mg || 0,
    magnesio_mg: food.minerals.magnesium_mg || 0,
    manganes_mg: food.minerals.manganese_mg || 0,
    fosforo_mg: food.minerals.phosphorus_mg || 0,
    ferro_mg: food.minerals.iron_mg || 0,
    sodio_mg: food.minerals.sodium_mg || 0,
    potassio_mg: food.minerals.potassium_mg || 0,
    cobre_mg: food.minerals.copper_mg || 0,
    zinco_mg: food.minerals.zinc_mg || 0,
    
    // Vitaminas - AGORA COM DADOS REAIS!
    retinol_mcg: food.vitamins.retinol_mcg || 0,
    re_mcg: food.vitamins.vitamin_a_rae_mcg || 0,
    rae_mcg: food.vitamins.vitamin_a_rae_mcg || 0,
    tiamina_mg: food.vitamins.thiamine_mg || 0,
    riboflavina_mg: food.vitamins.riboflavin_mg || 0,
    piridoxina_mg: food.vitamins.pyridoxine_mg || 0,
    niacina_mg: food.vitamins.niacin_mg || 0,
    vitamina_c_mg: food.vitamins.vitamin_c_mg || 0,
    folato_mcg: food.vitamins.folate_mcg || 0,
    vitamina_b12_mcg: food.vitamins.vitamin_b12_mcg || 0,
    vitamina_d_mcg: food.vitamins.vitamin_d_mcg || 0,
    vitamina_e_mg: food.vitamins.vitamin_e_mg || 0,
    acido_folico_mcg: food.vitamins.folate_mcg || 0,
    
    // Lipídios detalhados
    lipidios_saturados_g: food.lipids_detailed.saturated_fats_g || 0,
    lipidios_monoinsaturados_g: food.lipids_detailed.monounsaturated_fats_g || 0,
    lipidios_poliinsaturados_g: food.lipids_detailed.polyunsaturated_fats_g || 0,
    colesterol_mg: food.lipids_detailed.cholesterol_mg || 0,
    acidos_graxos_trans_g: food.lipids_detailed.trans_fats_g || 0,
    
    // Tags melhoradas
    tags: [
      food.group.toLowerCase().replace(/\s+/g, '_'),
      "ibge",
      "pof_2008_2009",
      "micronutrientes_completos",
      "minerais",
      "vitaminas"
    ]
  };
});

// Atualizar categorias
const newCategories = [...new Set(convertedFoods.map(food => food.categoria))];
const allCategories = [...new Set([...currentIbgeData.categorias || [], ...newCategories])];

// Criar dados atualizados
const updatedData = {
  ...currentIbgeData,
  totalFoods: convertedFoods.length,
  lastUpdated: new Date().toISOString().split('T')[0],
  version: "2.0-expandido",
  micronutrientes: true,
  categorias: allCategories.sort(),
  alimentos: convertedFoods,
  metadata: {
    fonte: "IBGE - Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil",
    descricao: "Base expandida com dados completos de macronutrientes e micronutrientes",
    versao: "POF 2008-2009 - Expandida",
    micronutrientes_incluidos: [
      "Minerais: cálcio, magnésio, ferro, zinco, sódio, potássio",
      "Vitaminas: tiamina, riboflavina, niacina, vitamina C",
      "Macronutrientes: energia, proteínas, lipídios, carboidratos, fibras"
    ],
    melhorias: [
      "Dados reais de minerais e vitaminas",
      "Base expandida de 21 para 50 alimentos",
      "Mapeamento completo de nutrientes",
      "Tags aprimoradas para busca"
    ]
  }
};

// Salvar arquivo atualizado
fs.writeFileSync(currentIbgePath, JSON.stringify(updatedData, null, 2), 'utf8');

console.log('✅ Conversão expandida concluída!');
console.log(`📊 Total de alimentos IBGE: ${convertedFoods.length}`);
console.log(`📁 Categorias: ${allCategories.length}`);
console.log(`💾 Arquivo atualizado: ${currentIbgePath}`);

// Mostrar estatísticas detalhadas
const groupStats = {};
const mineralStats = {};
const vitaminStats = {};

convertedFoods.forEach(food => {
  // Estatísticas por grupo
  groupStats[food.categoria] = (groupStats[food.categoria] || 0) + 1;
  
  // Estatísticas de minerais (alimentos com dados > 0)
  if (food.calcio_mg > 0) mineralStats.calcio = (mineralStats.calcio || 0) + 1;
  if (food.ferro_mg > 0) mineralStats.ferro = (mineralStats.ferro || 0) + 1;
  if (food.zinco_mg > 0) mineralStats.zinco = (mineralStats.zinco || 0) + 1;
  if (food.sodio_mg > 0) mineralStats.sodio = (mineralStats.sodio || 0) + 1;
  
  // Estatísticas de vitaminas (alimentos com dados > 0)
  if (food.vitamina_c_mg > 0) vitaminStats.vitamina_c = (vitaminStats.vitamina_c || 0) + 1;
  if (food.tiamina_mg > 0) vitaminStats.tiamina = (vitaminStats.tiamina || 0) + 1;
  if (food.riboflavina_mg > 0) vitaminStats.riboflavina = (vitaminStats.riboflavina || 0) + 1;
  if (food.niacina_mg > 0) vitaminStats.niacina = (vitaminStats.niacina || 0) + 1;
});

console.log('\n📈 Distribuição por categoria:');
Object.entries(groupStats).forEach(([group, count]) => {
  console.log(`  ${group}: ${count} alimentos`);
});

console.log('\n⚡ Minerais com dados (alimentos):');
Object.entries(mineralStats).forEach(([mineral, count]) => {
  console.log(`  ${mineral}: ${count} alimentos com dados`);
});

console.log('\n🧪 Vitaminas com dados (alimentos):');
Object.entries(vitaminStats).forEach(([vitamin, count]) => {
  console.log(`  ${vitamin}: ${count} alimentos com dados`);
});

console.log(`\n🎉 Base IBGE expandida de ${currentIbgeData.alimentos ? currentIbgeData.alimentos.length : 0} para ${convertedFoods.length} alimentos!`);
console.log('🔬 Micronutrientes agora incluídos: minerais e vitaminas com dados reais!');
console.log('✨ Próximo passo: atualizar interface para exibir os novos dados nutricionais');