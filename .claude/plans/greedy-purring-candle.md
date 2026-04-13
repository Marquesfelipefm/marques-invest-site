# Redesign Visual - Marquês Invest

## Contexto

O site foi construído pelo Codex (ChatGPT) como HTML/CSS/JS puro + Supabase. O design atual tem identidade visual correta (dark + gold) mas a execução não tem a qualidade premium esperada. O usuário quer que o site tenha a mesma linguagem editorial e sofisticada do PDF "Artigo da Semana" que criamos juntos — minimalista, limpo, com bastante respiro e ouro usado com parcimônia.

**Problemas principais do design atual:**
- Border-radius excessivo (999px em pills, 26-34px em cards) → visual "startup casual", não luxo
- 5 famílias de fontes carregadas sem coerência (Cinzel, Cormorant Garamond, Space Grotesk, Source Sans 3, Montserrat)
- Fundo azul-marinho com orbs decorativos → deveria ser carvão escuro limpo como o PDF
- Ouro diluído demais (14% opacity em bordas → quase invisível)
- Espaçamento caótico (10+ valores inconsistentes)
- Sombras pesadas e únicas ao invés de sutis e em camadas
- Transições rígidas (0.2s) ao invés de refinadas (0.35s)
- CSS com 5.200 linhas e 3-4 camadas de overrides acumulados

---

## Plano de Implementação

### Fase 1 — Fundação (Variáveis CSS + Fontes)

**1.1 Novo sistema de variáveis CSS** — Substituir os dois blocos `:root` existentes por um único:
- Backgrounds: `#141414` (carvão quente, não azul-marinho)
- Ouro: `#c9a84c` (mais contido que o atual `#d8b84c`)
- Texto: `#f0ede8` principal, `#9a9288` secundário
- Labels: `#8a6e2f` (ouro escuro, como no PDF)
- Linhas: cinza neutro a 12-22% (não dourado a 14%)
- Sombras em camadas (sm/md/lg/xl)
- Escala de espaçamento 8px base (4, 8, 12, 16, 24, 32, 48, 64, 96)
- Escala de radius: 4/8/12/16px (999px só para elementos circulares pequenos)
- Transição padrão: `0.35s cubic-bezier(0.16, 1, 0.3, 1)`

**1.2 Consolidação de fontes** — Reduzir de 5 para 2:
- **Inter** (400/500/600/700) → substitui Source Sans 3, Space Grotesk, Montserrat
- **Cormorant Garamond** (500/600/700) → mantém, só para h1/h2 hero
- Atualizar `@import` no CSS e `<link>` em todos os 10 HTMLs

### Fase 2 — Background e Reset Global

**2.1** Simplificar body background para `#141414` flat
**2.2** Remover pseudo-elementos `body::before` e `body::after` (orbs decorativos)
**2.3** Atualizar `<meta theme-color>` em todos os HTMLs para `#141414`
**2.4** Substituir todas as transições `0.2s ease` por `0.35s var(--ease-out)`

### Fase 3 — Componentes (maior volume de trabalho)

**3.1 Topbar/Navbar**
- Remover `border-radius: 30px` → reto
- Remover backdrop-filter e gradiente → transparente com borda inferior sutil
- Nav links: remover pills → texto uppercase com hover por cor

**3.2 Tags/Eyebrows/Section Kickers**
- Remover pills (999px) → texto puro uppercase em `#8a6e2f`
- Sem background, sem borda — como no PDF

**3.3 Botões**
- `border-radius: 8px` (não 18px/999px)
- Primary: ouro sólido (sem gradiente), hover com glow dourado sutil
- Secondary: borda cinza, hover com borda dourada

**3.4 Cards (teaser, news, feature, intelligence, process)**
- `border-radius: 12px` (não 26-34px)
- Background: `var(--bg-soft)` sólido (sem gradientes)
- Borda: `var(--line)` sutil
- Sombra: `var(--shadow-sm)`, hover → `var(--shadow-md)`
- Remover pseudo-elementos decorativos (watermarks, orbs)

**3.5 Hero Section**
- Limpar: sem bordas arredondadas, sem orbs, sem gradientes decorativos
- Tipografia grande em Cormorant Garamond, muito espaço negativo

**3.6 Market Panel/Ribbon**
- Simplificar para card limpo em `--bg-elevated`
- Change indicators: `border-radius: 4px` (não 999px)

**3.7 Footer** — Borda superior sutil, texto em `--text-soft`

**3.8 Forms** — Inputs com `border-radius: 8px`, focus state com borda dourada + glow sutil

**3.9 Agenda/Tabelas** — `border-radius: 12px`, estilo limpo como tabelas do PDF

**3.10 Blockquotes** — Cormorant Garamond italic, borda esquerda dourada, sem background

### Fase 4 — Limpeza CSS

- Remover primeiro bloco `:root` (linha 3, totalmente sobrescrito)
- Remover camada de dark-mode override (linhas ~2057-2380)
- Consolidar seletores duplicados (`.button-primary` definido 4x → 1x)
- Remover gradientes decorativos abandonados
- Meta: reduzir de ~5.200 para ~3.000-3.500 linhas

---

## Arquivos Críticos

| Arquivo | Alteração |
|---------|-----------|
| `assets/css/styles.css` | Redesign completo (variáveis, componentes, limpeza) |
| `index.html` | Fontes, theme-color |
| `admin.html` | Fontes, theme-color |
| `noticias.html` | Fontes, theme-color |
| `noticia.html` | Fontes, theme-color |
| `analise-semana.html` | Fontes, theme-color |
| `destaques.html` | Fontes, theme-color |
| `agenda.html` | Fontes, theme-color |
| `newsletter.html` | Fontes, theme-color |
| `contato.html` | Fontes, theme-color |
| `404.html` | Fontes, theme-color |

---

## Verificação

1. Abrir cada uma das 10 páginas e verificar:
   - Fundo carvão escuro (não azul-marinho)
   - Nenhum elemento pill-shaped (exceto WhatsApp float)
   - Tipografia apenas Inter + Cormorant Garamond
   - Ouro usado com parcimônia e impacto
   - Cards com radius sutil (8-12px)
   - Espaço negativo generoso entre seções
   - Transições suaves (0.35s)
   - Sem orbs/gradientes decorativos no fundo
2. Testar responsivo: 720px, 920px, 1180px
3. Verificar contraste WCAG AA para texto secundário
4. Usar MCP Claude Preview para screenshots em cada etapa
