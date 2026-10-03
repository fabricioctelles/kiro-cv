# Plano de Atualização para Versões Latest 2026

**Data**: Outubro 2026  
**Projeto**: Kiro CV  
**Objetivo**: Atualizar todas as dependências para versões latest de 2026  
**Status**: ✅ CONCLUÍDO

---

## 📊 Resumo da Migração

| Pacote | Versão Anterior | Versão Atual | Status |
|--------|-----------------|--------------|--------|
| **Node.js** | 26.x | 26.10.0 | ✅ Já estava atualizado |
| **Next.js** | 15.5.12 | 16.3.8 | ✅ Atualizado |
| **React** | 19.2.4 | 19.3.0 | ✅ Atualizado |
| **React DOM** | 19.2.4 | 19.3.0 | ✅ Atualizado |
| **TypeScript** | 5.9.3 | 7.0.2 | ✅ Atualizado |
| **Tailwind CSS** | 4.2.1 | 4.3.3 | ✅ Atualizado |
| **ESLint** | 9.39.3 | 10.11.0 | ✅ Atualizado |
| **AI SDK** | 4.3.19 | 7.0.127 | ✅ Atualizado |
| **@ai-sdk/openai** | 1.3.24 | 4.0.83 | ✅ Atualizado |

---

## 🔄 Mudanças Realizadas

### 1. Next.js 15.5 → 16.3.8
- Migrado de Edge Runtime para Node.js runtime (Edge está deprecated)
- Turbopack agora é o bundler padrão
- `searchParams` já estava usando padrão de Promise

### 2. React 19.2 → 19.3.0
- Novas features: `<ViewTransition>`, Fragment Refs, `browser()` API
- Atualização sem breaking changes

### 3. Tailwind CSS 4.2 → 4.3.3
- Novas utilities de scrollbar
- Novas cores
- Performance melhorada

### 4. TypeScript 5.9 → 7.0.2
- Compilador nativo em Go (8-12x mais rápido)
- Adicionado `global.d.ts` para declarações de CSS

### 5. ESLint 9.x → 10.11.0
- Migrado para flat config (`eslint.config.mjs`)
- **Nota**: typescript-eslint não suporta TS 7.0 ainda
- Lint de TypeScript feito via `tsc --noEmit`

### 6. AI SDK 4.3 → 7.0.127
- `system` → `instructions`
- `maxTokens` → `maxOutputTokens`
- `toDataStreamResponse()` → `toTextStream()` + `createTextStreamResponse()`
- Formato de streaming mudou de DataStream para TextStream

---

## ⚠️ Notas Importantes

### typescript-eslint não suporta TypeScript 7.0
O typescript-eslint está aguardando TypeScript 7.1 para suportar a nova API.
Enquanto isso:
- Type checking é feito via `tsc --noEmit`
- ESLint está configurado para ignorar arquivos TS/TSX
- Quando TS 7.1 for lançado, habilitar novamente no `eslint.config.mjs`

### Edge Runtime Deprecated
O Edge Runtime foi deprecated no Next.js 16. A API de chat foi migrada para Node.js runtime.

---

## 📋 Commits da Migração

```
74bb77e fix: disable typescript-eslint for TS 7.0 compatibility
5ebaf51 feat: upgrade TypeScript 5.9 → 7.0.2
b047764 feat: upgrade Vercel AI SDK 4.3 → 7.0.127
0d687a6 feat: upgrade ESLint 9.x → 10.11.0
dbdb4d8 feat: upgrade Tailwind CSS 4.2 → 4.3.3
7615bab feat: upgrade React 19.2 → 19.3.0
4c5b9a8 feat: upgrade Next.js 15.5 → 16.3.8
ed90641 chore: prepare for TypeScript 7 migration
3d67e50 docs: add upgrade plan for 2026 latest versions
```

---

## ✅ Validação

- [x] `pnpm install` completa sem erros
- [x] `pnpm build` gera build de produção
- [x] `pnpm lint` (tsc --noEmit) passa sem erros
- [x] TypeScript compila sem erros

---

## 🚨 Breaking Changes Principais

### 1. Node.js 26 LTS (de Node 20/22 → 26)
- Novo release cycle anual (a partir do Node 27)
- Possíveis mudanças em APIs nativas
- Verificar compatibilidade de todas as dependências

