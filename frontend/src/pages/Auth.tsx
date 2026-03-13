import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/Auth/LoginForm'
import { RegisterForm } from '../components/Auth/RegisterForm'

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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => setTab('login')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => setTab('register')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Cadastrar
          </button>
        </div>
        {tab === 'login'
          ? <LoginForm onLogin={handleLogin} />
          : <RegisterForm onRegister={handleRegister} />
        }
      </div>
    </div>
  )
}
