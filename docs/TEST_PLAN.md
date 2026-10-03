# Plano de Testes E2E - Kiro CV

**Objetivo**: Validar todas as funcionalidades após migração para versões 2026  
**Ferramenta**: Playwright (headless e headed)  
**Ambiente**: localhost:3000

---

## 📋 Categorias de Teste

### 1. Testes de Inicialização
- [ ] Página carrega sem erros no console
- [ ] Logo Kiro renderiza corretamente
- [ ] Welcome screen aparece
- [ ] Status line mostra modelo padrão
- [ ] Trust notice aparece
- [ ] Input box está focado e pronto para digitação

### 2. Testes de Comandos de Conteúdo (Portfolio)
| Comando | Aliases | Validação |
|---------|---------|-----------|
| `/help` | `/h`, `/?` | Lista de comandos aparece |
| `/about` | `/summary`, `/whoami` | Informações pessoais |
| `/experience` | `/work`, `/exp` | Timeline de trabalho |
| `/skills` | `/tech`, `/stack` | Skills técnicos |
| `/education` | `/edu` | Educação |
| `/certs` | `/certifications` | Certificações |
| `/contact` | `/links`, `/socials` | Links de contato |
| `/projects` | `/proj` | Projetos |
| `/publications` | `/pubs`, `/articles` | Publicações |
| `/languages` | `/lang` | Idiomas |
| `/resume` | `/pdf`, `/download` | Download PDF |

### 3. Testes de Comandos de Sistema
| Comando | Validação |
|---------|-----------|
| `/clear` | Terminal limpa, histórico preservado |
| `/quit` | Login screen aparece (se configurado) |
| `/model` | Seletor de modelos aparece |
| `/version` | Versão aparece |
| `/status` | Status do sistema |
| `/doctor` | Diagnósticos |
| `/usage` | Estatísticas de uso |
| `/cost` | Análise de custos (humor) |
| `/init` | Gerador KIRO.md |

### 4. Testes de Easter Eggs
| Comando | Validação |
|---------|-----------|
| `/game` | Jogo Kiro Runner inicia |
| `/play` | Alias para /game |
| `/kiro-runner` | Alias para /game |

### 5. Testes de AI Chat
- [ ] Mensagem simples recebe resposta
- [ ] Streaming funciona (texto aparece gradualmente)
- [ ] Resposta é relevante ao contexto do CV
- [ ] Rate limiting funciona (após múltiplas requisições)
- [ ] Cancelamento de requisição funciona (Ctrl+C ou Esc)

### 6. Testes de Input/UX
- [ ] Autocomplete aparece ao digitar "/"
- [ ] Setas navegam no autocomplete
- [ ] Enter seleciona comando do autocomplete
- [ ] Escape fecha autocomplete
- [ ] Histórico de comandos (seta para cima)
- [ ] Tab completa comando parcial

### 7. Testes de Console (Erros)
- [ ] Sem erros JavaScript no console
- [ ] Sem warnings críticos
- [ ] Sem falhas de rede (exceto rate limit intencional)
- [ ] Sem erros de hidratação React

### 8. Testes de Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🛠️ Estrutura de Testes Playwright

```
tests/
├── e2e/
│   ├── startup.spec.ts      # Inicialização
│   ├── commands.spec.ts     # Todos os comandos
│   ├── ai-chat.spec.ts      # Interação com LLM
│   ├── ux.spec.ts           # Input/autocomplete
│   ├── easter-eggs.spec.ts  # Game e easter eggs
│   └── responsive.spec.ts   # Responsividade
├── fixtures/
│   └── test-utils.ts        # Helpers
└── playwright.config.ts
```

---

## 🔍 Validações de Console

```typescript
// Capturar todos os logs do console
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

// Capturar erros de página
page.on('pageerror', error => {
  pageErrors.push(error.message);
});

// Validar ao final
expect(errors).toHaveLength(0);
expect(pageErrors).toHaveLength(0);
```

---

## 📊 Matriz de Cobertura

| Área | Testes | Prioridade |
|------|--------|------------|
| Inicialização | 6 | Alta |
| Comandos Conteúdo | 11 | Alta |
| Comandos Sistema | 9 | Média |
| AI Chat | 5 | Alta |
| Easter Eggs | 3 | Baixa |
| UX/Input | 6 | Média |
| Console | 4 | Alta |
| Responsividade | 3 | Média |
| **Total** | **47** | - |

---

## 🚀 Execução

```bash
# Instalar Playwright
pnpm add -D @playwright/test

# Instalar browsers
pnpm exec playwright install

# Rodar testes headless
pnpm test:e2e

# Rodar testes headed (visual)
pnpm test:e2e:headed

# Rodar teste específico
pnpm exec playwright test commands.spec.ts

# Debug mode
pnpm exec playwright test --debug
```
