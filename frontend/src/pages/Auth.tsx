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
      <div className="w-full max-w-3xl overflow-hidden rounded-[14px] border border-surface-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel */}
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
              <p className="text-[20px] font-bold leading-[1.45] tracking-[-0.4px] text-white/90">
                "Toda grande viagem começa com um bom plano."
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/60">
                Crie roteiros personalizados em segundos.
              </p>
            </div>
          </div>

          {/* Right panel */}
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
