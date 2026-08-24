type user = {
  "id"?: string,
  "aud"?: string,
  "role"?: string,
  "email"?: string,
}

type session = {
  access_token?: string,
  token_type?: string,
  "expires_in"?: number,
  "expires_at"?: number,
  "refresh_token"?: string,
  "user"?: user
}

export type userInfo = {
  "session": session
  "error": string
}