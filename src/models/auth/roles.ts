export type UserRole = 'authenticated' | 'admin' | 'auditor' | 'jefe-zona'

export function mapRoleIdToUserRole(roleId: number | null | undefined): UserRole {
  console.log(roleId)
  if (roleId === 1) return 'admin'
  if (roleId === 3) return 'auditor'
  if (roleId === 2) return 'authenticated'
  if (roleId === 4) return 'jefe-zona'
  return 'authenticated'
}
