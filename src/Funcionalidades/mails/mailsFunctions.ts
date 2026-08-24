import type { auditor } from "../../models/database/auditor"
import type { planAccion, planAccionSeguimiento } from "../../models/database/plan_accion"
import type { tienda } from "../../models/database/tienda"
import { enviarCorreo, type EnviarCorreoPayload } from "../../services/Mail.service"
import { formatDate } from "../shared/date"


const mode=import.meta.env.VITE_SITE_MODE ?? "prod"

export async function actionPlanReturnedNotification(plan: planAccion, causa: string, tienda: tienda, auditor: auditor) {
  const auditorMail = mode === "prod" ? auditor.correo : "dpalacios@estudiodemoda.com.co" 
  const tiendaMail = mode === "prod" ? tienda.correo_tienda : "dpalacios@estudiodemoda.com.co" 
  const payload: EnviarCorreoPayload = {
    message: {
      body: {
        contentType: "HTML",
        content: `
          <div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

            <!-- Encabezado -->
            <div style="background:#dc2626;padding:18px;text-align:center;">
              <h2 style="margin:0;color:#ffffff;font-size:22px;">
                Plan de Acción Devuelto
              </h2>
            </div>

            <!-- Contenido -->
            <div style="padding:24px;color:#374151;line-height:1.6;">

              <p>Hola,</p>

              <p>
                <strong>Control Interno</strong> revisó el Plan de Acción y determinó que requiere ajustes antes de continuar con el proceso.
              </p>

              <div style="background:#f9fafb;border-left:4px solid #dc2626;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0 0 10px 0;">
                    <strong>Plan de Acción:</strong> PA-${plan.id_plan_accion}
                </p>

                <p style="margin:0;">
                    <strong>Motivo de la devolución:</strong><br>
                    ${causa}
                </p>
            </div>

            <p>
                Por favor, realiza las correcciones correspondientes y vuelve a enviar el Plan de Acción para su revisión.
            </p>

            <!-- Botón -->
            <div style="text-align:center;margin:32px 0;">
              <a href=${import.meta.env.VITE_SITE_URL}plan-accion-respuesta/${plan.id_plan_accion}/:${plan.id_auditoria} target="_blank"
                style="display:inline-block;background:#dc2626;color:#ffffff;
                        text-decoration:none;padding:14px 28px;border-radius:6px;
                        font-weight:bold;font-size:15px;">
                  Abrir Plan de Acción
              </a>
            </div>

            <!-- Link de respaldo -->
            <p style="font-size:13px;color:#6b7280;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </p>

            <p style="word-break:break-all;font-size:13px;">
                <a href="${import.meta.env.VITE_SITE_URL}plan-accion-respuesta/${plan.id_plan_accion}/:${plan.id_auditoria}" style="color:#2563eb;">
                    Link
                </a>
            </p>

        </div>

        <!-- Pie -->
        <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
            Este es un mensaje automático. Por favor, no respondas este correo.
        </div>

      </div>`
      },
      ccRecipients: [
        {emailAddress: {
          address: auditorMail
          
          }
        }
      ],
      toRecipients: [
        {emailAddress :{  
            address : tiendaMail
        } 
      }
      ],
      subject: "Plan de acción devuelto"
    },
    senderMail: "alert@estudiodemoda.com.co",
    saveToSentItems: true,
  }
  await enviarCorreo(payload)
}

export async function actionPlanApprovedNotification(plan: planAccion, tienda: tienda, auditor: auditor) {
  const auditorMail = mode === "prod" ? auditor.correo : "dpalacios@estudiodemoda.com.co" 
  const tiendaMail = mode === "prod" ? tienda.correo_tienda : "dpalacios@estudiodemoda.com.co" 
  const payload: EnviarCorreoPayload = {
    message: {
      body: {
        contentType: "HTML",
        content: `
          <div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

            <!-- Encabezado -->
            <div style="background:#16a34a;padding:18px;text-align:center;">
              <h2 style="margin:0;color:#ffffff;font-size:22px;">
                ✅ Plan de Acción Validado
              </h2>
            </div>

            <!-- Contenido -->
            <div style="padding:24px;color:#374151;line-height:1.6;">

              <p>Hola,</p>

              <p>
                Nos complace informarte que el <strong>Plan de Acción</strong> fue revisado y
                <strong>validado satisfactoriamente</strong> por Control Interno.
              </p>

              <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:24px 0;border-radius:4px;">

                <p style="margin:0 0 10px 0;">
                  <strong>Plan de Acción:</strong> PA-${plan.id_plan_accion}
                </p>

                <p style="margin:0;">
                  <strong>Estado:</strong>
                  <span style="color:#16a34a;font-weight:bold;">
                    Cerrado
                  </span>
                </p>

              </div>

              <p>
                No se requieren acciones adicionales sobre este plan. El proceso ha sido finalizado correctamente.
              </p>


            <!-- Pie -->
            <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
              Este es un mensaje automático. Por favor, no respondas este correo.
            </div>

        </div>
        `
      },
      ccRecipients: [
        {emailAddress: {
          address: auditorMail
          
          }
        }
      ],
      toRecipients: [
        {emailAddress :{  
            address : tiendaMail
        } 
      }
      ],
      subject: "Plan de acción aprobado"
    },
    senderMail: "alert@estudiodemoda.com.co",
    saveToSentItems: true,
  }
  await enviarCorreo(payload)
}

