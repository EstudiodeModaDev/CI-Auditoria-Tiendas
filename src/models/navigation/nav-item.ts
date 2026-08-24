import type { UserRole } from '../auth/roles'

export type NavItem = {
  label: string
  to: string
  allowedRoles: UserRole[]
}
