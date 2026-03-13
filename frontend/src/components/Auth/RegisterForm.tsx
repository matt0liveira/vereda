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
      <h2 className="text-2xl font-bold text-gray-900">Criar Conta</h2>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required aria-label="E-mail" />
      <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-label="Senha" />
      <Button type="submit" loading={loading}>Criar conta</Button>
    </form>
  )
}
