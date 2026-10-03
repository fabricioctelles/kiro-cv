# Novas Features do AI SDK 7 para Kiro CV

**Versão atual**: ai@7.0.127  
**Documentação**: https://vercel.com/blog/ai-sdk-7

---

## 🎯 Features Aplicáveis ao Kiro CV

### 1. **Reasoning Control** ⭐ Recomendado
Controle o esforço de raciocínio do modelo com uma única opção.

```typescript
// Atual
const result = streamText({
  model: openai(model),
  instructions: SYSTEM_PROMPT,
  messages,
  maxOutputTokens: 300,
});

// Com reasoning
const result = streamText({
  model: openai(model),
  instructions: SYSTEM_PROMPT,
  messages,
  maxOutputTokens: 300,
  reasoning: 'low', // 'low' | 'medium' | 'high'
});
```

**Benefício**: Respostas mais rápidas com `reasoning: 'low'` para perguntas simples sobre o CV, ou mais elaboradas com `'high'` para perguntas complexas.

---

### 2. **Timeouts** ⭐ Recomendado
Configuração de timeouts para evitar travamentos.

```typescript
const result = streamText({
  model: openai(model),
  instructions: SYSTEM_PROMPT,
  messages,
  maxOutputTokens: 300,
  timeout: {
    totalMs: 30000,    // 30s total
    chunkMs: 5000,     // abort se não receber chunk em 5s
  },
});
```

**Benefício**: Melhor UX - se o modelo travar, o usuário recebe feedback em vez de esperar indefinidamente.

---

### 3. **Lifecycle Events / Callbacks** ⭐ Recomendado
Hooks para observar quando a geração começa e termina.

```typescript
const result = streamText({
  model: openai(model),
  instructions: SYSTEM_PROMPT,
  messages,
  maxOutputTokens: 300,
  onStart({ callId, modelId }) {
    console.log(`[${callId}] Started with ${modelId}`);
  },
  onEnd({ callId, usage, finishReason }) {
    console.log(`[${callId}] Finished: ${finishReason}, tokens: ${usage.totalTokens}`);
  },
});
```

**Benefício**: Logging estruturado para debug e monitoramento de custos.

---

### 4. **Performance Statistics** ⭐ Recomendado
Métricas de latência e throughput por requisição.

```typescript
const result = streamText({ ... });

// Após streaming completo
const { performance } = await result;
console.log({
  responseTimeMs: performance.responseTimeMs,
  outputTokensPerSecond: performance.outputTokensPerSecond,
  timeToFirstOutputMs: performance.timeToFirstOutputMs,
});
```

**Benefício**: Insights sobre performance do chat para otimização.

---

### 5. **Telemetry com OpenTelemetry**
Integração com observabilidade.

```typescript
// instrumentation.ts
import { registerTelemetry } from 'ai';
import { OpenTelemetry } from '@ai-sdk/otel';

registerTelemetry(new OpenTelemetry());
```

**Benefício**: Traces completos em ferramentas como Datadog, Langfuse, Sentry.

---

### 6. **Node.js Tracing Channel**
Alternativa leve ao OpenTelemetry.

```typescript
import { tracingChannel } from 'node:diagnostics_channel';
import { AI_SDK_TELEMETRY_TRACING_CHANNEL } from 'ai';

tracingChannel(AI_SDK_TELEMETRY_TRACING_CHANNEL).subscribe({
  start(message) {
    console.log('AI request started', message);
  },
  asyncEnd(message) {
    console.log('AI request completed', message);
  },
});
```

**Benefício**: Observabilidade sem dependências externas.

---

## 🔮 Features Avançadas (Não Aplicáveis Agora)

Estas features são poderosas mas não se aplicam ao caso de uso atual do Kiro CV:

| Feature | Por que não usar agora |
|---------|----------------------|
| **Tool Context** | Kiro CV não usa tools/functions |
| **Runtime Context** | Não há loops agentic complexos |
| **WorkflowAgent** | Não há workflows multi-step |
| **HarnessAgent** | Não é um coding agent |
| **MCP Apps** | Não há integração MCP |
| **Provider File Uploads** | Não há upload de arquivos |
| **Tool Approvals** | Não há tools |
| **Realtime Voice** | Chat é texto apenas |
| **Video Generation** | Fora do escopo |
| **TUI** | Já temos UI customizada |

---

## 📋 Implementação Sugerida

### Fase 1: Quick Wins (imediato)
```typescript
// src/app/api/chat/route.ts

const result = streamText({
  model: openai(model),
  instructions: SYSTEM_PROMPT,
  messages,
  maxOutputTokens: 300,
  
  // NEW: Timeout para evitar travamentos
  timeout: {
    totalMs: 30000,
    chunkMs: 5000,
  },
  
  // NEW: Logging estruturado
  onStart({ modelId }) {
    console.log(`[chat] Started with ${modelId}`);
  },
  onEnd({ usage, finishReason }) {
    console.log(`[chat] Finished: ${finishReason}, tokens: ${usage?.totalTokens}`);
  },
});
```

### Fase 2: Reasoning Dinâmico (opcional)
```typescript
// Detectar complexidade da pergunta
function getReasoningLevel(messages: Message[]): 'low' | 'medium' | 'high' {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Perguntas curtas = low reasoning
  if (lastMessage.length < 50) return 'low';
  
  // Perguntas sobre experiência/skills = medium
  if (/experience|skill|project|work/i.test(lastMessage)) return 'medium';
  
  // Perguntas complexas = high
  return 'high';
}

const result = streamText({
  ...config,
  reasoning: getReasoningLevel(messages),
});
```

### Fase 3: Telemetry (produção)
```typescript
// src/instrumentation.ts (Next.js instrumentation file)
import { registerTelemetry } from 'ai';
import { OpenTelemetry } from '@ai-sdk/otel';

export function register() {
  if (process.env.NODE_ENV === 'production') {
    registerTelemetry(new OpenTelemetry());
  }
}
```

---

## 🔧 Dependências Adicionais

Para telemetry completo:
```bash
pnpm add @ai-sdk/otel @opentelemetry/api @opentelemetry/sdk-node
```

---

## ⚠️ Breaking Changes Já Aplicados

Na migração de AI SDK 4.x → 7.x, já fizemos:

| Mudança | Status |
|---------|--------|
| `system` → `instructions` | ✅ Aplicado |
| `maxTokens` → `maxOutputTokens` | ✅ Aplicado |
| `toDataStreamResponse()` → `toTextStream() + createTextStreamResponse()` | ✅ Aplicado |
| DataStream format → TextStream format | ✅ Aplicado |
| Terminal.tsx stream reader | ✅ Ajustado |

---

## 📊 Estimativa de Impacto

| Feature | Esforço | Impacto UX | Prioridade |
|---------|---------|------------|------------|
| Timeouts | 5 min | Alto | 🔴 Alta |
| Lifecycle callbacks | 10 min | Médio (debug) | 🟡 Média |
| Performance stats | 15 min | Baixo | 🟢 Baixa |
| Reasoning control | 20 min | Médio | 🟡 Média |
| Telemetry | 30 min | Alto (prod) | 🟡 Média |
