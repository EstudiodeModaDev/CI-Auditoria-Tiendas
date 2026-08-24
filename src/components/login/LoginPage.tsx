import { useLocation, useNavigate } from 'react-router';
import { clearPostLoginRedirectPending, consumePostLoginRedirectPending, hasPostLoginRedirectPending, signInWithMicrosoft } from '../../auth/supabase.auth'
import './LoginPage.css'
import React from 'react';
import { supabase } from '../../services/supabase.service';
import { getUserInfo } from '../../auth/supabase.session.validation';
import { createUserInDatabase, isUserCreate } from '../../Funcionalidades/user-role/utils/getuserRole';
import { SupabaseUsers } from '../../repositories/Users/SupabaseUsers';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userController = React.useMemo(() => new SupabaseUsers(), [])
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = React.useState(false);
  const [error, setError] = React.useState("");
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/home";
  const shouldRedirectAfterLogin = hasPostLoginRedirectPending();
  const hasAuthCallbackParams =
    typeof window !== "undefined" &&
    /(?:^#|[?#&])(code|error|id_token|access_token)=/i.test(
      `${window.location.search}${window.location.hash}`,
    );

  React.useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      try {
        if ((hasAuthCallbackParams || shouldRedirectAfterLogin) && !cancelled) {
          setIsProcessingRedirect(true);
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (cancelled) return;

        if(data.session){
          const session = await getUserInfo()

          if(!session) return

          const isCreated = await isUserCreate({user: session, validateUserExists: userController.validateUserExists,})

          if(!isCreated){
            await createUserInDatabase({user: session, createUser: userController.createUser})
          }
        }

        if (data.session && shouldRedirectAfterLogin) {
          consumePostLoginRedirectPending();
          navigate(redirectTo, { replace: true });
          return;
        }

        if (data.session && !hasAuthCallbackParams) {
          navigate(redirectTo, { replace: true });
          return;
        }

        setIsProcessingRedirect(false);
      } catch (sessionError) {
        console.error("Error sincronizando sesion con Supabase", sessionError);
        if (!cancelled) {
          setIsProcessingRedirect(false);
        }
      }
    };

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [hasAuthCallbackParams, navigate, redirectTo, shouldRedirectAfterLogin]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await signInWithMicrosoft();
    } catch (err) {
      console.error("Error iniciando sesion con Graph", err);
      clearPostLoginRedirectPending();
      setError("No fue posible iniciar sesion con Microsoft Graph. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  if (isProcessingRedirect) {
    return (
      <main className="login-screen">
        <section className="login-card">
          <p className="login-eyebrow">Microsoft Graph</p>
          <h1 className="login-title">Completando autenticacion.</h1>
          <p className="login-copy">Estamos terminando el inicio de sesion y validando tu sesion en esta pagina.</p>
        </section>
      </main>
    );
  }
  
  return (
    <main className="login-page">
      <section className="login-page__hero">
        <span className="login-page__eyebrow">Auditorias Control Interno</span>
        <h1>Bienvenido de nuevo</h1>


        <div className="login-page__highlights" aria-label="Beneficios de la plataforma">
          <article>
            <strong>Control centralizado</strong>
          </article>
          <article>
            <strong>Trazabilidad clara</strong>
          </article>
          <article>
            <strong>Operación ágil</strong>
          </article>
        </div>
      </section>

      <section className="login-page__panel" aria-label="Inicio de sesion">
        <div className="login-page__panel-header">
          <span className="login-page__panel-kicker">Inicio de sesion</span>
          <h2>Ingresa a tu cuenta</h2>
          <p>Usa tus credenciales corporativas para continuar.</p>
        </div>

        <form className="login-page__form">

          <button className="login-page__submit" type="button" onClick={() => handleLogin()}>
            {isSubmitting ? "Conectando..." : "Entrar con Microsoft"}
          </button>
        </form>
        {error ? <p className="login-error">{error}</p> : null}

      </section>
    </main>
  )
}
