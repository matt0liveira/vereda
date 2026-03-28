import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout/Layout'
import { PrivateRoute } from './components/Auth/PrivateRoute'
import { Landing as LandingPage } from './pages/Landing'
import AuthPage from './pages/Auth'
import PlanPage from './pages/Plan'
import PreviewPage from './pages/Preview'
import DashboardPage from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          <Route element={<PrivateRoute />}>
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/plan/:id" element={<PlanPage />} />
            <Route path="/preview/:id" element={<PreviewPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
