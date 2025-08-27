const fs = require('fs');
const path = require('path');

// Lê o arquivo com dados IBGE expandidos
const ibgeExtendedPath = path.join(__dirname, '..', 'alimentos_ibge.json');
const ibgeExtendedData = JSON.parse(fs.readFileSync(ibgeExtendedPath, 'utf8'));

// Lê o arquivo atual do sistema
const currentIbgePath = path.join(__dirname, 'src', 'data', 'ibge-pof.json');
const currentIbgeData = JSON.parse(fs.readFileSync(currentIbgePath, 'utf8'));

console.log('🔄 Convertendo dados IBGE...');
console.log(`📊 Dados atuais: ${currentIbgeData.alimentos.length} alimentos`);
console.log(`📈 Dados expandidos: ${ibgeExtendedData.foods.length} alimentos`);

// Converter dados do formato expandido para o formato do sistema
const convertedFoods = ibgeExtendedData.foods.map((food, index) => {
  const id = 7000 + index + 1; // IDs começando em 7001 para evitar conflitos
  
  return {
    id: id,
    codigo: `IBGE${String(id).padStart(3, '0')}`,
    fonte: "IBGE",
    nome: food.name,
    nomeIngles: food.name.toLowerCase().replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c'),
    categoria: food.group,
    grupoId: getGroupIdFromName(food.group),
    umidade_g: 0, // Dados não disponíveis, usar 0 como padrão
    energia_kcal: food.macronutrients.energy_kcal || 0,
    energia_kj: Math.round((food.macronutrients.energy_kcal || 0) * 4.184), // Conversão kcal para kJ
    proteina_g: food.macronutrients.protein_g || 0,
    lipidios_g: food.macronutrients.lipids_g || 0,
    carboidrato_g: food.macronutrients.carbohydrates_g || 0,
    carboidrato_disponivel_g: food.macronutrients.carbohydrates_g || 0,
    fibra_alimentar_g: food.macronutrients.dietary_fiber_g || 0,
    fibra_solavel_g: 0,
    fibra_insolavel_g: 0,
    cinzas_g: 0,
    calcio_mg: 0,
    magnesio_mg: 0,
    manganes_mg: 0,
    fosforo_mg: 0,
    ferro_mg: 0,
    sodio_mg: 0,
    potassio_mg: 0,
    cobre_mg: 0,
    zinco_mg: 0,
    retinol_mcg: 0,
    re_mcg: 0,
    rae_mcg: 0,
    tiamina_mg: 0,
    riboflavina_mg: 0,
    piridoxina_mg: 0,
    niacina_mg: 0,
    vitamina_c_mg: 0,
    folato_mcg: 0,
    vitamina_b12_mcg: 0,
    vitamina_d_mcg: 0,
    vitamina_e_mg: 0,
    lipidios_saturados_g: 0,
    lipidios_monoinsaturados_g: 0,
    lipidios_poliinsaturados_g: 0,
    colesterol_mg: 0,
    acidos_graxos_trans_g: 0,
    acido_folico_mcg: 0,
    tags: [
      food.group.toLowerCase().replace(/\s+/g, '_'),
      "ibge",
      "pof_2008_2009"
    ]
  };
});

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

// Atualizar categorias
const newCategories = [...new Set(convertedFoods.map(food => food.categoria))];
const allCategories = [...new Set([...currentIbgeData.categorias, ...newCategories])];

// Criar dados atualizados
const updatedData = {
  ...currentIbgeData,
  totalFoods: convertedFoods.length,
  lastUpdated: new Date().toISOString().split('T')[0],
  categorias: allCategories.sort(),
  alimentos: convertedFoods
};

// Salvar arquivo atualizado
fs.writeFileSync(currentIbgePath, JSON.stringify(updatedData, null, 2), 'utf8');

console.log('✅ Conversão concluída!');
console.log(`📊 Total de alimentos IBGE: ${convertedFoods.length}`);
console.log(`📁 Categorias: ${allCategories.length}`);
console.log(`💾 Arquivo atualizado: ${currentIbgePath}`);

// Mostrar estatísticas
const groupStats = {};
convertedFoods.forEach(food => {
  groupStats[food.categoria] = (groupStats[food.categoria] || 0) + 1;
});

console.log('\n📈 Distribuição por categoria:');
Object.entries(groupStats).forEach(([group, count]) => {
  console.log(`  ${group}: ${count} alimentos`);
});

console.log(`\n🎉 Base IBGE expandida de ${currentIbgeData.alimentos.length} para ${convertedFoods.length} alimentos!`);