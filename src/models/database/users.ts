export type role = {
  id?: number
  role_name: string
}

export type suabaseUserInfo = {
  nombre: string,
  correo: string,
  role_id?: number
  id?: string
}