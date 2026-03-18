# Vereda Visual Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a identidade visual Vereda em todo o frontend — paleta Tropical Warm, tipografia DM Sans, logo bússola SVG, sem emojis, sem referências a terceiros.

**Architecture:** Começar pela fundação (tokens Tailwind + fonte), avançar por componentes atômicos (Button, Input, Badge), depois layout (Navbar, Auth split), e finalizar com páginas (Landing, Dashboard com toggle grade/lista, Formulário). Cada tarefa é um commit isolado.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Vite, React Router, Lucide-style SVG icons inline

---

## Mapa de Arquivos

| Arquivo | Operação | Responsabilidade |
|---|---|---|
| `frontend/index.html` | Modificar | Import da fonte DM Sans |
| `frontend/tailwind.config.js` | Modificar | Tokens de cor e fonte |
| `frontend/src/index.css` | Modificar | Reset de body bg, focus ring CSS var |
| `frontend/src/components/UI/Button.tsx` | Modificar | Variantes com tokens de cor |
| `frontend/src/components/UI/Input.tsx` | Modificar | Tokens de borda, focus, bg |
| `frontend/src/components/UI/Badge.tsx` | Modificar | Variantes por status DB |
| `frontend/src/components/UI/Spinner.tsx` | Modificar | Cor do spinner → brand |
| `frontend/src/components/Layout/Navbar.tsx` | Modificar | Logo SVG bússola + tokens |
| `frontend/src/pages/Landing.tsx` | Modificar | Identidade Vereda, sem emoji |
| `frontend/src/pages/Auth.tsx` | Modificar | Layout split 50/50 |
| `frontend/src/components/Auth/LoginForm.tsx` | Modificar | Sem heading interno, tokens |
| `frontend/src/components/Auth/RegisterForm.tsx` | Modificar | Sem heading interno, tokens |
| `frontend/src/pages/Dashboard.tsx` | Modificar | Toggle grade/lista, estado de view |
| `frontend/src/components/Dashboard/TripCard.tsx` | Modificar | Foto Unsplash + fallback, modo lista |
| `frontend/src/components/Dashboard/EmptyState.tsx` | Modificar | Sem emoji, ícone SVG |
| `frontend/src/pages/Plan.tsx` | Modificar | Budget cards, interest pills, sem emoji |
| `frontend/src/components/UI/DestinationAutocomplete.tsx` | Modificar | Dropdown com tokens |

> **Nota sobre status:** O tipo `Itinerary.status` no codebase usa `'draft' | 'saved' | 'error'`. O Badge deve mapear: `draft → Rascunho`, `saved → Planejado`, `error → Erro`. Não alterar o tipo nem a DB neste plano.

---

## Task 1: Fundação — Tailwind tokens + fonte DM Sans

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Adicionar import da fonte no `index.html`**

Localizar `<head>` e inserir antes do `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Substituir `tailwind.config.js` completo**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT:      '#EA580C',
          dark:         '#C2410C',
          light:        '#FED7AA',
          muted:        '#FFF1E8',
          'muted-text': '#9A3412',
        },
        surface: {
          bg:             '#FFFAF5',
          DEFAULT:        '#FFFFFF',
          border:         '#E7D5C7',
          'border-filled':'#C8B4A5',
        },
        content: {
          DEFAULT: '#1C1917',
          muted:   '#78716C',
          subtle:  '#A8A29E',
        },
        status: {
          'planned-bg':   '#EFF6FF',
          'planned-text': '#1D4ED8',
          'draft-bg':     '#FFF1E8',
          'draft-text':   '#9A3412',
          'done-bg':      '#F0FDF4',
          'done-text':    '#15803D',
          'error-bg':     '#FEF2F2',
          'error-text':   '#DC2626',
          'error-border': '#FECACA',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Atualizar `index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'DM Sans', system-ui, sans-serif;
    background-color: #FFFAF5;
    color: #1C1917;
  }

  *:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
  }
}
```

- [ ] **Step 4: Iniciar o servidor de dev e verificar que a fonte DM Sans carregou**

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173` e inspecionar o body — deve mostrar `font-family: "DM Sans"`.

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/tailwind.config.js frontend/src/index.css
git commit -m "feat(ui): add DM Sans font and Vereda color tokens to Tailwind config"
```

---

## Task 2: Componentes atômicos — Button, Input, Badge, Spinner

**Files:**
- Modify: `frontend/src/components/UI/Button.tsx`
- Modify: `frontend/src/components/UI/Input.tsx`
- Modify: `frontend/src/components/UI/Badge.tsx`
- Modify: `frontend/src/components/UI/Spinner.tsx`

- [ ] **Step 1: Atualizar `Button.tsx`**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-surface text-content border border-surface-border hover:border-surface-border-filled',
    danger:    'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Atualizar `Input.tsx`**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-semibold text-content">
          {label}
          {props.required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-content-subtle -mt-0.5">{hint}</p>}
      <input
        className={`w-full rounded-[9px] border px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle
          ${error
            ? 'border-status-error-text bg-surface focus:border-status-error-text'
            : 'border-surface-border bg-surface-bg focus:border-brand focus:bg-surface'
          }
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-error-text">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Atualizar `Badge.tsx`**

