# 🔄 **GUIA PARA REVERTER MUDANÇAS DO BANCO NUTRICIONAL UNIFICADO**

## ⚠️ **INSTRUÇÕES DE REVERSÃO COMPLETA**

Este arquivo contém as instruções exatas para reverter todas as mudanças implementadas no sistema de banco de dados nutricional unificado (TACO + IBGE).

---

## 📁 **ARQUIVOS MODIFICADOS E COMO REVERTER:**

### 1. **ARQUIVOS NOVOS CRIADOS** (Para deletar)

```bash
# Deletar arquivos novos criados
rm "C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\sistema-nutricional\src\data\ibge-pof.json"
rm "C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\sistema-nutricional\src\hooks\useNutritionalDatabase.ts"
```

### 2. **ARQUIVOS MODIFICADOS** (Para restaurar do backup)

```bash
# Restaurar arquivos do backup
cp "backup-reversibilidade/components-backup/nutritionist/taco-search-advanced.tsx" "src/components/nutritionist/taco-search-advanced.tsx"
cp "backup-reversibilidade/components-backup/layouts/nutritionist-layout.tsx" "src/components/layouts/nutritionist-layout.tsx"
```

### 3. **PÁGINA PRINCIPAL DA TABELA TACO**

**Arquivo:** `src/app/nutritionist/tabela-taco/page.tsx`

**Reverter mudanças:**

```typescript
// REVERTER LINHA 29: De
import { useNutritionalDatabase, AlimentoUnificado } from '@/hooks/useNutritionalDatabase'

// PARA:
import { useTaco, Alimento } from '@/hooks/useTaco'

// REVERTER LINHA 34: De  
const [selectedFood, setSelectedFood] = useState<AlimentoUnificado | null>(null)

// PARA:
const [selectedFood, setSelectedFood] = useState<Alimento | null>(null)

// REVERTER LINHA 37-44: De
const { 
  favorites, 
  toggleFavorite, 
  getNutrientAnalysis,
  categories,
  favoritesFoods,
  foods,
  databaseStats
} = useNutritionalDatabase()

// PARA:
const { 
  favorites, 
  toggleFavorite, 
  getNutrientAnalysis,
  categories,
  favoritesFoods,
  foods
} = useTaco()

// REVERTER LINHA 69: De
<h1 className="text-3xl font-bold text-foreground">Tabela Nutricional</h1>

// PARA:
<h1 className="text-3xl font-bold text-foreground">Tabela TACO</h1>

// REVERTER LINHA 70-72: De
<p className="text-muted-foreground mt-2">
  Banco de Dados Nutricional Unificado - TACO + IBGE - Consulte informações nutricionais completas
</p>

// PARA:
<p className="text-muted-foreground mt-2">
  Tabela Brasileira de Composição de Alimentos - Consulte informações nutricionais completas
</p>

// REVERTER BADGES (Linhas 75-87): De
<Badge variant="secondary" className="flex items-center space-x-1">
  <Sparkles className="h-3 w-3" />
  <span>{databaseStats.total} alimentos</span>
</Badge>
<Badge variant="outline" className="flex items-center space-x-1">
  📊
  <span>{databaseStats.taco} TACO</span>
</Badge>
<Badge variant="outline" className="flex items-center space-x-1">
  🏛️
  <span>{databaseStats.ibge} IBGE</span>
</Badge>

// PARA:
<Badge variant="secondary" className="flex items-center space-x-1">
  <Sparkles className="h-3 w-3" />
  <span>{foods.length} alimentos</span>
</Badge>
```

---

## 🔧 **COMANDO DE REVERSÃO RÁPIDA:**

### **Opção 1: Restaurar do Backup Completo**

```bash
# Navegar para o diretório do projeto
cd "C:\Users\andre\OneDrive\Área de Trabalho\Sistema Nutricional\sistema-nutricional"

# Deletar arquivos novos
rm src/data/ibge-pof.json
rm src/hooks/useNutritionalDatabase.ts

# Restaurar do backup
cp -r backup-reversibilidade/data-backup/* src/data/
cp -r backup-reversibilidade/hooks-backup/* src/hooks/
cp -r backup-reversibilidade/components-backup/* src/components/

# Reverter título do sidebar manualmente (ver item 3 acima)
```

### **Opção 2: Desfazer Commit Git (se commitado)**

```bash
# Se as mudanças foram commitadas no git
git log --oneline  # encontrar o hash do commit antes das mudanças
git reset --hard HASH_DO_COMMIT_ANTERIOR
```

---

## ✅ **VERIFICAÇÃO PÓS-REVERSÃO:**

Após reverter, verificar se:

1. ✅ Página carrega sem erros: http://localhost:3002/nutritionist/tabela-taco
2. ✅ Sidebar mostra "Tabela TACO" (não "Tabela Nutricional")
3. ✅ Busca funciona normalmente sem filtro de fonte
4. ✅ Cards de alimentos NÃO mostram badge de fonte
5. ✅ Apenas dados TACO são exibidos
6. ✅ Console do navegador sem erros JavaScript

---

## 📊 **ESTADO APÓS REVERSÃO:**

- **Banco de dados:** Apenas TACO (597 alimentos)
- **Interface:** Tabela TACO original
- **Funcionalidade:** Sistema funciona exatamente como antes
- **Arquivos:** Apenas arquivos originais

---

## ⚠️ **IMPORTANTE:**

- Fazer backup antes de reverter caso queira voltar às mudanças
- Testar todas as funcionalidades após reversão
- Deletar este arquivo de documentação se não precisar mais

## 🎯 **RESULTADO FINAL DA REVERSÃO:**

Sistema voltará ao estado original com:
- ✅ Apenas tabela TACO
- ✅ Interface original
- ✅ Sem filtros por fonte  
- ✅ Sem badges TACO/IBGE
- ✅ Funcionalidade 100% original