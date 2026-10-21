# ERROR — Design System

Documento de referência da identidade visual e dos componentes do **ERROR**.
A implementação canônica vive em [`apps/web/src/styles/index.css`](../apps/web/src/styles/index.css)
e nos componentes de [`apps/web/src/components`](../apps/web/src/components).

---

## 1. Princípios

| Princípio | Como aparece na interface |
| --- | --- |
| **O óbvio é a armadilha** | A interface parece um terminal simples; a dificuldade está na leitura, não em controles escondidos. |
| **Tensão controlada** | Fundo escuro, verde neon e microanimações criam urgência sem impedir a leitura. |
| **Honestidade visual** | Todo elemento interativo parece interativo. As pegadinhas são de interpretação, nunca de acessibilidade. |
| **Hierarquia de terminal** | Rótulos em caixa alta, dados em monoespaçada e um único foco neon por tela. |
| **Silêncio é luxo** | Áreas vazias respiram. O neon marca ação e estado, não decoração. |

---

## 2. Marca

- **Wordmark:** `ERROR`, em Chakra Petch pesada, com inclinação/recorte próprio do logo.
- **Arquivos:** `apps/web/public/logo-error.png` (com transparência) e
  `apps/web/public/logo-mark.png` (símbolo).
- **Área de respiro:** no mínimo a altura da letra `E` em todos os lados.
- **Fundos permitidos:** `void`, `panel` e `graphite`. Evite neon sólido atrás do logo.
- **Não fazer:** distorcer, aplicar sombra colorida fora da paleta, trocar a fonte do wordmark
  ou usar o logo como textura repetida.
- **Favicon/PWA:** `favicon.png`, `icons/icon-192.png`, `icons/icon-512.png`,
  `icons/maskable-512.png` e `og-image.png` são gerados por `npm run icons`.

---

## 3. Cores

Tokens declarados em `@theme` e consumidos como utilitários Tailwind
(`bg-void`, `text-neon`, `border-alert/40`, etc.).

| Token | Hex | Uso |
| --- | --- | --- |
| `void` | `#070909` | Fundo global, texto sobre neon |
| `panel` | `#0D1110` | Superfícies de painéis |
| `graphite` | `#141A17` | Botões secundários, camadas elevadas |
| `neon` | `#39FF14` | Ação primária, acerto, foco, dados importantes |
| `neon-bright` | `#65FF45` | Hover do botão primário |
| `neon-dark` | `#0B3D0B` | Scrollbar, profundidade, brilhos discretos |
| `ink` | `#E8F2E9` | Texto principal |
| `muted` | `#A0B0A4` | Texto secundário, metadados, placeholders |
| `alert` | `#FF3030` | Erro, vida perdida, ação destrutiva |
| `amber-300` | `#FCD34D` | Destaque do 3º lugar no ranking |

### Regras de uso

- **Um neon por decisão.** Em uma tela, apenas a ação principal recebe `btn-neon`.
- **Transparências:** bordas em `neon/10` a `neon/45`; fundos de estado em `neon/5` a `neon/10`.
- **Vermelho é semântico.** Use `alert` para erro, bloqueio e destruição — nunca como decoração.
- **Contraste:** texto principal e secundário foram escolhidos para fundos `void`/`panel`.
  Não use `muted/50` para informação essencial.
- **Gradientes:** só para profundidade (vinheta, brilho radial). Não use gradiente em texto.

---

## 4. Tipografia

| Papel | Fonte | Token | Onde |
| --- | --- | --- | --- |
| Display | Chakra Petch | `font-display` | Títulos, botões, rótulos, números de destaque |
| Texto/dados | JetBrains Mono Variable | `font-mono` (padrão do `body`) | Parágrafos, inputs, HUD, tabelas |

### Escala usada

| Tamanho | Exemplo de uso |
| --- | --- |
| `0.55–0.62rem` | Eyebrows, badges, metadados em caixa alta com `tracking` largo |
| `0.82rem` | Rótulo de botão |
| `1rem` | Corpo e inputs (evita zoom automático no iOS) |
| `1.08rem` | Alternativas de fase |
| `1.25–1.5rem` | Subtítulos e apelidos |
| `2–3rem` | Títulos de seção e pontuação |
| `4–7xl` (2.25–4.5rem) | Pontuação final e hero |

