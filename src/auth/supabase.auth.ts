import { supabase } from '../services/supabase.service'

const POST_LOGIN_REDIRECT_KEY = "post_login_redirect_pending";

export function markPostLoginRedirectPending() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, "true");
}

export function consumePostLoginRedirectPending() {
  if (typeof window === "undefined") return false;

  const isPending = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) === "true";

  if (isPending) {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return isPending;
}

export function hasPostLoginRedirectPending() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) === "true";
}

export function clearPostLoginRedirectPending() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
}



export async function signInWithMicrosoft() {
  markPostLoginRedirectPending()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email',
      redirectTo: 'https://ashy-water-0d0097d1e.7.azurestaticapps.net/', //TODO: POner la URL final
      //redirectTo: mode === "dev" ? "http://localhost:5173/" :'https://ashy-water-0d0097d1e.7.azurestaticapps.net/', //TODO: POner la URL final
    },
  })

  if (error) throw error
}
