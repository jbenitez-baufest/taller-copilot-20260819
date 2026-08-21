import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }
  return <Outlet />
}
