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
