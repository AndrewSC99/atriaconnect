# Implementação das Tabelas Nutricionais TACO e IBGE

## 📋 Resumo da Implementação

Sistema completo de consulta às tabelas nutricionais brasileiras (TACO e IBGE) integrado ao Sistema Nutricional, com interface diferenciada, APIs dedicadas e funcionalidades avançadas de busca e comparação.

## 🗂️ Estrutura Implementada

### 1. **Dados e Modelos**

#### Arquivos de Dados:
- `src/data/taco-expanded.json` - Tabela TACO (597 alimentos)
- `src/data/ibge-pof.json` - Tabela IBGE (25 alimentos amostra)

#### Interface Unificada:
```typescript
interface AlimentoUnificado {
  id: number
  codigo: string
  fonte: 'TACO' | 'IBGE'  // Diferenciação principal
  nome: string
  categoria: string
  energia_kcal: number
  proteina_g: number
  // ... outros nutrientes
}
```

### 2. **Interface do Usuário**

#### Sidebar Atualizado:
```typescript
// Novo submenu na navegação
{
  title: 'Tabela Nutricional',
  hasSubmenu: true,
  submenu: [
    {
      title: 'Tabela TACO',
      href: '/nutritionist/tabela-taco?source=taco',
      description: 'Tabela Brasileira de Composição de Alimentos (UNICAMP)'
    },
    {
      title: 'Tabela IBGE', 
      href: '/nutritionist/tabela-taco?source=ibge',
      description: 'Alimentos Consumidos no Brasil (POF 2008-2009)'
    }
  ]
}
```

#### Componente de Seleção de Fonte:
- **Localização**: `src/components/nutritionist/database-source-selector.tsx`
- **Funcionalidades**:
  - Seleção entre TACO, IBGE ou ambas
  - Informações detalhadas de cada base
  - Contadores de alimentos por fonte
  - Interface compacta e expandida

#### Interface Principal Atualizada:
- **Página**: `src/app/nutritionist/tabela-taco/page.tsx`
- **Melhorias**:
  - Seletor de fonte dinâmico
  - Títulos contextuais baseados na fonte
  - Badges diferenciados (📊 TACO, 🏛️ IBGE)
  - Filtragem automática por fonte

### 3. **Hook Personalizado**

#### `useNutritionalDatabase` Aprimorado:
```typescript
// Nova interface com opções
interface UseNutritionalDatabaseOptions {
  filterBySource?: 'taco' | 'ibge' | 'both'
  initialFavorites?: number[]
}

// Uso atualizado
const { foods, categories, databaseStats } = useNutritionalDatabase({
  filterBySource: 'taco' // Filtra apenas TACO
})
```

**Funcionalidades Adicionadas**:
- Filtragem por fonte de dados
- Combinação inteligente de categorias
- Estatísticas por base de dados
- Cache otimizado por fonte

### 4. **APIs RESTful**

#### Endpoint Principal: `/api/nutritional-tables`

**GET** - Listar alimentos com filtros
```typescript
// Parâmetros suportados:
interface QueryParams {
  source: 'taco' | 'ibge' | 'both'
  search?: string
  category?: string  
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Resposta estruturada:
interface NutritionalTableResponse {
  success: boolean
  data: {
    foods: AlimentoUnificado[]
    metadata: {
      source: string
      totalFoods: number
      version: string
      institution: string
    }
    pagination: {
      page: number
      totalPages: number
      hasMore: boolean
    }
  }
}
```

**POST** - Obter categorias por fonte
```typescript
// Request body:
{ source: 'taco' | 'ibge' | 'both' }

// Response:
{
  success: true,
  data: {
    categories: string[],
    count: number
  }
}
```

#### Endpoint de Detalhes: `/api/nutritional-tables/[id]`

**GET** - Detalhes completos do alimento
```typescript
interface FoodDetailResponse {
  data: {
    food: AlimentoUnificado
    source: 'TACO' | 'IBGE'
    relatedFoods: AlimentoUnificado[]     // 5 similares
    nutritionalAnalysis: {
      classification: {
        calories: 'baixa' | 'moderada' | 'alta'
        protein: 'baixo' | 'moderado' | 'alto'
        fiber: 'baixo' | 'moderado' | 'alto'
      }
      highlights: string[]  // "Rico em proteínas"
      warnings: string[]    // "Alto teor de sódio"
    }
  }
}
```

**POST** - Comparar dois alimentos
```typescript
// Request body:
{ compareWithId: number }

// Response inclui:
{
  food1: AlimentoUnificado,
  food2: AlimentoUnificado,
  differences: {
    energia_kcal: {
      food1: number,
      food2: number, 
      difference: number,
      percentageDiff: number
    }
    // ... outros nutrientes
  },
  summary: string[]  // Resumo textual das diferenças
}
```

