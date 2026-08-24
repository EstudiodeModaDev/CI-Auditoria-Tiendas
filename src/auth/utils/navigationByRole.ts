import type { NavItem } from '../../models/navigation/nav-item'
import type { UserRole } from '../../models/auth/roles'

export const appNavItems: NavItem[] = [
  { label: 'Inicio', to: '/home', allowedRoles: ['admin', 'auditor'] },
  { label: 'Planes de accion', to: '/plan-accion', allowedRoles: ['admin', 'auditor'] },
  { label: 'Nueva auditoria', to: '/nueva-auditoria', allowedRoles: ['admin', 'auditor'] },
  { label: 'Exportar Excel', to: '/exportar-excel', allowedRoles: ['admin', 'auditor'] },
  { label: 'Configuraciones', to: '/configuraciones', allowedRoles: ['admin'] },
]

export function getNavigationByRole(role: UserRole) {
  return appNavItems.filter((item) => item.allowedRoles.includes(role))
}
