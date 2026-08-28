import type { planAccion } from '../../models/database/plan_accion'
import React from 'react'
import { useRepositories } from '../../repositories/repositoriesContext'
import './plan-accion-detail-modal.css'
import { usePlanAccionRespuestasList } from '../../Funcionalidades/RespuestaPlanAccion/hooks/usePlanAccionRespuestasList'
import { useSupabaseSession } from '../../auth/hooks/useSupabaseSession'
import type { User } from '@supabase/supabase-js'
import { ChangeActionPlanStatus } from './plan-accion-edit-status-modal'
import type { tienda } from '../../models/database/tienda'
import type { auditoria } from '../../models/database/auditoria'
import type { auditor } from '../../models/database/auditor'

type PlanAccionDetailModalProps = {
  plan: planAccion | null
  isOpen: boolean
  onClose: () => void
  onPlanUpdated?: (updatedPlan: planAccion) => void
  tiendas: tienda[]
  auditores: auditor[]
}

type PlanAttachmentView = {
  id: string
  name: string
  url: string | null
  path: string
  bucket: string
}

type SeguimientoAttachmentsMap = Record<number, PlanAttachmentView[]>
type SeguimientoAttachmentsErrorsMap = Record<number, string | null>

function formatFieldValue(value: number | string | string[] | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Sin informacion'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Sin informacion'
  }

  return String(value)
}

function formatPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '0%'
  }

  return `${Math.round(value)}%`
}

