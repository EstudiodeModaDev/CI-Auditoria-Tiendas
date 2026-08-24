import toast from "react-hot-toast";
import { supabase } from "../services/supabase.service";
import type { userInfo } from "../models/auth";

export async function validateSession(): Promise<boolean>{
  const {data, error} = await supabase.auth.getSession()
  
  if(error){
    toast.error(error.message)
    return false
  }

  const isLoggedIn = !!data.session

  return isLoggedIn
}

export async function getUserInfo(): Promise<userInfo | null>{
  const {data, error} = await supabase.auth.getSession()
  
  if(error){
    toast.error(error.message)
    return null
  }

  const user: userInfo = {
    error: "",
    session:{
      access_token: data.session?.access_token,
      expires_at: data.session?.expires_at,
      expires_in: data.session?.expires_in,
      refresh_token: data.session?.refresh_token,
      token_type: data.session?.token_type,
      user:{
        aud: data.session?.user.aud,
        email: data.session?.user.email,
        id: data.session?.user.id,
        role: data.session?.user.role
      },
    }
  }

  return user
}