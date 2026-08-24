import { Link, useLocation } from 'react-router'
import './NotAuthorizedPage.css'

export function NotAuthorizedPage() {
  const location = useLocation()
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  return (
    <main className="not-authorized-page">
      <section className="not-authorized-page__card">
        <span className="not-authorized-page__eyebrow">Acceso restringido</span>
        <h1>No tienes permiso para entrar aqui</h1>
        <p>
          Tu usuario no tiene acceso a esta ruta. Si crees que esto es un error, solicita el permiso correspondiente.
        </p>
        {fromPath ? <small>Ruta solicitada: {fromPath}</small> : null}
        <div className="not-authorized-page__actions">
          <Link className="not-authorized-page__button not-authorized-page__button--primary" to="/">
            Ir al login
          </Link>
        </div>
      </section>
    </main>
  )
}