### Convenções

- Títulos e botões: `font-display`, `font-bold`, `uppercase`, `tracking-[0.14em]` a `[0.34em]`.
- Corpo: `text-sm`, `leading-relaxed`, `text-muted`.
- Números de HUD: `font-display` com `tabular` visual (largura fixa da fonte).
- Evite parágrafos longos em caixa alta; reserve isso para instruções curtas de fase.

---

## 5. Espaçamento, grid e breakpoints

- **Base:** múltiplos de 4 px (utilitários Tailwind).
- **Container:** `max-w-6xl` (72 rem), `px-4 sm:px-6`.
- **Página:** `py-12 sm:py-16`.
- **Painéis:** `p-5` (compacto), `p-6` (padrão), `p-9` (hero).
- **Gaps:** `gap-2` para metadados, `gap-4` para cards, `gap-6` para colunas.
- **Breakpoints Tailwind:** `sm` 640 px · `md` 768 px · `lg` 1024 px · `xl` 1280 px.
- **Mobile first:** toda tela funciona em 390 × 844; layouts de duas colunas só a partir de `lg`.
- **Área de toque:** mínimo de 44 × 44 px. Botões usam `min-height: 2.85rem` (45,6 px);
  alternativas de fase usam `min-height: 4.4rem`.

---

## 6. Forma e elevação

- **Cantos chanfrados:** `clip-path` de 10 px (botões/inputs), 12 px (alternativas),
  14 px (`clip-corner`) e 20 px (`hud-panel`).
- **`.hud-panel`:** gradiente `panel → void`, borda `neon/18`, cantos cortados,
  sombra profunda e cantos neon de 86 × 1 px.
- **Sombras:** `shadow-neon` para foco suave, `shadow-neon-strong` para destaque,
  `shadow-alert` para erro.
- **Grid de fundo:** `.cyber-grid` (linhas de 42 px + brilho radial no topo).
- **Scanlines:** `.scanlines` aplica linhas fixas com `pointer-events: none` e `z-index: 60`.
  Nunca coloque conteúdo interativo acima delas sem revisar o `z-index`.

---

## 7. Componentes

### 7.1 Botões

| Classe | Uso | Estado |
| --- | --- | --- |
| `.btn-neon` | Ação primária (iniciar, enviar, jogar novamente) | Hover clareia e eleva 1 px; `disabled` reduz opacidade para 38% |
| `.btn-ghost` | Ação secundária (ranking, compartilhar, cancelar) | Hover vira borda neon |
| `.btn-danger` | Ação destrutiva (sair do dispositivo) | Fundo vermelho translúcido no hover |

- Sempre `type="button"` fora de formulários.
- Ícones inline de 16 px (`size-4`) antes do rótulo, com `gap-0.6rem`.
- Não use dois `btn-neon` lado a lado.

### 7.2 Alternativas de fase (`.choice-base`)

- Altura mínima 70 px, texto centralizado, borda `muted/22`.
- Hover: borda neon, fundo mais opaco, elevação de 1 px.
- `disabled` durante o envio: `cursor: wait` e opacidade 55%.
- Cada alternativa é um `<button>`; a seleção múltipla usa `aria-pressed`.

### 7.3 Campos (`.field`)

- Fundo `void/80`, borda `muted/26`, altura mínima 48 px.
- Foco: borda neon + anel `0 0 0 3px rgb(57 255 20 / 0.12)`.
- Sempre associar `<label>` (visível ou `.sr-only`).
- `font-size: 1rem` para evitar zoom automático no mobile.

### 7.4 HUD e feedback de jogo

- HUD superior: pontos, vidas, fase atual, acertos e botão de saída.
- Vidas: ícones com `aria-label="N de 3 vidas restantes"`.
- Feedback: overlay com `role="status"`, `aria-live="assertive"` e `aria-labelledby`.
  Acerto usa neon; erro usa `alert` e animação `shake`.