export async function actionPlanCreatedNotification(plan: planAccion, tienda: tienda, auditor: auditor, area: string) {
  const auditorMail = mode === "prod" ? auditor.correo : "dpalacios@estudiodemoda.com.co" 
  const tiendaMail = mode === "prod" ? tienda.correo_tienda : "dpalacios@estudiodemoda.com.co" 
  const payload: EnviarCorreoPayload = {
    message: {
      body: {
        contentType: "HTML",
        content: `
          <div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

            <!-- Encabezado -->
            <div style="background:#2563eb;padding:20px;text-align:center;">
              <h2 style="margin:0;color:#ffffff;font-size:22px;">
                📋 Nuevo Plan de Acción Asignado
              </h2>
            </div>

            <!-- Contenido -->
            <div style="padding:24px;color:#374151;line-height:1.6;">

              <p style="margin-top:0;">
                Hola,
              </p>

              <p>
                Se ha generado un nuevo <strong>Plan de Acción</strong> derivado del siguiente hallazgo:
              </p>

              <div style="background:#f9fafb;border-left:4px solid #2563eb;padding:14px 16px;border-radius:6px;margin:20px 0;">
                <strong>Hallazgo:</strong><br>
                ${plan.descripcion_hallazgo}
              </div>

              <h3 style="margin-bottom:12px;color:#1f2937;font-size:18px;">
                Información del Plan
              </h3>

              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr style="background:#f3f4f6;">
                  <td><strong>Código</strong></td>
                  <td>${plan.id_plan_accion}</td>
                </tr>
                <tr>
                  <td><strong>Tienda</strong></td>
                  <td>${tienda.nombre}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td><strong>Área responsable</strong></td>
                  <td>${area}</td>
                </tr>
                <tr>
                  <td><strong>Prioridad</strong></td>
                  <td><strong>${plan.prioridad}</strong></td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td><strong>Fecha compromiso</strong></td>
                  <td>${formatDate(new Date(plan.fecha_compromiso))}</td>
                </tr>
              </table>

              <!-- Botón -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${import.meta.env.VITE_SITE_URL}plan-accion-respuesta/${plan.id_plan_accion}/:${plan.id_auditoria}"
                  style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">
                  Ingresar a la aplicación
                </a>
              </div>

              <p style="margin-bottom:0;">
                Ingrese a la aplicación para iniciar la gestión del Plan de Acción.
              </p>

            </div>

            <!-- Pie -->
            <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
              Este es un mensaje generado automáticamente. Por favor, no responda este correo.
            </div>

          </div>
        `
      },
      ccRecipients: [
        {emailAddress: {
          address: auditorMail
          
          }
        }
      ],
      toRecipients: [
        {emailAddress :{  
            address : tiendaMail
        } 
      }
      ],
      subject: "Notificación creación de plan de acción"
    },
    senderMail: "alert@estudiodemoda.com.co",
    saveToSentItems: true,
  }
  await enviarCorreo(payload)
}

export async function actionPlanUpdattedNotification(plan: planAccion, auditor: auditor, respuesta: planAccionSeguimiento) {
  const auditorMail = mode === "prod" ? auditor.correo : "dpalacios@estudiodemoda.com.co" 
  const body = `
    <div style="max-width:600px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; color:#1f2937;">

      <!-- Encabezado -->
      <div style="background:#2563eb; padding:22px; text-align:center;">
        <h2 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">
          Actualización del Plan de Acción
        </h2>

        <p style="margin:8px 0 0;color:#dbeafe; font-size:14px;">
          Plan PA-${plan.id_plan_accion}
        </p>
      </div>

      <!-- Contenido -->
      <div style="padding:28px 24px;">

        <p style=" margin:0 0 20px; font-size:16px; line-height:1.6;">
          Se registró una nueva actualización en el Plan de Acción.
        </p>

        <!-- Tarjeta de información -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:8px; padding:18px; margin-bottom:22px;">

          <p style="margin:0;">
            <strong>Comentario:</strong><br>
            <span style="color:#4b5563; line-height:1.6;">
              ${respuesta.comentario}
            </span>
          </p>

        </div>

        <p style="margin:0 0 24px; font-size:15px; color:#4b5563;line-height:1.6;">
          Ingrese a la aplicación para revisar el avance registrado y realizar el seguimiento correspondiente.
        </p>
         <!-- Botón -->
        <div style="text-align:center;">
          <a
            href="${import.meta.env.VITE_SITE_URL}plan-accion/"
            style="
              display:inline-block;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              font-size:15px;
              font-weight:700;
              padding:13px 28px;
              border-radius:7px;
            "
          >
            Ir a la aplicación
          </a>
        </div>

      </div>

      <!-- Pie -->
      <div style="
        background:#f9fafb;
        border-top:1px solid #e5e7eb;
        padding:16px 24px;
        text-align:center;
      ">
        <p style="
          margin:0;
          color:#6b7280;
          font-size:12px;
        ">
          Este es un mensaje automático. Por favor, no responda a este correo.
        </p>
      </div>

    </div>
  `.trim();
  const payload: EnviarCorreoPayload = {
    message: {
      body: {
        contentType: "HTML",
        content: body
      },
      ccRecipients: [ ],
      toRecipients: [
        {emailAddress :{  
            address : auditorMail
        } 
      }
      ],
      subject: "Notificación actualización de plan de acción"
    },
    senderMail: "alert@estudiodemoda.com.co",
    saveToSentItems: true,
  }
  await enviarCorreo(payload)
}



