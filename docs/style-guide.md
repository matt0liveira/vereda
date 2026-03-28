# Vereda — Style Guide

## Foundations

### Typography
- **Font family:** DM Sans (Google Fonts), fallback: `system-ui, sans-serif`
- **Base size:** 14–16px. Use Tailwind's text-sm (14px) as the default body size inside forms and cards.
- **Headings:** `font-extrabold tracking-[-0.7px]` at 26px for page titles; `font-bold` at 18–24px for section headers.
- **Labels / caps:** `text-[11px] font-bold uppercase tracking-[1px] text-content-subtle` for section dividers inside forms.
- **Captions / meta:** `text-xs text-content-muted`.

---

## Color Tokens

All colors are CSS custom properties resolved at runtime, supporting both light and dark modes without modifying component classes.

### Brand
| Token | Light | Dark | Usage |
|---|---|---|---|
| `brand` | `#EA580C` | `#F97316` | Primary buttons, active states, links |
| `brand-dark` | `#C2410C` | `#EA580C` | Button hover, logo text |
| `brand-light` | `#FED7AA` | `#431407` | Subtle accent backgrounds |
| `brand-muted` | `#FFF1E8` | `#1C0900` | Selected chip/pill background |
| `brand-muted-text` | `#9A3412` | `#FDBA74` | Text inside brand-muted backgrounds |

### Surface
| Token | Light | Dark | Usage |
|---|---|---|---|
| `surface-bg` | `#FFFAF5` | `#0C0A09` | Page background (`<body>`) |
| `surface` | `#FFFFFF` | `#1C1917` | Cards, modals, navbar |
| `surface-border` | `#E7D5C7` | `#292524` | Default borders |
| `surface-border-filled` | `#C8B4A5` | `#44403C` | Hover/focus borders |

### Content
| Token | Light | Dark | Usage |
|---|---|---|---|
| `content` | `#1C1917` | `#FAFAF9` | Primary text |
| `content-muted` | `#78716C` | `#A8A29E` | Secondary text, placeholders |
| `content-subtle` | `#A8A29E` | `#57534E` | Disabled text, hints |

### Status
| Token pair | Light bg / text | Dark bg / text | Usage |
|---|---|---|---|
| `planned` | `#EFF6FF` / `#1D4ED8` | `#0F1729` / `#93C5FD` | Itinerary status badge |
| `draft` | `#FFF1E8` / `#9A3412` | `#1C0900` / `#FDBA74` | Draft state |
| `done` | `#F0FDF4` / `#15803D` | `#052E16` / `#86EFAC` | Saved/completed state |
| `error` | `#FEF2F2` / `#DC2626` | `#1C0808` / `#FCA5A5` | Validation errors |

---

## Dark Mode

Dark mode is toggled by adding the `.dark` class to `<html>`. The CSS variable values swap automatically — no component changes needed.

**Persistence:** The user's preference is saved to `localStorage` under the key `theme`. On first visit, the system preference (`prefers-color-scheme`) is respected.

**Hook:** `useTheme()` from `src/hooks/useTheme.ts`
```ts
const { dark, toggle } = useTheme()
```

---

## Components

### Buttons
Defined in `src/components/UI/Button.tsx`.

| Variant | Usage |
|---|---|
| `primary` (default) | Main actions — "Salvar", "Gerar Roteiro" |
| `secondary` | Secondary actions — "Voltar", "PDF", "Sair" |
| `danger` | Destructive confirmation dialogs |
| `danger-outline` | Inline destructive actions (e.g. remove activity) |

All buttons support `loading` (shows a spinner) and `disabled` props.
Always add `gap-2` when pairing an icon with a label: `<Button className="gap-2">`.

### Inputs
Use the `<Input>` component for text fields. It accepts `label`, `error`, and all native `input` props.
For date/time fields, use a raw `<input type="date|time">` styled with:
```
rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors
border-surface-border bg-surface-bg focus:border-brand focus:bg-surface
```

Error state: swap border class to `border-status-error-text bg-surface`.

### Pill / Tag selectors
Used for multi-select (Interests, Transport) and single-select (Accommodation, Budget):
```
rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[13px] font-medium transition-colors
```
- **Inactive:** `border-surface-border bg-surface-bg text-content-muted hover:border-surface-border-filled hover:text-content`
- **Active:** `border-brand bg-brand-muted text-brand-muted-text font-semibold`

### Cards / Form panels
```
rounded-[14px] border-[1.5px] border-surface-border bg-surface p-8
```

### Section labels (inside cards)
```
text-[11px] font-bold uppercase tracking-[1px] text-content-subtle
```

### Error banner
```
rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2.5
```
Pair with the inline SVG alert icon and `text-[13px] text-status-error-text`.

### Steppers
Multi-step progress indicator: active step uses `bg-brand text-white`; pending uses `bg-surface-border text-content-muted`. Completed steps (past) show a checkmark SVG instead of the step number.

---

## Spacing & Layout
- **Page max-width:** `max-w-2xl` for forms/single-column content; `max-w-3xl` for preview; `max-w-6xl` for the navbar.
- **Page padding:** `px-4 py-12`.
- **Card padding:** `p-8`.
- **Gap between form sections:** `gap-6` inside flex-col forms.
- **Grid columns:** `sm:grid-cols-2` for paired fields (origin/destination, start/end date).

---

## Borders & Radius
| Element | Radius |
|---|---|
| Page cards, panels | `rounded-[14px]` |
| Inputs, text areas | `rounded-[9px]` |
| Image thumbnails | `rounded-[8px]` |
| Pill tags | `rounded-[20px]` |
| Buttons | `rounded-lg` (8px) |
| Avatar/icon containers | `rounded-lg` or `rounded-full` |

Border weight is consistently `border-[1.5px]` throughout the UI.

---

## Icons
All icons are inline SVG with `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"` (or `2.5` for small sizes), `strokeLinecap="round"`, `strokeLinejoin="round"`. No icon libraries — no emojis.
