import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../UI/Spinner'

export function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <Outlet /> : <Navigate to="/auth" replace />
}
