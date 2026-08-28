import type { ReactNode } from 'react'
import React from 'react'
import { NavLink, useNavigate } from 'react-router'
import './app-shell.css'
import { supabase } from '../../services/supabase.service'
import { useSupabaseSession } from '../../auth/hooks/useSupabaseSession'
import { getNavigationByRole } from '../../auth/utils/navigationByRole'
import type { UserRole } from '../../models/auth/roles'

type AppShellProps = {
  children: ReactNode
}

function getUserLabel(email: string | undefined) {
  return email ?? 'Usuario autenticado'
}

function getRoleLabel(role: UserRole) {
  if (role === 'admin') return 'Administrador'
  if (role === 'auditor') return 'Auditor'
  if (role === 'supervisor') return 'Supervisor'
  return 'Usuario autenticado'
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate()
  const { session, role } = useSupabaseSession()
  const navItems = getNavigationByRole(role)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className={isCollapsed ? 'app-shell app-shell--collapsed' : 'app-shell'}>
      <aside className="app-shell__sidebar" aria-label="Navegacion principal">
        <div className="app-shell__brand">
          <span className="app-shell__brand-badge">ACI</span>
          <div className="app-shell__brand-copy">
            <strong>Control Interno</strong>
            <p>Auditorias operativas</p>
          </div>
          <button
            className="app-shell__collapse"
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Contraer menu lateral'}
            aria-pressed={isCollapsed}
          >
            {isCollapsed ? '>' : '<'}
          </button>
        </div>

        <nav className="app-shell__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'app-shell__nav-item app-shell__nav-item--active' : 'app-shell__nav-item'}
              title={item.label}
            >
              <span className="app-shell__nav-short" aria-hidden="true">{item.label.charAt(0)}</span>
              <span className="app-shell__nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-shell__sidebar-footer">
          <p className="app-shell__user">{getUserLabel(session?.user.email)}</p>
          <span className="app-shell__role">{getRoleLabel(role)}</span>
          <button className="app-shell__signout" type="button" onClick={handleSignOut}>
            <span className="app-shell__signout-short" aria-hidden="true">{session?.user.email ? session?.user.email[0].toLocaleUpperCase() : ""}</span>
            <span className="app-shell__signout-label">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-shell__topbar">
          <div>
            <strong>Panel de trabajo</strong>
            <p>Accede a tus rutas segun el rol asignado.</p>
          </div>
          <button className="app-shell__signout app-shell__signout--topbar" type="button" onClick={handleSignOut}>
            Salir
          </button>
        </header>

        <div className="app-shell__page">
          {children}
        </div>
      </div>
    </div>
  )
}
