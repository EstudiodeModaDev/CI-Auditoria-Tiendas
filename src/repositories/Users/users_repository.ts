import type { suabaseUserInfo } from "../../models/database/users"

export type userFilter = {
  user_id?: string,
}

export interface UserRepository {
  validateUserExists(filter: userFilter) : Promise<{exists: boolean, data: suabaseUserInfo |null, status: boolean, message?: string}>
  loadUserById(userId: string): Promise<{ data: suabaseUserInfo | null; status: boolean; message?: string }>
  createUser(payload: suabaseUserInfo) : Promise<{status: boolean, message?: string}>
}
