import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSupabaseSession } from '../../auth/hooks/useSupabaseSession'
import type { UserRole } from '../../models/auth/roles'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { loading, isAuthenticated, role } = useSupabaseSession()

  if (loading) {
    return (
      <main className="login-page">
        <section className="login-page__panel" aria-label="Validando sesion">
          <div className="login-page__panel-header">
            <span className="login-page__panel-kicker">Validando sesion</span>
            <h2>Estamos comprobando tu acceso</h2>
            <p>Un momento mientras verificamos tu sesion activa.</p>
          </div>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace state={{ from: location }} />
  }

  return <>{children}</>
}
