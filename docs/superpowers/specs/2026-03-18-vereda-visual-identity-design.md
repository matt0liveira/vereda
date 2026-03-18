# Vereda — Visual Identity Design Spec

**Date:** 2026-03-18
**Status:** Approved

---

## 1. Brand

### Nome e conceito
- **Nome do produto:** Vereda
- **Conceito:** Caminho, trilha — evoca jornada, descoberta e direcionamento
- **Tom de voz:** Profissional, acolhedor, direto. Sem referências a tecnologias de terceiros (não mencionar "IA", "Gemini" ou similares na interface)

### Logo
- **Símbolo:** Bússola estilizada em SVG — círculo com seta norte/sul e ponteiros leste/oeste
- **Logotipo:** Símbolo + nome "Vereda" em DM Sans 700
- **Container do símbolo:** Quadrado com `border-radius: 8px`, fundo `#EA580C`
- **Cor do nome:** `#C2410C` em contextos claros; `white` em contextos escuros (ex: painel lateral do login)

---

## 2. Paleta de Cores

### Tailwind config — `theme.extend.colors`

Os dois blocos abaixo devem ser mesclados dentro de `theme.extend` no `tailwind.config.js`:

```js
// tailwind.config.js — theme.extend completo
theme: {
  extend: {
    fontFamily: {
      sans: ['DM Sans', 'system-ui', 'sans-serif'],
    },
    colors: {
  brand: {
    DEFAULT:    '#EA580C', // primary
    dark:       '#C2410C', // primary-dark / hover
    light:      '#FED7AA', // gradientes, fundos de imagem
    muted:      '#FFF1E8', // badge-bg, feature icons, tags selected bg
    'muted-text': '#9A3412', // badge-text, tags selected text
  },
  surface: {
    bg:      '#FFFAF5', // fundo global (off-white quente)
    DEFAULT: '#FFFFFF', // cards, navbar, inputs preenchidos
    border:  '#E7D5C7', // bordas padrão
    'border-filled': '#C8B4A5', // borda de input com conteúdo
  },
  content: {
    DEFAULT: '#1C1917', // texto principal
    muted:   '#78716C', // texto secundário
    subtle:  '#A8A29E', // placeholders, section labels
  },
  status: {
    'planned-bg':   '#EFF6FF',
    'planned-text': '#1D4ED8',
    'draft-bg':     '#FFF1E8',
    'draft-text':   '#9A3412',
    'done-bg':      '#F0FDF4',
    'done-text':    '#15803D',
  },
  error: {
    DEFAULT: '#DC2626',
    bg:      '#FEF2F2',
    border:  '#FECACA',
    },
  },
}
```

> Após definir os tokens acima, **nenhuma** classe Tailwind padrão de cor (`blue-*`, `gray-*`, `red-*` etc.) deve ser usada na aplicação. Usar exclusivamente as classes derivadas dos tokens acima (ex: `bg-brand`, `text-content-muted`, `border-surface-border`).

### Ring de foco
Não é um token Tailwind — usar diretamente via `style` ou `@layer` no CSS:
```css
box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
```

---

## 3. Tipografia

### Família
- **Primária:** `DM Sans` (Google Fonts)
- **Fallback:** `system-ui, sans-serif`
- **Import no `index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet">
```
- **`tailwind.config.js`:** definido na Seção 2 junto com os tokens de cor (ambos sob `theme.extend`)

### Escala tipográfica (valores fixos)

| Papel                          | Size  | Weight | Letter-spacing | Line-height |
|-------------------------------|-------|--------|----------------|-------------|
| Hero H1                        | 50px  | 800    | -2px           | 1.12        |
| Page title (h1 de página)      | 26px  | 800    | -0.7px         | —           |
| Auth heading (h2 login)        | 22px  | 800    | -0.5px         | —           |
| Logo name                      | 17px  | 700    | -0.5px         | —           |
| Nav links                      | 14px  | 500    | —              | —           |
| Hero body / descrição longa    | 17px  | 400    | —              | 1.65        |
| Card title                     | 14px  | 700    | —              | —           |
| Card body / descrição          | 13px  | 400    | —              | 1.55        |
| Input text                     | 14px  | 400    | —              | —           |
| Field label                    | 13px  | 600    | —              | —           |
| Field hint / meta text         | 12px  | 400    | —              | —           |
| Section label (uppercase)      | 11px  | 700    | 1px            | —           |
| Badge / status text            | 11px  | 600    | 0.5px          | —           |

