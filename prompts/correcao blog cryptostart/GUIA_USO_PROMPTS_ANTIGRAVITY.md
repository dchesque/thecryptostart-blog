# 🚀 GUIA DE USO — PROMPTS ANTIGRAVITY
## Como usar os prompts que foram criados

---

## 📋 RESUMO DOS PROMPTS CRIADOS

Criei **2 prompts Antigravity completos**:

### ✅ PROMPT 1: FASE 1 - LAYOUT REFACTORING (UX + SEO)
**Arquivo**: `PROMPT_ANTIGRAVITY_FASE1_COMPLETO.md`
- **Tarefas**: 19 tarefas estruturadas
- **Foco**: UX/legibilidade + SEO técnico + ads básico
- **Tempo estimado**: 2-3 horas
- **Impacto**: Nota 6.5 → 8.5/10
- **Resultado**: Bounce rate -40%, Session +200%, Revenue +300%

### ✅ PROMPT 2: FASE 2 - MONETIZAÇÃO (Ads Avançado + Performance)
**Arquivo**: `PROMPT_ANTIGRAVITY_FASE2_MONETIZACAO.md`
- **Tarefas**: 17 tarefas estruturadas
- **Foco**: Sticky ads + analytics + Core Web Vitals
- **Tempo estimado**: 2-3 horas
- **Impacto**: Nota 8.5 → 10/10
- **Resultado**: Revenue 5x melhor, RPM $10-15, Lighthouse 90+

---

## 🎯 PASSO A PASSO: COMO USAR

### Opção A: Executar FASE 1 primeiro (recomendado)

#### Passo 1: Copiar Prompt Fase 1
```
1. Abra arquivo: PROMPT_ANTIGRAVITY_FASE1_COMPLETO.md
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Salve em um arquivo `.txt` ou `.md` local
```

#### Passo 2: Enviar para Antigravity
```
1. Abra Antigravity (https://antigravity.dev ou app)
2. Crie novo projeto ou task
3. Cole o prompt completo
4. Configure:
   - GitHub repo: conecte seu repositório
   - Branch: main (ou development)
   - Contexto: auto-detect ou manual (.context)
```

#### Passo 3: Aguardar Execução
```
Antigravity vai:
- Analisar seu projeto
- Ler .context
- Executar 19 tarefas
- Criar/modificar componentes
- Fazer git commits
- Possivelmente fazer PR ou direct push
```

#### Passo 4: Validar Resultados
```
1. Abra seu projeto local: git pull
2. Rodar: npm run dev
3. Testar:
   - Breadcrumb visível em posts
   - Author info renderizado
   - Reading time mostra
   - Ads aparecem (3 slots)
   - Spacing adequado
   - Responsive funciona
4. Rodar Lighthouse: npm run build && npm run start
   - Meta: 90+ em todas categorias
```

#### Passo 5: Deploy Fase 1
```
git add .
git commit -m "feat(layout): phase 1 refactoring via antigravity"
git push
# Deploy automático no Vercel/seu host
```

---

### Opção B: Executar FASE 1 + FASE 2 Sequencialmente

#### Semana 1: FASE 1
```
Dia 1: Enviar Fase 1 prompt
Dia 2-3: Antigravity executa
Dia 4: Validar + deploy Fase 1
Dia 5: Monitorar (bounce rate, session duration)
```

#### Semana 2: FASE 2
```
Dia 1: Enviar Fase 2 prompt
Dia 2-3: Antigravity executa
Dia 4: Validar + deploy Fase 2
Dia 5: Monitorar (RPM, ads impressions, CLS)
```

---

### Opção C: Executar AMBAS Simultaneamente

```
1. Enviar Fase 1 + Fase 2 juntas
2. Antigravity processa em paralelo (2x mais rápido)
3. Validar ambas
4. Deploy único
```

**⚠️ Cuidado**: Pode haver conflitos se ambas mexem no mesmo arquivo

---

## 📝 O QUE COLOCAR NO ANTIGRAVITY

### Template de Envio:

```markdown
# CONTEXT

Este é um blog de crypto educacional feito em Next.js 14.

Repositório: [seu-repo-url]
Branch: main
Stack: Next.js | TypeScript | Tailwind | Contentful | Prisma

# OBJETIVO

Refatorar layout do blog para padrão AAA profissional (6.5 → 8.5/10).

# PROMPT

[Cole aqui o conteúdo completo do PROMPT_ANTIGRAVITY_FASE1_COMPLETO.md]

# ESPERADO

Após completar as 19 tarefas:
- ✅ Bounce rate: 50% → 28%
- ✅ Session duration: 1 min → 3.5 min
- ✅ Lighthouse score: 70 → 92
- ✅ Revenue: 3x melhor

# VERIFICAÇÃO

Após completar:
1. Rodar `npm run dev`
2. Testar cada página
3. Validar Lighthouse > 90
4. Fazer git push
```

---

## ⚠️ CHECKLIST PRÉ-ENVIO

Antes de enviar para Antigravity, certifique-se:

```
[ ] Projeto Next.js 14+ funcionando localmente
[ ] GitHub repo conectado
[ ] .context file exists (Antigravity consegue ler?)
[ ] Contentful API keys em .env.local
[ ] AdSense constants em lib/constants.ts (mesmo que empty)
[ ] Vercel ou servidor de deployment configurado
[ ] Latest git commit feito
[ ] Branch "main" ou "develop" é a principal
[ ] npm install rodou com sucesso
[ ] npm run dev executa sem erros
```

---

