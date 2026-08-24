export type UserRole = 'authenticated' | 'admin' | 'auditor' | 'supervisor'

export function mapRoleIdToUserRole(roleId: number | null | undefined): UserRole {
  console.log(roleId)
  if (roleId === 1) return 'admin'
  if (roleId === 3) return 'auditor'
  if (roleId === 2) return 'authenticated'
  return 'authenticated'
}