---

## 4. Componentes

### Botão primário
```
bg: #EA580C (brand)
color: white
border-radius: 8px (padrão) / 10px (lg)
padding: 8px 18px (padrão) / 13px 28px (lg)
font: DM Sans 600 (padrão) / 700 (lg)
hover: bg #C2410C
disabled: opacity 0.5, cursor not-allowed
loading: spinner branco à esquerda do texto
```

### Botão secundário / outline
```
bg: white
color: #1C1917
border: 1.5px solid #E7D5C7
border-radius: 8px
hover: border-color #C8B4A5
```

### Input / campo de texto
```
border: 1.5px solid #E7D5C7
border-radius: 9px
padding: 10px 14px
font: DM Sans 14px 400
bg vazio: #FFFAF5
bg preenchido: white, border #C8B4A5
focus: border #EA580C + box-shadow 0 0 0 3px rgba(234,88,12,0.2)
erro: border #DC2626
placeholder: color #A8A29E
```

### Card genérico
```
bg: white
border: 1.5px solid #E7D5C7
border-radius: 14px
padding: 24px
```

### Form card (container do formulário)
```
bg: white
border: 1.5px solid #E7D5C7
border-radius: 14px   ← mesmo token que card genérico
padding: 32px
gap interno entre campos: 24px
```

> Nota: border-radius **14px** em todos os cards, incluindo o form card.

### Seletor de orçamento (budget cards)
Três cards lado a lado, comportamento de radio group visual:

```
Estado neutro:
  bg: #FFFAF5
  border: 1.5px solid #E7D5C7
  border-radius: 10px
  padding: 14px 10px
  label: DM Sans 13px 700, color #1C1917
  desc: DM Sans 11px 400, color #A8A29E

Estado hover:
  border-color: #C8B4A5

Estado selecionado:
  bg: #FFF1E8
  border: 1.5px solid #EA580C
  label color: #C2410C
  desc color: #EA580C

Radio input: visualmente oculto (sr-only), mantido no DOM para acessibilidade
```

### Tag / pill de interesse
```
padding: 7px 14px
border: 1.5px solid #E7D5C7
border-radius: 20px
font: DM Sans 13px 500

Estado neutro: color #78716C, bg #FFFAF5
Estado hover: border #C8B4A5, color #1C1917
Estado selecionado: border #EA580C, bg #FFF1E8, color #9A3412, weight 600
```

### Badge de status

| Status      | Bg         | Text       | Valores de status na DB       |
|-------------|------------|------------|-------------------------------|
| Planejado   | `#EFF6FF`  | `#1D4ED8`  | `"planned"`                   |
| Rascunho    | `#FFF1E8`  | `#9A3412`  | `"draft"` (default ao criar)  |
| Concluído   | `#F0FDF4`  | `#15803D`  | `"done"`                      |

```
font: 11px 600
border-radius: 20px
padding: 2px 8px
```

### Navbar
```
bg: white
border-bottom: 1.5px solid #E7D5C7
height: 60px
padding: 0 32px
```

### Dropdown (autocomplete de destino)
```
position: absolute, top: calc(100% + 4px), left/right: 0
bg: white
border: 1.5px solid #E7D5C7
border-radius: 10px
box-shadow: 0 8px 24px rgba(0,0,0,0.1)
item: padding 10px 14px, font DM Sans 13px 400, color #1C1917
item com ícone SVG: gap 10px, ícone 14px stroke #78716C
item hover/active: bg #FFF1E8
```

### Caixa de erro global (formulário)
```
bg: #FEF2F2
border: 1px solid #FECACA
border-radius: 8px
padding: 10px 14px
font: DM Sans 13px 400, color #DC2626
ícone: SVG circle-alert, stroke #DC2626, 15px
```

---

## 5. Ícones

- **Biblioteca de referência:** Lucide Icons
- **Estilo:** stroke-only, sem fill
- **Padrão:** `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`
- **Tamanhos:** 14px (ações em linha), 16px (botões), 20px (feature icons), 32px (dashboard card)
- **Proibido:** uso de emojis em qualquer parte da interface

---

## 6. Imagens de Destino

- Fotos reais via Unsplash com parâmetros `?w=400&q=80`
- `object-fit: cover` em todos os contextos
- Overlay nos trip cards (modo grade): `linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)`
- Miniatura no modo lista: `72×72px`
- **Fallback** (destino sem foto ou erro de carregamento): fundo gradiente `linear-gradient(135deg, #FED7AA, #EA580C)` com ícone de mapa SVG centralizado (stroke white, 32px)