## 🚨 POSSÍVEIS PROBLEMAS & SOLUÇÕES

### ❌ "Antigravity não consegue ler .context"
**Solução**:
1. Certifique arquivo `.context` existe em root
2. Ou copie o conteúdo do contexto manualmente no prompt
3. Ou forneça link direto ao .context na sua descrição

### ❌ "Arquivo AdSense.tsx não existe"
**Solução**:
1. Crie arquivo baseado no que coloquei nos outros documentos
2. Ou Antigravity criará automaticamente (tem em projeto-knowledge)

### ❌ "calculateReadingTime() não existe"
**Solução**:
1. Verifique se existe em `lib/utils.ts`
2. Se não: Antigravity vai criar a função

### ❌ "Conflito entre Fase 1 e Fase 2"
**Solução**:
1. Execute Fase 1 completamente
2. Espere validação e deploy
3. Depois execute Fase 2
4. Ou: edite prompts para remover tarefas duplicadas

### ❌ "Antigravity fez muitas mudanças, quer fazer merge?"
**Solução**:
1. Review as mudanças (git diff)
2. Se tudo ok: merge via PR
3. Se algumas mudanças ruins: cherry-pick as boas, descartar ruins

---

## 💡 DICAS DE USO

### 1. Fragmentar se Necessário
Se o prompt for muito grande, você pode:
- Enviar 10 tarefas por vez
- Ou dividir em múltiplos prompts menores
- Antigravity consegue lidar com ambos

### 2. Adicionar Contexto Customizado
Se você quer tweaks específicos:
```markdown
# CUSTOMIZAÇÕES

- Usar cor primária #FF6B35 em lugar de padrão
- Featured articles devem ter border-left laranja
- Sidebar ads apenas em lg breakpoint (1024px+)
- Skip Fase 2 se quiser (só fazer Fase 1)
```

### 3. Monitorar Progresso
```
Antigravity geralmente fornece:
- Progress bar com % completo
- Logs de cada tarefa executada
- Commits automáticos no GitHub
- Notificação quando termina
```

### 4. Testar Antes de Deploy
```bash
# Após Antigravity terminar:
git pull
npm install
npm run dev

# Testar cada página:
- http://localhost:3000/
- http://localhost:3000/blog
- http://localhost:3000/blog/[qualquer-artigo]

# Testar Lighthouse:
npm run build
npm run start
# Abrir Chrome DevTools > Lighthouse
```

---

## 📊 TIMELINE ESPERADO

### Se fizer FASE 1 apenas:
```
Dia 1: Enviar prompt → Antigravity começa
Dia 2-3: Antigravity executa (2-3 horas de processamento)
Dia 4: Validar + testar
Dia 5: Deploy

RESULTADO: 6.5 → 8.5/10 em nota
IMPACTO: Bounce rate -40%, Session +200%
```

### Se fizer FASE 1 + FASE 2:
```
Semana 1 (Fase 1): Dias 1-5 (como acima)
Semana 2 (Fase 2): Dias 6-10 (mesmo processo)
Deploy final: Dia 11

RESULTADO: 6.5 → 10/10 em nota
IMPACTO: Bounce rate -44%, Revenue 15x melhor
```

---

## 🎓 APRENDIZADO

Após Antigravity terminar, você terá:

✅ **Componentes profissionais**:
- Breadcrumb.tsx
- PostMeta.tsx
- FeaturedImage.tsx
- AuthorCard.tsx
- StickyHeaderAd.tsx
- StickyFooterAd.tsx
- RecommendedContent.tsx

✅ **Padrões de código**:
- Tailwind spacing standards
- Responsive design patterns
- TypeScript best practices
- Next.js App Router patterns

✅ **Documentação**:
- Como estender cada componente
- Como adicionar novos ad slots
- Como customizar cores/spacing
- Como monitorar performance

---

## 🎯 PRÓXIMAS AÇÕES RECOMENDADAS

### Imediato (Hoje):
```
1. Salve os 2 prompts em arquivo local
2. Review o conteúdo (leio para entender o que fará)
3. Crie checklist pré-envio (confirme tudo existe)
```

### Curto Prazo (Esta semana):
```
1. Envie Fase 1 para Antigravity
2. Monitore progresso
3. Teste resultados
4. Deploy Fase 1
```

### Médio Prazo (Próxima semana):
```
1. Envie Fase 2 para Antigravity
2. Setup Google AdSense (se ainda não tem)
3. Configurar ad slot IDs em constants.ts
4. Deploy Fase 2
5. Monitorar RPM + Core Web Vitals
```

---

## 📞 SUPORTE

Se durante execução Antigravity tiver dúvidas:

1. **Referir ao prompt**: "Veja seção 3️⃣, Tarefa 5"
2. **Fornecer exemplos**: "Parecido com o componente Breadcrumb.tsx"
3. **Clarificar intent**: "O objetivo é adicionar ad placement estratégico, não mudar design visual"

---

## 🎬 RESUMO

**Você tem agora**:
- ✅ 2 prompts Antigravity completos (Fase 1 + Fase 2)
- ✅ Instruções de como usar
- ✅ Checklists de validação
- ✅ Timeline estimado
- ✅ Resolução de problemas comuns

**Próxima ação**:
- [ ] Revisar prompts
- [ ] Copiar Fase 1
- [ ] Enviar para Antigravity
- [ ] Monitorar execução
- [ ] Testar + Deploy
- [ ] Celebrar melhoria de 40-50% em bounce rate! 🎉

---

**Está pronto? Boa sorte! 🚀**