- Barra de progresso: `role="progressbar"` com `aria-label` explícito.

### 7.5 Status, métricas e estados

- `StatusBadge`: `EM ANDAMENTO`/`CONCLUÍDA` (neon), `BLOQUEADA` (alert),
  `ABANDONADA` (muted).
- `StatCard`: rótulo em caixa alta, valor em `font-display`, detalhe em `muted`.
- `EmptyState`: título, descrição e ação opcional; usado no ranking e no perfil.
- `ErrorNotice`: `role="alert"`, borda `alert/40` e botão de nova tentativa.
- `LoadingScreen`: spinner + rótulo de terminal + frase de personalidade.

### 7.6 Navegação

- Header fixo/sticky com logo, navegação desktop (`md+`), avatar e menu mobile.
- Menu mobile: botão com `aria-expanded`/`aria-controls`, navegação rotulada.
- Item ativo usa neon; itens inativos usam `muted` e viram neon no hover/foco.
- Footer com três blocos: marca, navegação e sistema.

### 7.7 Modal

- `role="dialog"`, `aria-modal="true"`, título via `aria-labelledby`.
- Fecha com `Esc`, clique no overlay e botão com `aria-label="Fechar"`.
- Bloqueia o scroll do `body` enquanto aberto.
- Foco inicial no botão de fechar; mantenha a ordem de tabulação previsível.

---

## 8. Movimento

| Utilitário | Duração | Uso |
| --- | --- | --- |
| `.animate-phase-in` | 260 ms | Entrada de uma nova fase |
| `.animate-feedback-in` | 240 ms | Overlay de acerto/erro, modais, resultado |
| `.animate-shake` | 280 ms | Erro de resposta |
| `.animate-pulse-neon` | 2,2 s | Indicador de espera/atenção |
| `.animate-flicker` | 9 s | Logo e detalhes ambiente |
| `.animate-marquee` | 26 s | Faixa de frases da home |

- Animações de estado são **one-shot**; ambientes são lentas e sutis.
- `prefers-reduced-motion: reduce` reduz animações e transições para ~0 ms globalmente.
- Nunca use movimento para comunicar algo essencial sem um equivalente textual.

---

## 9. Acessibilidade

- **Estrutura:** `header`, `nav`, `main`, `footer`, `section` e headings em ordem.
- **Foco:** `:focus-visible` global com contorno neon de 2 px e offset de 3 px.
- **Teclado:** todas as ações são alcançáveis por `Tab`/`Enter`/`Espaço`.
  A fase de clique fora aceita `Escape` como alternativa.
- **Leitores de tela:** rótulos explícitos em ícones, barras e vidas; `aria-live` no feedback.
- **Alvos:** mínimo 44 px; alternativas grandes e espaçadas.
- **Contraste:** texto essencial em `ink` ou `muted` sobre `void`/`panel`.
  Não dependa apenas de cor: acerto/erro também usam ícone e texto.
- **Conteúdo dinâmico:** mudanças de fase são anunciadas pelo título e pelo feedback.
- **Formulários:** erros com `role="alert"` e mensagens de sucesso com `role="status"`.

---

## 10. PWA e ícones

- `theme_color` e `background_color`: `#070909`.
- Ícones: 192 px e 512 px (`any`) + 512 px maskable com zona segura.
- Splash e shell usam `void`; não introduza branco.
- Atalhos do manifest: **Jogar** (`/jogar`) e **Ranking** (`/ranking`).
- O service worker usa `registerType: "prompt"`; atualizações são oferecidas, não impostas.

---

## 11. Checklist antes de criar uma tela

- [ ] Existe um único `btn-neon` como ação principal?
- [ ] O conteúdo funciona em 390 px sem rolagem horizontal?
- [ ] Todos os alvos têm pelo menos 44 px?
- [ ] O foco é visível em todos os controles?
- [ ] O erro usa `alert` + ícone + texto (não só cor)?
- [ ] A tela tem `h1` único e landmarks semânticos?
- [ ] Animações respeitam `prefers-reduced-motion`?
- [ ] Nenhuma solução de fase foi enviada ao cliente?
