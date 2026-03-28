import { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'

interface RegisterFormProps {
  onRegister: (email: string, password: string) => Promise<void>
}

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !email.includes('@')) {
      setError('Informe um e-mail válido')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
      <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} aria-label="Senha" placeholder="Mínimo 8 caracteres" />
      <Input label="Confirmar senha" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required aria-label="Confirmar senha" placeholder="Repita a senha" />
      <Button type="submit" loading={loading} className="mt-1 w-full py-3">Criar conta</Button>
    </form>
  )
}
