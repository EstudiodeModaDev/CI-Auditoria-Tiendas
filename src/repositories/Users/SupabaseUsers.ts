import type { suabaseUserInfo } from "../../models/database/users";
import { supabase } from "../../services/supabase.service";
import type {  userFilter, UserRepository } from "./users_repository";

export class SupabaseUsers implements UserRepository {
  async loadUserById(userId: string): Promise<{ data: suabaseUserInfo | null; status: boolean; message?: string; }> {
    try {
      const { data, error } = await supabase
        .from("USUARIOS")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        return {
          data: null,
          status: false,
          message: error.message,
        }
      }

      return {
        data: data ?? null,
        status: true,
      }
    } catch (e: any) {
      return {
        data: null,
        status: false,
        message: e?.message ?? String(e),
      }
    }
  }

  async validateUserExists(filter: userFilter): Promise<{ exists: boolean; data: suabaseUserInfo | null; status: boolean; message?: string; }> {
    try{
      const {data, error} = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("id", filter.user_id)
      .single()

      if(error){
        return{
          data: null,
          status: false,
          message: error.message,
          exists: false
        }
      }

      return {
        data,
        status: true,
        exists: true
      }
    }catch(e: any){
      return{
        data: null,
        status: false,
        message: e,
        exists: false
      }
    }
  }
  
  async createUser(payload: suabaseUserInfo): Promise<{ status: boolean; message?: string }> {
    try{
      const {error} = await supabase
        .from("USUARIOS")
        .insert(payload).
        select("*").
        single()

      if(error){
        return {
          status: false,
          message: error.message
        }
      }

      return {
        status: true,
      }
    } catch(e: any) {
      return{
        status: false,
        message: e
      }
    }
  }

  
}