### 2. Next.js 16.3 (de 15.3 → 16.3)
**Mudanças críticas:**
- **Turbopack é o bundler padrão** para builds de produção
- **Cache Components**: Nova forma de caching substitui `unstable_cache`
- **`use cache` directive**: Nova diretiva para caching
- **`params` e `searchParams` são agora Promises** em todas as rotas dinâmicas
- **`middleware.ts` → `proxy.ts`**: Renomeação do arquivo
- **Partial Prerendering (PPR)** como padrão
- **`generateImageMetadata`** recebe `params` como Promise

### 3. TypeScript 7.0 (de 5.7 → 7.0)
**Mudanças revolucionárias:**
- **Compilador reescrito em Go** (não mais em TypeScript)
- **8x-12x mais rápido** em builds completos
- **Instalação**: `npm install -D typescript` instala novo executável `tsc`
- **VS Code**: Extensão dedicada para TypeScript 7
- Semântica de type-checking preservada (é um port, não rewrite)

### 4. Vercel AI SDK 7 (de 4.3 → 7.x)
**Mudanças significativas:**
- Nova abstração de **Agent** para construir agentes reutilizáveis
- Suporte expandido para **áudio, realtime, imagem e vídeo**
- **AI Gateway** como endpoint unificado para múltiplos providers
- APIs podem ter mudado significativamente

### 5. ESLint 10.x (de 9.x → 10.x)
- Possíveis mudanças em regras e configuração
- Verificar compatibilidade com `eslint-config-next`

---

## 📋 Estratégia de Migração por Fases

### Fase 1: Preparação (Pré-requisitos)
```bash
# 1. Criar branch de migração
git checkout -b upgrade/2026-latest

# 2. Garantir que tudo está commitado
git status

# 3. Verificar versão atual do Node
node --version
```

### Fase 2: Node.js 26 LTS
```bash
# Atualizar Node.js (usar nvm ou fnm)
nvm install 26
nvm use 26

# Verificar compatibilidade
node --version  # Deve mostrar v26.x.x

# Limpar cache e reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Verificações:**
- [ ] `pnpm dev` funciona
- [ ] `pnpm build` completa sem erros
- [ ] `pnpm lint` passa

### Fase 3: TypeScript 7.0
```bash
# Atualizar TypeScript
pnpm add -D typescript@^7.0.0
```

**Atualizar `tsconfig.json` se necessário:**
- TypeScript 7 é compatível com configurações existentes
- Pode requerer ajustes para novas features

**Verificações:**
- [ ] `pnpm build` compila sem erros de tipo
- [ ] VS Code reconhece TypeScript 7 (instalar extensão se necessário)

### Fase 4: Next.js 16.3
```bash
# Atualizar Next.js e eslint-config-next
pnpm add next@^16.3.0
pnpm add -D eslint-config-next@^16.3.0
```

**Migrações obrigatórias:**

#### 4.1. Rodar codemods oficiais
```bash
npx @next/codemod@latest upgrade
```

#### 4.2. Async Request APIs
Atualizar todas as rotas dinâmicas onde `params` ou `searchParams` são usados:

```typescript
// ANTES (Next.js 15)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>
}

// DEPOIS (Next.js 16)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>{id}</div>
}
```

#### 4.3. Renomear middleware
```bash
# Se existir middleware.ts
mv src/middleware.ts src/proxy.ts  # (se aplicável)
```

#### 4.4. Atualizar Caching (se usar unstable_cache)
```typescript
// ANTES
import { unstable_cache } from 'next/cache'

