import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos'
  if (message.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar'
  if (message.includes('User already registered')) return 'Este e-mail já está cadastrado'
  if (message.includes('rate limit') || message.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente'
  if (message.includes('Password should be')) return 'A senha deve ter no mínimo 8 caracteres'
  if (message.includes('Unable to validate email')) return 'E-mail inválido'
  return 'Ocorreu um erro. Tente novamente'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(translateAuthError(error.message))
  }

  async function register(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(translateAuthError(error.message))
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, loading, login, register, logout }
}
