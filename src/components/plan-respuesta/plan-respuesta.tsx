import React from 'react'
import './offline-input-page.css'
import { usePlanAccion } from '../../Funcionalidades/form-plan-accion/hooks/usePlanAccion'
import toast from 'react-hot-toast'
import type { planAccion } from '../../models/database/plan_accion'
import type { tienda } from '../../models/database/tienda'
import { useEvidenciasAttachmentsForm } from '../../Funcionalidades/evidencias-attachments/evidenciasAttachmentsForm'
import { usePlanAccionRespuestas } from '../../Funcionalidades/RespuestaPlanAccion/hooks/usePlanAccionRespuestas'

type OfflineInputPageProps = {
  auditoriaId: number | null
  planAccionId: number | null
  tiendas: tienda[]
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function PlanRespuesta({ auditoriaId, planAccionId, tiendas }: OfflineInputPageProps) {
  const filesController = useEvidenciasAttachmentsForm()
  const planAccionController = usePlanAccion()
  const [plan, setPlan] = React.useState<planAccion | null>(null)
  const respuestasController = usePlanAccionRespuestas(planAccionId, filesController.attachments)

  React.useEffect(() => {
    async function loadPlanAccion(): Promise<planAccion | null>{
      const response = await planAccionController.loadSpecificPlanAccion(String(planAccionId))
      
      if(!response.ok){
        toast.error(response.errorMessage ?? "Ha ocurrido un error cargando el plan de acción")
        return null
      }
      setPlan(response.data)
      return response.data
    }

    loadPlanAccion()
  }, [auditoriaId, planAccionId,])


  async function handleSubmit() {
    const response = await respuestasController.handleCreate()

    if (!response.ok) {
      return
    }

    filesController.resetAttachments()
  }


  return (
    <main className="offline-input-page">
      <section className="offline-input-page__hero">
        <div>
          <h1>Respuesta a plan de acción</h1>
          <div className="offline-input-page__hero-tags">
            <span>Plan de accion: {planAccionId ?? 'Sin definir'}</span>
            <span>Auditoria: {auditoriaId ?? 'Sin definir'}</span>
            <span>Tienda: {tiendas.find((t) => {return t.id_tienda === plan?.id_tienda})?.nombre ?? 'Sin definir'}</span>
          </div>
        </div>
      </section>

      <section className="offline-input-page__panel">
        <div className="offline-input-page__panel-heading">
          <div>
            <span>Da respuesta a tu plan de accion:</span>
          </div>
        </div>

        <div className="offline-input-page__grid">

          <label className="offline-input-page__field offline-input-page__field--full">
            <span>Observacion</span>
            <input
              type="text"
              value={respuestasController.state.comentario}
              onChange={(event) => respuestasController.setField('comentario', event.target.value)}
              placeholder="Escribe aqui la respuesta del plan de accion"
            />
            {respuestasController.planErrors.comentario ? (
              <small className="offline-input-page__error">{respuestasController.planErrors.comentario}</small>
            ) : null}
          </label>

          <label className="offline-input-page__field offline-input-page__field--full">
            <span>Archivos</span>
            <div className="offline-input-page__upload">
              <input 
                type="file" 
                multiple 
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  filesController.addAttachment(files)
                }} 
              />
              <p>Selecciona uno o varios archivos desde tu equipo.</p>
            </div>

            {filesController.attachments.length === 0 ? (
              <p className="offline-input-page__empty">Todavia no has seleccionado archivos.</p>
            ) : (
              <div className="offline-input-page__file-list">
                {filesController.attachments.map((file) => (
                  <article className="offline-input-page__file-card" key={`${file.name}-${file.lastModified}`}>
                    <strong>{file.name}</strong>
                    <p>{formatFileSize(file.size)}</p>
                  </article>
                ))}
              </div>
            )}

          </label>
        </div>

        <div className="offline-input-page__footer">
          <div className="offline-input-page__summary">
            <strong>Usuario actual</strong>
            <p>{respuestasController.state.usuario || 'Usuario no identificado'}</p>
          </div>

          <button
            className="offline-input-page__button offline-input-page__button--primary"
            type="button"
            onClick={handleSubmit}
            disabled={respuestasController.loading}
          >
            {respuestasController.loading ? 'Guardando...' : 'Guardar respuesta'}
          </button>
        </div>
      </section>
    </main>
  )
}