Mapear status do DB (`draft`, `saved`, `error`) para tokens visuais:

```tsx
type BadgeVariant = 'planned' | 'draft' | 'done' | 'error'

// Mapeamento de status DB → variante visual
export const STATUS_BADGE: Record<string, BadgeVariant> = {
  saved:  'planned',
  draft:  'draft',
  done:   'done',
  error:  'error',
}

interface BadgeProps {
  variant?: BadgeVariant
  label: string
}

export function Badge({ variant = 'draft', label }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    planned: 'bg-status-planned-bg text-status-planned-text',
    draft:   'bg-status-draft-bg text-status-draft-text',
    done:    'bg-status-done-bg text-status-done-text',
    error:   'bg-status-error-bg text-status-error-text',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.5px] ${styles[variant]}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Atualizar `Spinner.tsx`**

Substituir qualquer cor hard-coded `blue` por `brand`:

```tsx
interface SpinnerProps {
  message?: string
}

export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-surface-border border-t-brand" />
      {message && <p className="text-sm text-content-muted">{message}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Rodar os testes para garantir que nenhum teste quebrou**

```bash
cd frontend && npm run test -- --run
```

Esperado: todos os testes passam. Se algum teste de snapshot falhar por mudança de classe CSS, atualizar o snapshot com `npm run test -- --run -u`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/UI/
git commit -m "feat(ui): apply Vereda tokens to Button, Input, Badge, Spinner"
```

---

## Task 3: Logo SVG bússola + Navbar

**Files:**
- Modify: `frontend/src/components/Layout/Navbar.tsx`

- [ ] **Step 1: Criar o componente `CompassIcon` inline e atualizar a Navbar**

```tsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../UI/Button'
import toast from 'react-hot-toast'

function CompassIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
      <polygon points="12,4 14,12 12,20 10,12" fill="rgba(255,255,255,0.45)" />
      <polygon points="4,12 12,10 20,12 12,14" fill="white" />
    </svg>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Até logo!')
    navigate('/')
  }

  return (
    <nav className="border-b border-surface-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-0 h-[60px]">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <CompassIcon />
          </div>
          <span className="text-[17px] font-bold tracking-[-0.5px] text-brand-dark">Vereda</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-content-muted hover:text-content transition-colors">
                Minhas viagens
              </Link>
              <Link to="/plan" className="text-sm font-medium text-content-muted hover:text-content transition-colors">
                Planejar
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="text-sm">
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="text-sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verificar visualmente no browser**

Navbar deve mostrar ícone laranja da bússola + "Vereda" em marrom-escuro. Sem emojis.

- [ ] **Step 3: Rodar testes**

```bash
cd frontend && npm run test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Layout/Navbar.tsx
git commit -m "feat(ui): add compass logo and apply Vereda tokens to Navbar"
```

---

## Task 4: Landing Page

**Files:**
- Modify: `frontend/src/pages/Landing.tsx`

- [ ] **Step 1: Reescrever `Landing.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { Button } from '../components/UI/Button'

const FEATURES = [
  {
    title: 'Roteiros personalizados',
    desc: 'Gerados automaticamente e adaptados ao seu estilo, ritmo e preferências de viagem.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    title: '100% Editável',
    desc: 'Ajuste atividades, horários e descrições antes de exportar. O roteiro é seu.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    title: 'Exporta em PDF',
    desc: 'Leve seu roteiro offline com endereços e mapas inclusos, pronto para a viagem.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="bg-surface-bg">
      {/* Hero */}
      <div className="flex flex-col items-center px-4 pb-16 pt-20 text-center"
           style={{ background: 'linear-gradient(180deg, #FFFAF5 0%, #FFF1E4 100%)' }}>
        {/* Badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#F9C49A] bg-brand-muted px-4 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <span className="text-xs font-semibold tracking-[0.3px] text-brand-muted-text">
            Planejamento inteligente de viagens
          </span>
        </div>

        <h1 className="mb-4 text-[50px] font-extrabold leading-[1.12] tracking-[-2px] text-content">
          Seu próximo roteiro,{' '}
          <span className="text-brand">criado em segundos</span>
        </h1>

        <p className="mb-10 max-w-[460px] text-[17px] leading-[1.65] text-content-muted">
          Diga seu destino, estilo e duração. A Vereda monta um roteiro dia a dia personalizado,
          editável e exportável em PDF.
        </p>

        <div className="flex gap-3">
          <Link to="/auth">
            <Button className="rounded-[10px] px-7 py-3.5 text-[15px] font-bold">
              Planejar agora
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="secondary" className="rounded-[10px] px-7 py-3.5 text-[15px] font-bold">
              Ver exemplo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto grid max-w-3xl gap-4 px-4 pb-16 sm:grid-cols-3">
        {FEATURES.map(f => (
          <div key={f.title} className="rounded-2xl border border-surface-border bg-surface p-6">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-muted text-brand-dark">
              {f.icon}
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-content">{f.title}</h3>
            <p className="text-[13px] leading-[1.55] text-content-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar visualmente**

Hero com gradiente quente, badge laranja, H1 com span coral, sem emojis, 3 feature cards.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Landing.tsx
git commit -m "feat(landing): apply Vereda identity, remove emoji, update hero and features"
```

---

## Task 5: Auth Page — layout split

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`
- Modify: `frontend/src/components/Auth/LoginForm.tsx`
- Modify: `frontend/src/components/Auth/RegisterForm.tsx`

- [ ] **Step 1: Reescrever `Auth.tsx` com layout split**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/Auth/LoginForm'
import { RegisterForm } from '../components/Auth/RegisterForm'

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
      <polygon points="12,4 14,12 12,20 10,12" fill="rgba(255,255,255,0.45)" />
      <polygon points="4,12 12,10 20,12 12,14" fill="white" />
    </svg>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const { user, login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  async function handleLogin(email: string, password: string) {
    await login(email, password)
    toast.success('Bem-vindo de volta!')
    navigate('/dashboard')
  }

  async function handleRegister(email: string, password: string) {
    await register(email, password)
    toast.success('Conta criada! Verifique seu e-mail.')
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface-bg px-4 py-12">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-surface-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Painel esquerdo */}
          <div
            className="hidden flex-col justify-between p-10 md:flex"
            style={{ background: 'linear-gradient(150deg, #EA580C, #9A3412)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <CompassIcon />
              </div>
              <span className="text-[17px] font-bold tracking-[-0.5px] text-white">Vereda</span>
            </div>
            <div>
              <p className="text-[20px] font-bold leading-[1.45] tracking-[-0.4px] text-white/92">
                "Toda grande viagem começa com um bom plano."
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/60">
                Crie roteiros personalizados em segundos.
              </p>
            </div>
          </div>

          {/* Painel direito */}
          <div className="bg-surface p-10">
            {/* Tab switcher */}
            <div className="mb-7 flex rounded-lg border border-surface-border p-1">
              {(['login', 'register'] as const).map(t => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                    tab === t
                      ? 'bg-brand-muted text-brand-dark shadow-sm'
                      : 'text-content-muted hover:text-content'
                  }`}
                >
                  {t === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>

            {tab === 'login'
              ? <LoginForm onLogin={handleLogin} />
              : <RegisterForm onRegister={handleRegister} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `LoginForm.tsx` — remover heading interno (agora está no tab)**

```tsx
import { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.5px] text-content">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-[13px] text-content-muted">Entre para acessar suas viagens</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[13px] text-status-error-text">{error}</p>
        </div>
      )}

      <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required aria-label="E-mail" placeholder="voce@email.com" />
      <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required aria-label="Senha" placeholder="••••••••" />
      <Button type="submit" loading={loading} className="mt-1 w-full py-3">Entrar</Button>
    </form>
  )
}
```

- [ ] **Step 3: Atualizar `RegisterForm.tsx`**

```tsx
import { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'

interface RegisterFormProps {
  onRegister: (email: string, password: string) => Promise<void>
}

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onRegister(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.5px] text-content">
          Criar conta
        </h2>
        <p className="mt-1 text-[13px] text-content-muted">Comece a planejar suas viagens</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[13px] text-status-error-text">{error}</p>
        </div>
      )}

      <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required aria-label="E-mail" placeholder="voce@email.com" />
      <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-label="Senha" placeholder="Mínimo 6 caracteres" />
      <Button type="submit" loading={loading} className="mt-1 w-full py-3">Criar conta</Button>
    </form>
  )
}
```

- [ ] **Step 4: Rodar os testes**

```bash
cd frontend && npm run test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Auth.tsx frontend/src/components/Auth/
git commit -m "feat(auth): split layout with coral gradient panel and Vereda tokens"
```

---

## Task 6: Dashboard — toggle grade/lista

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Adicionar estado de view e toggle no `Dashboard.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { fetchItineraries, deleteItinerary } from '../services/api'
import { Itinerary } from '../types'
import { TripCard } from '../components/Dashboard/TripCard'
import { EmptyState } from '../components/Dashboard/EmptyState'
import { Spinner } from '../components/UI/Spinner'
import { Link } from 'react-router-dom'
import { Button } from '../components/UI/Button'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

export default function DashboardPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')

  useEffect(() => {
    fetchItineraries()
      .then(setItineraries)
      .catch(() => toast.error('Erro ao carregar viagens'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta viagem?')) return
    try {
      await deleteItinerary(id)
      setItineraries(prev => prev.filter(i => i.id !== id))
      toast.success('Viagem excluída')
    } catch {
      toast.error('Erro ao excluir viagem')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-extrabold tracking-[-0.7px] text-content">Minhas Viagens</h1>
        <div className="flex items-center gap-2.5">
          {/* Toggle grade/lista */}
          <div className="flex overflow-hidden rounded-lg border border-surface-border bg-surface">
            <button
              onClick={() => setView('grid')}
              aria-label="Modo grade"
              className={`flex items-center justify-center p-2 transition-colors ${
                view === 'grid' ? 'bg-brand-muted text-brand-dark' : 'text-content-muted hover:text-content'
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Modo lista"
              className={`flex items-center justify-center p-2 transition-colors ${
                view === 'list' ? 'bg-brand-muted text-brand-dark' : 'text-content-muted hover:text-content'
              }`}
            >
              <ListIcon />
            </button>
          </div>
          <Link to="/plan">
            <Button>+ Nova viagem</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner message="Carregando viagens..." />
      ) : itineraries.length === 0 ? (
        <EmptyState />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itineraries.map(it => (
            <TripCard key={it.id} itinerary={it} onDelete={handleDelete} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {itineraries.map(it => (
            <TripCard key={it.id} itinerary={it} onDelete={handleDelete} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit parcial (sem TripCard ainda)**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat(dashboard): add grid/list view toggle"
```

---

## Task 7: TripCard — foto Unsplash, fallback, modo lista

**Files:**
- Modify: `frontend/src/components/Dashboard/TripCard.tsx`

- [ ] **Step 1: Reescrever `TripCard.tsx`**

O componente agora aceita `view: 'grid' | 'list'`. Gera URL do Unsplash com base no destino. Fallback definido se a imagem falhar.

```tsx
import { Link } from 'react-router-dom'
import { Itinerary } from '../../types'
import { Badge, STATUS_BADGE } from '../UI/Badge'
import { Button } from '../UI/Button'

interface TripCardProps {
  itinerary: Itinerary
  onDelete: (id: string) => void
  view: 'grid' | 'list'
}

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado: 'Moderado',
  luxo: 'Luxo',
}

const STATUS_LABELS: Record<string, string> = {
  draft:  'Rascunho',
  saved:  'Planejado',
  done:   'Concluído',
  error:  'Erro',
}

function getUnsplashUrl(destination: string): string {
  const query = encodeURIComponent(destination.split(',')[0].trim())
  return `https://source.unsplash.com/featured/400x200?${query},travel,city`
}

function PhotoFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FED7AA, #EA580C)' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    </div>
  )
}

export function TripCard({ itinerary, onDelete, view }: TripCardProps) {
  const badge = (
    <Badge
      variant={STATUS_BADGE[itinerary.status] ?? 'draft'}
      label={STATUS_LABELS[itinerary.status] ?? 'Rascunho'}
    />
  )

  if (view === 'list') {
    return (
      <div className="flex overflow-hidden rounded-xl border border-surface-border bg-surface">
        {/* Miniatura */}
        <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden">
          <img
            src={getUnsplashUrl(itinerary.destination)}
            alt={itinerary.destination}
            className="h-full w-full object-cover"
            onError={e => {
              const img = e.currentTarget as HTMLImageElement
              img.style.display = 'none'
              const fallback = img.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div className="absolute inset-0 hidden">
            <PhotoFallback />
          </div>
        </div>

        {/* Dados */}
        <div className="flex flex-1 items-center gap-8 px-5 py-3">
          <div className="min-w-[140px]">
            <h3 className="text-sm font-bold text-content">{itinerary.title}</h3>
            <p className="mt-0.5 text-xs text-content-muted">{itinerary.destination}</p>
          </div>
          <div className="hidden sm:flex gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Período</p>
              <p className="mt-0.5 text-[13px] font-semibold text-content">
                {itinerary.start_date} – {itinerary.end_date}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Orçamento</p>
              <p className="mt-0.5 text-[13px] font-semibold text-content">{BUDGET_LABELS[itinerary.budget]}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Status</p>
              <div className="mt-0.5">{badge}</div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 px-4">
          <Link to={`/preview/${itinerary.id}`}>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface text-content-muted transition-colors hover:text-content" aria-label="Ver roteiro">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </Link>
          <button
            onClick={() => onDelete(itinerary.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface text-content-muted transition-colors hover:text-status-error-text"
            aria-label="Excluir viagem"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Modo grade
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface transition-shadow hover:shadow-md">
      {/* Foto */}
      <div className="relative h-[130px]">
        <img
          src={getUnsplashUrl(itinerary.destination)}
          alt={itinerary.destination}
          className="h-full w-full object-cover"
          onError={e => {
            const img = e.currentTarget as HTMLImageElement
            img.style.display = 'none'
            const fallback = img.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="absolute inset-0 hidden">
          <PhotoFallback />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-content">
          {itinerary.start_date} – {itinerary.end_date}
        </span>
      </div>

      {/* Corpo */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-content">{itinerary.title}</h3>
        <p className="mt-0.5 text-xs text-content-muted">{itinerary.destination}</p>

        <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3">
          <span className="text-xs text-content-muted">{BUDGET_LABELS[itinerary.budget]}</span>
          {badge}
        </div>

        <div className="mt-3 flex gap-2">
          <Link to={`/preview/${itinerary.id}`} className="flex-1">
            <Button variant="secondary" className="w-full text-xs">Ver roteiro</Button>
          </Link>
          <Button variant="danger" onClick={() => onDelete(itinerary.id)} className="text-xs">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
cd frontend && npm run test -- --run
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Dashboard/TripCard.tsx
git commit -m "feat(dashboard): TripCard with Unsplash photo, fallback, and list mode"
```

---

## Task 8: EmptyState

**Files:**
- Modify: `frontend/src/components/Dashboard/EmptyState.tsx`

- [ ] **Step 1: Substituir emoji por ícone SVG e remover referência a IA**

```tsx
import { Link } from 'react-router-dom'
import { Button } from '../UI/Button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-muted">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-content">Nenhuma viagem ainda</h2>
      <p className="mb-6 max-w-xs text-sm text-content-muted">
        Planeje sua primeira aventura e receba um roteiro personalizado dia a dia.
      </p>
      <Link to="/plan">
        <Button>Criar meu primeiro roteiro</Button>
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Dashboard/EmptyState.tsx
git commit -m "feat(dashboard): replace emoji with SVG icon in EmptyState"
```

---

## Task 9: Formulário — budget cards, interest pills, sem emoji

**Files:**
- Modify: `frontend/src/pages/Plan.tsx`

- [ ] **Step 1: Atualizar `Plan.tsx`**

As mudanças são estritamente de estilo — a lógica de estado existente permanece intacta. Aplicar:

1. `<h1>` com tokens Vereda (`text-[26px] font-extrabold tracking-[-0.7px] text-content`)
2. Form card: `rounded-2xl border border-surface-border bg-surface p-8` (remover `shadow-lg`)
3. Error box: substituir `bg-red-50 text-red-600` pela estrutura com ícone SVG (igual ao LoginForm)
4. Seções separadas por `<div className="h-px bg-surface-border -mx-8" />` + `<p className="text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">` como section label
5. Budget cards: substituir as classes `border-blue-600 bg-blue-50 text-blue-600` por `border-brand bg-brand-muted text-brand-dark`; estado neutro usar `border-surface-border text-content`
6. Interest pills: substituir `border-orange-500 bg-orange-50 text-orange-600` por `border-brand bg-brand-muted text-brand-muted-text font-semibold`; estado neutro usar `border-surface-border text-content-muted`
7. Botão submit: remover `✨` — usar ícone SVG play inline ou apenas texto `Gerar Roteiro`
8. Campos de data: substituir `focus:border-blue-500 focus:ring-blue-500/30` por `focus:border-brand` e o focus ring do `index.css`

- [ ] **Step 2: Rodar testes**

```bash
cd frontend && npm run test -- --run
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Plan.tsx
git commit -m "feat(plan): apply Vereda tokens, budget cards, interest pills, remove emoji"
```

---

## Task 10: DestinationAutocomplete — dropdown com tokens

**Files:**
- Modify: `frontend/src/components/UI/DestinationAutocomplete.tsx`

- [ ] **Step 1: Verificar o componente atual**

```bash
cat frontend/src/components/UI/DestinationAutocomplete.tsx
```

- [ ] **Step 2: Aplicar tokens Vereda ao dropdown**

Substituir qualquer classe Tailwind padrão de cor (`blue-*`, `gray-*`) pelas equivalentes:
- Borda do dropdown: `border-surface-border`
- Item hover: `bg-brand-muted`
- Input: usar o componente `Input` ou aplicar as mesmas classes definidas na Task 2
- Ícone SVG de localização: `stroke-content-muted`, 14px

- [ ] **Step 3: Rodar todos os testes**

```bash
cd frontend && npm run test -- --run
```

Todos devem passar.

- [ ] **Step 4: Commit final**

```bash
git add frontend/src/components/UI/DestinationAutocomplete.tsx
git commit -m "feat(ui): apply Vereda tokens to DestinationAutocomplete dropdown"
```

---

## Verificação Final

- [ ] Iniciar o servidor de dev e percorrer todas as páginas: `/`, `/auth`, `/dashboard`, `/plan`
- [ ] Confirmar: nenhum emoji visível em qualquer tela
- [ ] Confirmar: nenhuma menção a "Gemini", "IA" ou terceiros na interface
- [ ] Confirmar: fonte DM Sans carregando em todos os elementos
- [ ] Confirmar: toggle grade/lista funciona no dashboard
- [ ] Confirmar: budget cards e interest pills respondem ao clique com cores brand
- [ ] Confirmar: focus em inputs mostra ring laranja suave
- [ ] Rodar build de produção para garantir zero erros de TypeScript:

```bash
cd frontend && npm run build
```

Esperado: build sem erros.
