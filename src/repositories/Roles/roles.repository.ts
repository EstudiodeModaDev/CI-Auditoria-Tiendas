
import type { role } from "../../models/database/users";

export type roleFilters = {
  id_role?: number | null,
}

export interface RoleRepository {
  obtainRole(filter: roleFilters) : Promise<{data: role | null, status: boolean, message?: string}>
}