function formatSeguimientoDate(value: Date | string | undefined) {
  if (!value) {
    return 'Fecha no disponible'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getUserName(sessionUser?: User | null) {
  if (!sessionUser) {
    return ''
  }

  return String(
    sessionUser.user_metadata?.nombre ??
    sessionUser.user_metadata?.name ??
    sessionUser.user_metadata?.full_name ??
    sessionUser.email ??
    ''
  )
}

export function PlanAccionDetailModal({ plan, isOpen, onClose, onPlanUpdated, tiendas, auditores }: PlanAccionDetailModalProps) {
  const { attachmentEvidencias, attachments, SeguimientosAttachments, auditoria: auditoriaSvc } = useRepositories()
  const { session } = useSupabaseSession()
  const [relatedAttachments, setRelatedAttachments] = React.useState<PlanAttachmentView[]>([])
  const [attachmentsLoading, setAttachmentsLoading] = React.useState(false)
  const [attachmentsError, setAttachmentsError] = React.useState<string | null>(null)
  const [seguimientoAttachments, setSeguimientoAttachments] = React.useState<SeguimientoAttachmentsMap>({})
  const [seguimientoAttachmentsErrors, setSeguimientoAttachmentsErrors] = React.useState<SeguimientoAttachmentsErrorsMap>({})
  const [seguimientoAttachmentsLoading, setSeguimientoAttachmentsLoading] = React.useState(false)
  const [currentPlan, setCurrentPlan] = React.useState<planAccion | null>(plan)
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false)
  const [auditoria, setAuditorias] = React.useState<auditoria | null>(null)

  const {
    respuestas,
    loadPlanAccionResponses,
  } = usePlanAccionRespuestasList(String(plan?.id_plan_accion ?? ''))
  const currentUserName = React.useMemo(() => getUserName(session?.user), [session?.user])
  const orderedResponses = React.useMemo(() => {
    return respuestas
      .slice()
      .sort((a, b) => new Date(b.fecha_seguimiento).getTime() - new Date(a.fecha_seguimiento).getTime())
  }, [respuestas])

  React.useEffect(() => {
    setCurrentPlan(plan)
    setIsStatusModalOpen(false)
  }, [plan])

  React.useEffect(() => {

    async function lookAuditoria() {
      if(!plan) return

      const founded = await auditoriaSvc.load(String(plan.id_auditoria))

      setAuditorias(founded.data)
    }

    lookAuditoria()
    
  }, [plan])

  React.useEffect(() => {
    let active = true

    async function loadAttachments() {
      if (!isOpen || !plan?.id_plan_accion) {
        if (active) {
          setRelatedAttachments([])
          setAttachmentsError(null)
          setAttachmentsLoading(false)
        }
        return
      }

      setAttachmentsLoading(true)
      setAttachmentsError(null)

      const relationResponse = await attachmentEvidencias.loadRelation({
        id_plan_accion: plan.id_plan_accion,
      })

      if (!active) {
        return
      }

      if (!relationResponse.status || !relationResponse.data) {
        setRelatedAttachments([])
        setAttachmentsError(relationResponse.message ?? "No fue posible cargar los adjuntos del plan.")
        setAttachmentsLoading(false)
        return
      }

      const resolvedAttachments = await Promise.all(
        relationResponse.data.map(async (attachment) => {
          const fileResponse = await attachments.loadAttachment(attachment.path, attachment.bucket)

          return {
            id: String(attachment.id ?? `${attachment.id_plan_accion}-${attachment.path}`),
            name: attachment.attachment_name,
            url: fileResponse.status ? fileResponse.url : null,
            path: attachment.path,
            bucket: attachment.bucket,
          }
        })
      )

      if (!active) {
        return
      }

      setRelatedAttachments(resolvedAttachments)
      setAttachmentsLoading(false)
    }

    loadAttachments()

    return () => {
      active = false
    }
  }, [attachmentEvidencias, attachments, isOpen, plan?.id_plan_accion])

  React.useEffect(() => {
    if (!isOpen || !plan?.id_plan_accion) {
      return
    }

    void loadPlanAccionResponses()
  }, [isOpen, loadPlanAccionResponses, plan?.id_plan_accion])

  React.useEffect(() => {
    let active = true

    async function loadSeguimientoAttachments() {
      if (!isOpen) {
        if (active) {
          setSeguimientoAttachments({})
          setSeguimientoAttachmentsErrors({})
          setSeguimientoAttachmentsLoading(false)
        }
        return
      }

      const responsesWithId = orderedResponses.filter((respuesta) => {
        return Number.isFinite(respuesta.id_seguimiento) && (respuesta.id_seguimiento ?? 0) > 0
      })

      if (responsesWithId.length === 0) {
        if (active) {
          setSeguimientoAttachments({})
          setSeguimientoAttachmentsErrors({})
          setSeguimientoAttachmentsLoading(false)
        }
        return
      }

      setSeguimientoAttachmentsLoading(true)
      setSeguimientoAttachmentsErrors({})

      const relationResults = await Promise.all(
        responsesWithId.map(async (respuesta) => {
          const seguimientoId = respuesta.id_seguimiento as number
          const relationResponse = await SeguimientosAttachments.loadRelation({
            id_plan_accion: seguimientoId,
          })

          if (!relationResponse.status || !relationResponse.data) {
            return {
              seguimientoId,
              attachments: [] as PlanAttachmentView[],
              error: relationResponse.message ?? 'No fue posible cargar los adjuntos de esta respuesta.',
            }
          }

          const resolvedAttachments = await Promise.all(
            relationResponse.data.map(async (attachment) => {
              const fileResponse = await attachments.loadAttachment(attachment.path, attachment.bucket)

              return {
                id: String(attachment.id ?? `${seguimientoId}-${attachment.path}`),
                name: attachment.attachment_name,
                url: fileResponse.status ? fileResponse.url : null,
                path: attachment.path,
                bucket: attachment.bucket,
              }
            })
          )

          return {
            seguimientoId,
            attachments: resolvedAttachments,
            error: null,
          }
        })
      )

      if (!active) {
        return
      }

      const nextAttachments: SeguimientoAttachmentsMap = {}
      const nextErrors: SeguimientoAttachmentsErrorsMap = {}

      relationResults.forEach((result) => {
        nextAttachments[result.seguimientoId] = result.attachments
        nextErrors[result.seguimientoId] = result.error
      })

      setSeguimientoAttachments(nextAttachments)
      setSeguimientoAttachmentsErrors(nextErrors)
      setSeguimientoAttachmentsLoading(false)
    }

    void loadSeguimientoAttachments()

    return () => {
      active = false
    }
  }, [SeguimientosAttachments, attachments, isOpen, orderedResponses])

  const visiblePlan = currentPlan ?? plan

  function handleOpenStatusModal() {
    setIsStatusModalOpen(true)
  }

  if (!isOpen || !visiblePlan) {
    return null
  }

  return (
    <div className="plan-accion-detail-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-labelledby="plan-accion-detail-modal-title"
        aria-modal="true"
        className="plan-accion-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="plan-accion-detail-modal__header">
          <div>
            <span className="plan-accion-detail-modal__eyebrow">Plan de accion</span>
            <h2 id="plan-accion-detail-modal-title">Detalle PA {visiblePlan.id_plan_accion ?? '-'}</h2>
          </div>

          <button className="plan-accion-detail-modal__close" type="button" onClick={onClose} aria-label="Cerrar detalle">
            X
          </button>
        </header>

        <div className="plan-accion-detail-modal__grid">
          <article className="plan-accion-detail-modal__card">
            <h3>Resumen general</h3>
            <dl className="plan-accion-detail-modal__list">
              <div>
                <dt>Estado</dt>
                <dd>{formatFieldValue(visiblePlan.estado)}</dd>
              </div>
              <div>
                <dt>Avance</dt>
                <dd>{formatPercentage(visiblePlan.porcentaje_avance)}</dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>{formatFieldValue(visiblePlan.prioridad)}</dd>
              </div>
              <div>
                <dt>Responsable</dt>
                <dd>{formatFieldValue(visiblePlan.responsable)}</dd>
              </div>
            </dl>
          </article>

          <article className="plan-accion-detail-modal__card">
            <h3>Fechas y referencias</h3>
            <dl className="plan-accion-detail-modal__list">
              <div>
                <dt>Auditoria</dt>
                <dd>{formatFieldValue(visiblePlan.id_auditoria)}</dd>
              </div>
              <div>
                <dt>Fecha de creacion</dt>
                <dd>{formatFieldValue(visiblePlan.fecha_creacion)}</dd>
              </div>
              <div>
                <dt>Fecha compromiso</dt>
                <dd>{formatFieldValue(visiblePlan.fecha_compromiso)}</dd>
              </div>
              <div>
                <dt>Area responsable</dt>
                <dd>{formatFieldValue(visiblePlan.id_area_responsable)}</dd>
              </div>
            </dl>
          </article>

          <article className="plan-accion-detail-modal__card plan-accion-detail-modal__card--full">
            <h3>Hallazgo</h3>
            <dl className="plan-accion-detail-modal__stack">
              <div>
                <dt>Tipo de hallazgo</dt>
                <dd>{formatFieldValue(visiblePlan.tipo_hallazgo)}</dd>
              </div>
              <div>
                <dt>Descripcion</dt>
                <dd>{formatFieldValue(visiblePlan.descripcion_hallazgo)}</dd>
              </div>
              <div>
                <dt>Impacto</dt>
                <dd>{formatFieldValue(visiblePlan.impacto)}</dd>
              </div>
            </dl>
          </article>

          <article className="plan-accion-detail-modal__card plan-accion-detail-modal__card--full">
            <h3>Plan correctivo</h3>
            <dl className="plan-accion-detail-modal__stack">
              <div>
                <dt>Actividad correctiva</dt>
                <dd>{formatFieldValue(visiblePlan.actividad_correctiva)}</dd>
              </div>
              <div>
                <dt>Recursos requeridos</dt>
                <dd>{formatFieldValue(visiblePlan.recursos_requeridos)}</dd>
              </div>
            </dl>
          </article>

          <article className="plan-accion-detail-modal__card plan-accion-detail-modal__card--full">
            <h3>Attachments del plan</h3>
            <div className="plan-accion-detail-modal__attachments">
              <p className="plan-accion-detail-modal__attachments-note">
                Consulta aqui los archivos y soportes que ya fueron relacionados con este plan de accion.
              </p>

              <div className="plan-accion-detail-modal__attachments-list">
                {attachmentsError ? <small>{attachmentsError}</small> : null}
                {!attachmentsError && attachmentsLoading ? <small>Cargando adjuntos...</small> : null}
                {!attachmentsError && !attachmentsLoading && relatedAttachments.length === 0 ? (
                  <small>Este plan no tiene adjuntos relacionados todavia.</small>
                ) : null}
                {!attachmentsError && !attachmentsLoading && relatedAttachments.length > 0 ? (
                  relatedAttachments.map((attachment) => (
                    attachment.url ? (
                      <a
                        className="plan-accion-detail-modal__attachment-chip"
                        href={attachment.url}
                        key={attachment.id}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {attachment.name}
                      </a>
                    ) : (
                      <span
                        className="plan-accion-detail-modal__attachment-chip plan-accion-detail-modal__attachment-chip--disabled"
                        key={attachment.id}
                      >
                        {attachment.name}
                      </span>
                    )
                  ))
                ) : null}
              </div>
            </div>
          </article>

          <article className="plan-accion-detail-modal__card plan-accion-detail-modal__card--full">
            <div className="plan-accion-detail-modal__responses-header">
              <div>
                <h3>Respuestas del plan</h3>
                <p>Historial de observaciones registradas para este plan de accion.</p>
              </div>
            </div>

            {respuestas.length === 0 ? (
              <p className="plan-accion-detail-modal__attachments-note">
                Aun no hay respuestas registradas para este plan.
              </p>
            ) : (
              <div className="plan-accion-detail-modal__responses-list">
                {orderedResponses.map((respuesta) => (
                    <article
                      className="plan-accion-detail-modal__response-card"
                      key={respuesta.id_seguimiento ?? `${respuesta.usuario}-${respuesta.fecha_seguimiento}`}
                    >
                      <div className="plan-accion-detail-modal__response-meta">
                        <p><strong>Usuario: </strong>{respuesta.usuario || 'Usuario no identificado'}</p>
                        <span>{formatSeguimientoDate(respuesta.fecha_seguimiento)}</span>
                      </div>
                      <strong>Comentario: </strong><p>{respuesta.comentario || 'Sin observacion registrada.'}</p>

                      <div className="plan-accion-detail-modal__response-attachments">
                        <strong>Adjuntos</strong>
                        <div className="plan-accion-detail-modal__response-attachments-list">
                          {seguimientoAttachmentsLoading && respuesta.id_seguimiento ? (
                            <small>Cargando adjuntos...</small>
                          ) : null}
                          {!seguimientoAttachmentsLoading && respuesta.id_seguimiento && seguimientoAttachmentsErrors[respuesta.id_seguimiento] ? (
                            <small>{seguimientoAttachmentsErrors[respuesta.id_seguimiento]}</small>
                          ) : null}
                          {!seguimientoAttachmentsLoading && !respuesta.id_seguimiento ? (
                            <small>Esta respuesta no tiene identificador para consultar adjuntos.</small>
                          ) : null}
                          {!seguimientoAttachmentsLoading &&
                          respuesta.id_seguimiento &&
                          !seguimientoAttachmentsErrors[respuesta.id_seguimiento] &&
                          (seguimientoAttachments[respuesta.id_seguimiento]?.length ?? 0) === 0 ? (
                            <small>Esta respuesta no tiene adjuntos relacionados.</small>
                          ) : null}
                          {!seguimientoAttachmentsLoading &&
                          respuesta.id_seguimiento &&
                          (seguimientoAttachments[respuesta.id_seguimiento]?.length ?? 0) > 0
                            ? seguimientoAttachments[respuesta.id_seguimiento].map((attachment) => (
                                attachment.url ? (
                                  <a
                                    className="plan-accion-detail-modal__attachment-chip"
                                    href={attachment.url}
                                    key={attachment.id}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {attachment.name}
                                  </a>
                                ) : (
                                  <span
                                    className="plan-accion-detail-modal__attachment-chip plan-accion-detail-modal__attachment-chip--disabled"
                                    key={attachment.id}
                                  >
                                    {attachment.name}
                                  </span>
                                )
                              ))
                            : null}
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </article>
        </div>

        <footer className="plan-accion-detail-modal__footer">
          <button className="plan-accion-detail-modal__button plan-accion-detail-modal__button--ghost" type="button" onClick={handleOpenStatusModal}>
            Gestionar
          </button>
        </footer>

        <ChangeActionPlanStatus 
          plan={plan} 
          isOpen={isStatusModalOpen} 
          onClose={() =>setIsStatusModalOpen(false)} 
          onPlanUpdated={onPlanUpdated}
          currentName={currentUserName} 
          tiendas={tiendas} 
          auditor={auditores.find((a) => a.id_auditor === auditoria?.id_auditor)}
        />
      </section>
    </div>
  )
}

export type { PlanAccionDetailModalProps }
