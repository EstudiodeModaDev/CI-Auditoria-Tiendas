import type { role } from "../../models/database/users";
import { supabase } from "../../services/supabase.service";
import type { roleFilters, RoleRepository } from "./roles.repository";

export class SupabaseRoles implements RoleRepository {
  
  async obtainRole(filter: roleFilters): Promise<{ data: role | null; status: boolean; message?: string; }> {
    try{
      const {data, error} = await supabase
      .from("ROLES")
      .select("*")
      .eq("id", filter.id_role)
      .single()

      if(error){
        return{
          data: null,
          status: false,
          message: error.message
        }
      }

      return {
        data,
        status: true,
      }
    }catch(e: any){
      return{
        data: null,
        status: false,
        message: e
      }
    }
  }
  
}