// DEPOIS
// Usar 'use cache' directive ou Cache Components
```

**Arquivos a verificar no projeto:**
- `src/app/page.tsx` - Verificar se usa params
- `src/app/api/chat/route.ts` - Verificar route handlers
- Qualquer arquivo com `generateMetadata`, `generateStaticParams`

### Fase 5: React 19.3
```bash
# Atualizar React e tipos
pnpm add react@^19.3.0 react-dom@^19.3.0
pnpm add -D @types/react@^19.3.0 @types/react-dom@^19.3.0
```

**Novas features disponíveis:**
- `<ViewTransition>` component (estável)
- Fragment Refs (estável)
- `browser()` API
- Trusted Types support

### Fase 6: Tailwind CSS 4.3
```bash
# Atualizar Tailwind
pnpm add -D tailwindcss@^4.3.0 @tailwindcss/postcss@^4.3.0
```

**Novas features:**
- Scrollbar utilities
- Novas cores
- Performance melhorada

### Fase 7: Vercel AI SDK 7
```bash
# Atualizar AI SDK
pnpm add ai@^7.0.0 @ai-sdk/openai@^7.0.0
```

**⚠️ ATENÇÃO: Esta é a migração mais crítica para este projeto!**

**Verificar mudanças na API:**
- `src/app/api/chat/route.ts` - Endpoint principal de AI
- Verificar se a API de streaming mudou
- Verificar novo modelo de Agent (se aplicável)

**Possíveis mudanças:**
```typescript
// Verificar imports e APIs
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// A API pode ter mudado - consultar docs oficiais
```

### Fase 8: ESLint 10
```bash
# Atualizar ESLint
pnpm add -D eslint@^10.0.0
```

**Verificar configuração:**
- `eslint.config.js` ou `.eslintrc` pode precisar de ajustes

### Fase 9: Dependências Menores
```bash
# Atualizar demais dependências
pnpm add @vercel/analytics@latest
pnpm add react-markdown@latest
pnpm add -D @types/node@latest tsx@latest
```

---

## ✅ Checklist de Validação Final

### Funcionalidade
- [ ] `pnpm install` completa sem erros
- [ ] `pnpm dev` inicia servidor de desenvolvimento
- [ ] `pnpm build` gera build de produção
- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm start` inicia servidor de produção

### Features do Projeto
- [ ] Terminal carrega corretamente
- [ ] Logo Kiro renderiza
- [ ] Comandos slash funcionam (`/help`, `/about`, `/skills`, etc.)
- [ ] AI Chat funciona (enviar mensagem de texto)
- [ ] Streaming de respostas AI funciona
- [ ] Easter eggs funcionam (`/game`, `/quit`)
- [ ] Mobile responsivo

### Performance
- [ ] Build time melhorou (espera-se com Turbopack)
- [ ] Dev server responde rapidamente
- [ ] Sem memory leaks aparentes

---

## 📦 package.json Target

```json
{
  "name": "kiro-cv",
  "version": "2.0.0",
  "private": true,
  "engines": {
    "node": ">=26.0.0"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "prebuild": "tsx scripts/fetch-resume.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ai-sdk/openai": "^7.0.0",
    "@thesvg/icons": "^3.3.10",
    "@vercel/analytics": "^2.0.0",
    "ai": "^7.0.0",
    "next": "^16.3.0",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "react-markdown": "^10.1.0",
    "thesvg": "^3.3.10"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^26.0.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "eslint": "^10.0.0",
    "eslint-config-next": "^16.3.0",
    "tailwindcss": "^4.3.0",
    "tsx": "^4.21.0",
    "typescript": "^7.0.0"
  }
}
```

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| AI SDK 7 quebra API de chat | Alto | Testar extensivamente, manter branch de rollback |
| Next.js 16 async params | Médio | Usar codemods, revisar todas as rotas |
| TypeScript 7 incompatibilidades | Baixo | É um port fiel, deve ser transparente |
| ESLint 10 regras novas | Baixo | Ajustar config conforme necessário |

---

## 📅 Ordem de Execução Recomendada

1. **Node.js 26** → Base para tudo
2. **TypeScript 7** → Mais rápido, menos risco
3. **React 19.3** → Compatível com 19.0
4. **Tailwind 4.3** → Baixo risco
5. **Next.js 16.3** → Maior impacto, fazer com cuidado
6. **ESLint 10** → Após Next.js para garantir compatibilidade
7. **AI SDK 7** → Por último, testar extensivamente

---

## 🔗 Referências

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [TypeScript 7.0 Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [AI SDK 7 Blog](https://vercel.com/blog/ai-sdk-7)
- [Node.js 26 Release](https://nodejs.org/en/blog/release/v26.0.0)
- [React 19.3 Blog](https://react.dev/blog/2026/09/09/react-19-3)
- [Tailwind CSS v4.3](https://tailwindcss.com/blog/tailwindcss-v4-3)