---

## 7. Layout e Espaçamento

### Containers de conteúdo
- Dashboard: `max-w-4xl`
- Formulário: `max-w-2xl`
- Landing: `max-w-3xl` (features grid)
- Padding lateral: `px-4` mobile / `px-10` desktop

### Espaçamento interno
| Contexto                        | Valor  |
|---------------------------------|--------|
| Gap entre campos de formulário  | 24px   |
| Gap entre trip cards (grade)    | 14px   |
| Gap entre trip rows (lista)     | 10px   |
| Padding interno de card         | 24px   |
| Padding de page                 | 36px vertical, 40px horizontal |
| Padding de form card            | 32px   |

### Raios de borda
| Elemento           | Valor  |
|--------------------|--------|
| Cards e form card  | 14px   |
| Inputs             | 9px    |
| Botão padrão       | 8px    |
| Botão lg           | 10px   |
| Logo icon          | 8px    |
| Budget cards       | 10px   |
| Tags / pills       | 20px   |
| Badges             | 20px   |
| Dropdown           | 10px   |

---

## 8. Páginas

### Landing Page
- Hero: gradiente `#FFFAF5 → #FFF1E4`
- Badge: ícone SVG de mapa + "Planejamento inteligente de viagens"
- H1: 50px/800 com `<span>` em `#EA580C`
- 2 botões: primário "Planejar agora" + outline "Ver exemplo"
- 3 feature cards com ícone SVG 20px em container `#FFF1E8` / 40px

### Login / Auth
- Layout split 50/50
- Esquerda: gradiente `#EA580C → #9A3412`, logo branco, citação inspiracional
- Direita: formulário branco com inputs padrão

### Dashboard
- Toggle grade/lista no header (ícones SVG grid e list)
- **Modo grade:** foto Unsplash com overlay, badge de duração (top-right), orçamento no rodapé do card
- **Modo lista:** miniatura 72×72, colunas: nome/data, duração, orçamento, estilo, status badge

### Formulário (Planejar viagem)
- Form card dividido em 3 seções com `section-label` (11px uppercase)
- Seções: "Destino" → "Período" → "Preferências"
- Erros: caixa global no topo + mensagem inline por campo
- Botão submit full-width com ícone SVG play

---

## 9. Arquivos a modificar

| Arquivo | Alteração |
|---|---|
| `frontend/index.html` | Adicionar import da fonte DM Sans |
| `frontend/tailwind.config.js` | Substituir config atual pelos tokens de cor e fonte definidos neste spec |
| `frontend/src/index.css` | Atualizar `font-family` para DM Sans; adicionar variável CSS para focus ring |
| `frontend/src/components/Layout/Navbar.tsx` | Novo logo SVG bússola + nome "Vereda", cores via tokens |
| `frontend/src/components/UI/Button.tsx` | Atualizar variantes com tokens de cor |
| `frontend/src/components/UI/Input.tsx` | Atualizar estilos com tokens (borda, focus, bg) |
| `frontend/src/pages/Landing.tsx` | Remover emoji, aplicar identidade Vereda, novo hero badge |
| `frontend/src/pages/Auth.tsx` | Layout split, gradiente coral à esquerda |
| `frontend/src/pages/Dashboard.tsx` | Toggle grade/lista, fotos Unsplash, fallback de imagem |
| `frontend/src/components/Dashboard/TripCard.tsx` | Foto real, overlay, orçamento no rodapé |
| `frontend/src/pages/Plan.tsx` | Budget cards clicáveis, interest pills, sem emoji no botão |
| `frontend/src/components/UI/Badge.tsx` | Novos status tokens (planned, draft, done) |
| `frontend/src/components/UI/DestinationAutocomplete.tsx` | Estilizar dropdown com tokens: borda, bg, hover `#FFF1E8`, ícone SVG |

---

## 10. Proibições de estilo

- Sem emojis em qualquer parte da UI
- Sem referências a "Gemini", "IA", modelos de linguagem ou terceiros na interface
- Sem classes Tailwind padrão de cor (`blue-*`, `gray-*`, `red-*` etc.) — usar exclusivamente os tokens definidos na Seção 2
- Sem `shadow-lg` ou sombras pesadas — preferir `border: 1.5px solid #E7D5C7`
- Sem `border-radius` fora da escala definida na Seção 7
