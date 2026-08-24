import type { userInfo } from "../../../models/auth"
import type { suabaseUserInfo } from "../../../models/database/users"
import type { userFilter } from "../../../repositories/Users/users_repository"

type isUserCreateProps = {
  user: userInfo
  validateUserExists: (filter: userFilter) => Promise<{exists: boolean, data: suabaseUserInfo |null, status: boolean, message?: string}>
}

export async function isUserCreate({user, validateUserExists}: isUserCreateProps): Promise<Boolean>{
  try {
    const response = await validateUserExists({user_id: user.session.user?.id})
    
    if(!response.status){
      return false
    }

    if(!response.exists){
      return false
    }

    return true
  } catch(e: any){
    return false
  }
}

type createUserInDatabaseProps = {
  user: userInfo
  createUser: (payload: suabaseUserInfo) => Promise<{status: boolean, message?: string}>
}

export async function createUserInDatabase({user, createUser}: createUserInDatabaseProps): Promise<Boolean>{
  try {
    const response = await createUser({
      correo: user.session.user?.email ?? "",
      nombre: "",
      role_id: 2,
      id: user.session.user?.id
    })

    if(!response.status){
      return false
    }

    return true
  } catch(e: any){
    return false
  }
}