## 🎯 Funcionalidades Implementadas

### ✅ **Diferenciação Visual**
- **Badges de Fonte**: 📊 para TACO, 🏛️ para IBGE
- **Cores Contextuais**: Azul para TACO, Verde para IBGE
- **Ícones Distintivos**: Diferentes por fonte
- **Contadores Separados**: Alimentos por base

### ✅ **Navegação Intuitiva**
- **Submenu no Sidebar**: Links diretos para cada tabela
- **Parâmetros de URL**: `?source=taco` ou `?source=ibge`
- **Seletor Rápido**: Alternância entre fontes
- **Estado Persistente**: Mantém seleção do usuário

### ✅ **Busca e Filtros Avançados**
- **Filtragem por Fonte**: Automática baseada na seleção
- **Busca Unificada**: Funciona em ambas as bases
- **Categorias Dinâmicas**: Ajustadas por fonte
- **Ordenação Flexível**: Por qualquer campo nutricional

### ✅ **Funcionalidades Nutricionais**
- **Análise Automática**: Classificação de alimentos
- **Comparações Inteligentes**: Entre alimentos de qualquer fonte
- **Alimentos Relacionados**: Sugestões por categoria
- **Cálculos de Porção**: Ajustes automáticos

## 🔧 Como Usar

### Para Desenvolvedores:

1. **Filtrar por Fonte Específica**:
```typescript
// Hook personalizado
const { foods } = useNutritionalDatabase({ 
  filterBySource: 'taco'
})

// API direta
const response = await fetch('/api/nutritional-tables?source=ibge&search=banana')
```

2. **Componente de Seleção**:
```jsx
<DatabaseSourceSelector 
  activeSource={source}
  onSourceChange={setSource}
  compact={true}
  showDetails={false}
/>
```

3. **Busca Avançada com Fonte**:
```jsx
<TacoSearchAdvanced 
  filterBySource="taco"
  onFoodSelect={handleFoodSelect}
  showPagination={true}
/>
```

### Para Usuários:

1. **Acesso via Sidebar**:
   - Clique em "Tabela Nutricional" 
   - Selecione "Tabela TACO" ou "Tabela IBGE"
   - Ou acesse "Tabela Nutricional" para ver ambas

2. **Alternância de Fontes**:
   - Use o seletor no topo da página
   - Botões: TACO, IBGE, ou Ambas
   - Interface se adapta automaticamente

3. **Identificação Visual**:
   - Badge azul 📊 = TACO (UNICAMP)
   - Badge verde 🏛️ = IBGE (Instituto)
   - Badge roxo 🔄 = Base Unificada

## 📊 Estatísticas

### Base de Dados TACO:
- **Alimentos**: 597
- **Instituição**: NEPA/UNICAMP
- **Versão**: 4ª Edição Ampliada e Revisada (2011)
- **Foco**: Alimentos mais consumidos no Brasil

### Base de Dados IBGE:
- **Alimentos**: 25 (amostra representativa)
- **Instituição**: Instituto Brasileiro de Geografia e Estatística
- **Versão**: POF 2008-2009
- **Foco**: Alimentos consumidos pela população brasileira

### Base Unificada:
- **Total**: 622 alimentos
- **Cobertura**: Máxima diversidade
- **Funcionalidade**: Busca e comparação cruzada

## 🚀 Melhorias Futuras

### 📈 **Expansão dos Dados IBGE**:
- [ ] Processamento do PDF completo (1.971 alimentos)
- [ ] Script automatizado de extração
- [ ] Validação e limpeza de dados
- [ ] Integração de micronutrientes completos

### 🎨 **Interface Avançada**:
- [ ] Comparação visual lado a lado
- [ ] Gráficos nutricionais interativos
- [ ] Exportação personalizada por fonte
- [ ] Dashboard de estatísticas por base

### 🔍 **Funcionalidades Analíticas**:
- [ ] Análise nutricional comparativa
- [ ] Recomendações baseadas na fonte
- [ ] Histórico de consultas por tabela
- [ ] Favoritos separados por base

### 🛠️ **Otimizações Técnicas**:
- [ ] Cache Redis para consultas frequentes
- [ ] Indexação Elasticsearch para busca rápida
- [ ] CDN para servir dados estáticos
- [ ] Monitoramento de performance por fonte

## 📝 Notas Importantes

1. **Compatibilidade**: Sistema mantém total compatibilidade com código existente
2. **Performance**: Filtragem por fonte melhora velocidade de consulta
3. **Escalabilidade**: Arquitetura preparada para mais bases de dados
4. **Usabilidade**: Interface intuitiva para alternância entre fontes
5. **Dados**: IBGE atual é amostra; expansão futura disponível

---

**Status**: ✅ **Implementação Completa e Funcional**
**Próximos Passos**: Testes de integração e expansão da base IBGE