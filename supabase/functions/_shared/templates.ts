import type { AreaResponsable, ActionPlan, Auditor, GraphSendMailPayload, Tienda } from "./types.ts";

type NotificationMailContext = {
  plan: ActionPlan;
  auditor: Auditor | null;
  tienda: Tienda | null;
  area: AreaResponsable | null;
  siteUrl: string;
  fallbackTo: string;
  mode: string;
};

type NotificationCardConfig = {
  subject: string;
  headline: string;
  message: string;
  daysInfo: string;
  accentColor: string;
  accentTextColor: string;
  cardBackground: string;
  cardBorder: string;
};

function getRecipients({
  plan,
  auditor,
  tienda,
  fallbackTo,
  mode,
}: Pick<NotificationMailContext, "plan" | "auditor" | "tienda" | "fallbackTo" | "mode">) {
  const toAddress = mode === "prod"
    ? plan.correo_responsable || tienda?.correo_tienda || fallbackTo
    : fallbackTo;

  const ccAddress = mode === "prod"
    ? auditor?.correo || fallbackTo
    : fallbackTo;

  return {
    toRecipients: [
      {
        emailAddress: {
          address: toAddress,
        },
      },
    ],
    ccRecipients: ccAddress
      ? [
        {
          emailAddress: {
            address: ccAddress,
          },
        },
      ]
      : [],
  };
}

function buildBaseNotificationMail(
  {
    plan,
    auditor,
    tienda,
    area,
    siteUrl,
    fallbackTo,
    mode,
  }: NotificationMailContext,
  config: NotificationCardConfig,
): GraphSendMailPayload {
  const recipients = getRecipients({
    plan,
    auditor,
    tienda,
    fallbackTo,
    mode,
  });

  const planUrl = siteUrl
    ? `${siteUrl.replace(/\/$/, "")}/plan-accion-respuesta/${plan.id_plan_accion}/${plan.id_auditoria ?? ""}`
    : "";

  const content = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;color:#1f2937;">
      <div style="background:${config.accentColor};padding:22px;text-align:center;">
        <h2 style="margin:0;color:${config.accentTextColor};font-size:22px;font-weight:700;">${config.headline}</h2>
        <p style="margin:8px 0 0;color:${config.accentTextColor};opacity:0.88;font-size:14px;">Plan PA-${plan.id_plan_accion}</p>
      </div>

      <div style="padding:24px;line-height:1.6;">
        <p style="margin-top:0;">Hola,</p>
        <p>${config.message}</p>

        <div style="background:${config.cardBackground};border:1px solid ${config.cardBorder};border-left:5px solid ${config.accentColor};border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 10px;"><strong>Plan de accion:</strong> PA-${plan.id_plan_accion}</p>
          <p style="margin:0 0 10px;"><strong>Tienda:</strong> ${tienda?.nombre ?? "Sin tienda asociada"}</p>
          <p style="margin:0 0 10px;"><strong>Area / proceso:</strong> ${area?.nombre ?? "Sin area asociada"}</p>
          <p style="margin:0 0 10px;"><strong>Responsable:</strong> ${plan.responsable || "Sin responsable"}</p>
          <p style="margin:0 0 10px;"><strong>Fecha de creacion:</strong> ${plan.fecha_creacion || "Sin fecha"}</p>
          <p style="margin:0 0 10px;"><strong>Fecha de vencimiento:</strong> ${plan.fecha_compromiso}</p>
          <p style="margin:0 0 10px;"><strong>Estado actual:</strong> ${plan.estado || "Sin estado"}</p>
          <p style="margin:0 0 10px;"><strong>${config.daysInfo}</strong></p>
          <p style="margin:0;"><strong>Descripcion:</strong><br>${plan.descripcion_hallazgo || "Sin descripcion"}</p>
        </div>

        ${planUrl ? `
          <div style="text-align:center;margin-top:28px;">
            <a href="${planUrl}" style="display:inline-block;background:${config.accentColor};color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;">
              Abrir plan de accion
            </a>
          </div>
        ` : ""}
      </div>

      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#6b7280;font-size:12px;">Este es un mensaje automatico. Por favor, no respondas este correo.</p>
      </div>
    </div>
  `.trim();

  return {
    message: {
      subject: config.subject,
      body: {
        contentType: "HTML",
        content,
      },
      toRecipients: recipients.toRecipients,
      ccRecipients: recipients.ccRecipients,
    },
    saveToSentItems: true,
  };
}

export function buildBeforeDueReminderMail(context: NotificationMailContext, daysRemaining: number) {
  const planId = context.plan.id_plan_accion;

  if (daysRemaining === 0) {
    return buildBaseNotificationMail(context, {
      subject: `Vencimiento: el plan de accion PA-${planId} vence hoy`,
      headline: "Plan de accion vence hoy",
      message: "Este es un recordatorio automatico porque el plan de accion vence hoy.",
      daysInfo: "Dias restantes: vence hoy",
      accentColor: "#f59e0b",
      accentTextColor: "#ffffff",
      cardBackground: "#fffbeb",
      cardBorder: "#fcd34d",
    });
  }

  const dayWord = daysRemaining === 1 ? "dia" : "dias";

  return buildBaseNotificationMail(context, {
    subject: `Recordatorio: el plan de accion PA-${planId} vence en ${daysRemaining} ${dayWord}`,
    headline: "Recordatorio de plan de accion",
    message: `Este es un recordatorio automatico porque el plan de accion esta a ${daysRemaining} ${dayWord} de su fecha compromiso.`,
    daysInfo: `Dias restantes: ${daysRemaining}`,
    accentColor: daysRemaining === 1 ? "#f59e0b" : "#2563eb",
    accentTextColor: "#ffffff",
    cardBackground: daysRemaining === 1 ? "#fffbeb" : "#eff6ff",
    cardBorder: daysRemaining === 1 ? "#fcd34d" : "#bfdbfe",
  });
}

export function buildOverdueNotificationMail(context: NotificationMailContext, daysOverdue: number) {
  const planId = context.plan.id_plan_accion;
  const dayWord = daysOverdue === 1 ? "dia" : "dias";

  return buildBaseNotificationMail(context, {
    subject: `Vencimiento: el plan de accion PA-${planId} lleva ${daysOverdue} ${dayWord} vencido`,
    headline: "Plan de accion vencido",
    message: `Te informamos que el plan de accion lleva ${daysOverdue} ${dayWord} vencido y requiere seguimiento inmediato.`,
    daysInfo: `Dias de vencido: ${daysOverdue}`,
    accentColor: "#dc2626",
    accentTextColor: "#ffffff",
    cardBackground: "#fef2f2",
    cardBorder: "#fecaca",
  });
}
