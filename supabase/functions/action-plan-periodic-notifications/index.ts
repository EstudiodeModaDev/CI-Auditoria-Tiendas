import { createClient } from "npm:@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";
import { sendMailWithGraph } from "../_shared/mail.ts";
import {
  buildBeforeDueReminderMail,
  buildOverdueNotificationMail,
} from "../_shared/templates.ts";
import type {
  ActionPlan,
  ActionPlanNotificationLog,
  AreaResponsable,
  Auditor,
  Auditoria,
  GraphSendMailPayload,
  NotificationType,
  Tienda,
} from "../_shared/types.ts";

const env = getEnv();
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

const BEFORE_DUE_WINDOWS: Array<{ type: NotificationType; daysRemaining: number }> = [
  { type: "reminder_2_days_before", daysRemaining: 2 },
  { type: "reminder_1_day_before", daysRemaining: 1 },
  { type: "reminder_due_today", daysRemaining: 0 },
];

const OVERDUE_WINDOWS: Array<{ type: NotificationType; daysOverdue: number; markVencido?: boolean }> = [
  { type: "overdue_2_days_after", daysOverdue: 2, markVencido: true },
  { type: "overdue_4_days_after", daysOverdue: 4 },
  { type: "overdue_6_days_after", daysOverdue: 6 },
];

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate: Date, days: number) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

async function loadPlansByDueDate(referenceDate: string) {
  const response = await supabase
    .from("PLAN_ACCION")
    .select("id_plan_accion,id_auditoria,id_tienda,id_area_responsable,fecha_creacion,fecha_compromiso,estado,responsable,correo_responsable,descripcion_hallazgo")
    .eq("fecha_compromiso", referenceDate);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []) as ActionPlan[];
}

async function loadAuditoriaMap(plans: ActionPlan[]) {
  const auditoriaIds = [...new Set(plans.map((plan) => plan.id_auditoria).filter((value): value is number => Boolean(value)))];

  if (auditoriaIds.length === 0) {
    return new Map<number, Auditoria>();
  }

  const response = await supabase
    .from("AUDITORIA")
    .select("id_auditoria,id_auditor")
    .in("id_auditoria", auditoriaIds);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return new Map((response.data ?? []).map((item) => [item.id_auditoria, item as Auditoria]));
}

async function loadAuditorMap(auditorias: Map<number, Auditoria>) {
  const auditorIds = [...new Set(
    Array.from(auditorias.values())
      .map((item) => item.id_auditor)
      .filter((value): value is number => Boolean(value)),
  )];

  if (auditorIds.length === 0) {
    return new Map<number, Auditor>();
  }

  const response = await supabase
    .from("AUDITOR")
    .select("id_auditor,nombre,correo")
    .in("id_auditor", auditorIds);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return new Map((response.data ?? []).map((item) => [item.id_auditor, item as Auditor]));
}

async function loadTiendaMap(plans: ActionPlan[]) {
  const tiendaIds = [...new Set(plans.map((plan) => plan.id_tienda).filter((value): value is number => Boolean(value)))];

  if (tiendaIds.length === 0) {
    return new Map<number, Tienda>();
  }

  const response = await supabase
    .from("TIENDA")
    .select("id_tienda,nombre,correo_tienda")
    .in("id_tienda", tiendaIds);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return new Map((response.data ?? []).map((item) => [item.id_tienda, item as Tienda]));
}

async function loadAreaMap(plans: ActionPlan[]) {
  const areaIds = [...new Set(plans.map((plan) => plan.id_area_responsable).filter((value): value is number => Boolean(value)))];

  if (areaIds.length === 0) {
    return new Map<number, AreaResponsable>();
  }

  const response = await supabase
    .from("AREAS_RESPONSABLES")
    .select("id_area_responsable,nombre")
    .in("id_area_responsable", areaIds);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return new Map((response.data ?? []).map((item) => [item.id_area_responsable, item as AreaResponsable]));
}

async function wasNotificationSent(planId: number, type: NotificationType, referenceDate: string) {
  const response = await supabase
    .from("ALERTA")
    .select("id_plan_accion")
    .eq("id_plan_accion", planId)
    .eq("tipo_alerta", type)
    .eq("fecha_generacion", referenceDate)
    .maybeSingle();

  if (response.error) {
    throw new Error(response.error.message);
  }

  return Boolean(response.data);
}

async function registerNotification(log: ActionPlanNotificationLog) {
  const response = await supabase
    .from("ALERTA")
    .insert({
      ...log,
      fecha_generacion: new Date().toISOString(),
    });

  if (response.error) {
    throw new Error(response.error.message);
  }
}

async function updatePlanStatus(planId: number, status: string) {
  const response = await supabase
    .from("PLAN_ACCION")
    .update({
      estado: status,
    })
    .eq("id_plan_accion", planId);

  if (response.error) {
    throw new Error(response.error.message);
  }
}

async function sendNotification(plan: ActionPlan, payload: GraphSendMailPayload, type: NotificationType, executionDate: string) {
  await sendMailWithGraph(
    {
      tenantId: env.graphTenantId,
      clientId: env.graphClientId,
      clientSecret: env.graphClientSecret,
    },
    env.mailSender,
    payload,
  );

  await registerNotification({
    id_plan_accion: plan.id_plan_accion,
    tipo_alerta: type,
    fecha_generacion: executionDate,
    descripcion: "Notificacion enviada",
    receptor: payload.message.toRecipients[0].emailAddress.address
  });
}

async function loadNotificationRelations(activePlans: ActionPlan[]) {
  const auditoriaMap = await loadAuditoriaMap(activePlans);
  const auditorMap = await loadAuditorMap(auditoriaMap);
  const tiendaMap = await loadTiendaMap(activePlans);
  const areaMap = await loadAreaMap(activePlans);

  return {
    auditoriaMap,
    auditorMap,
    tiendaMap,
    areaMap,
  };
}

function resolvePlanRelations(
  plan: ActionPlan,
  relations: Awaited<ReturnType<typeof loadNotificationRelations>>,
) {
  const auditoria = plan.id_auditoria ? relations.auditoriaMap.get(plan.id_auditoria) ?? null : null;
  const auditor = auditoria?.id_auditor ? relations.auditorMap.get(auditoria.id_auditor) ?? null : null;
  const tienda = plan.id_tienda ? relations.tiendaMap.get(plan.id_tienda) ?? null : null;
  const area = plan.id_area_responsable ? relations.areaMap.get(plan.id_area_responsable) ?? null : null;

  return {
    auditor,
    tienda,
    area,
  };
}

async function processWindow(
  type: NotificationType,
  dueDate: string,
  executionDate: string,
  buildMail: (context: { plan: ActionPlan; auditor: Auditor | null; tienda: Tienda | null; area: AreaResponsable | null }) => GraphSendMailPayload,
  options: { markVencido?: boolean } = {},
) {
  const plans = await loadPlansByDueDate(dueDate);
  const activePlans = plans.filter((plan) => !env.closedStatuses.includes(plan.estado));

  if (activePlans.length === 0) {
    return {
      type,
      dueDate,
      scanned: plans.length,
      sent: 0,
    };
  }

  const relations = await loadNotificationRelations(activePlans);
  let sent = 0;

  for (const plan of activePlans) {
    const alreadySent = await wasNotificationSent(plan.id_plan_accion, type, executionDate);

    if (alreadySent) {
      continue;
    }

    const { auditor, tienda, area } = resolvePlanRelations(plan, relations);

    const payload = buildMail({
      plan,
      auditor,
      tienda,
      area,
    });

    await sendNotification(plan, payload, type, executionDate);

    if (options.markVencido) {
      await updatePlanStatus(plan.id_plan_accion, "Vencido");
    }

    sent += 1;
  }

  return {
    type,
    dueDate,
    scanned: activePlans.length,
    sent,
  };
}

Deno.serve(async () => {
  try {
    const today = new Date();
    const executionDate = toIsoDate(today);

    const beforeDueResults = BEFORE_DUE_WINDOWS.map((window) =>
      processWindow(
        window.type,
        toIsoDate(addDays(today, window.daysRemaining)),
        executionDate,
        (context) =>
          buildBeforeDueReminderMail(
            {
              ...context,
              siteUrl: env.siteUrl,
              fallbackTo: env.mailFallbackTo,
              mode: env.siteMode,
            },
            window.daysRemaining,
          ),
      )
    );

    const overdueResults = OVERDUE_WINDOWS.map((window) =>
      processWindow(
        window.type,
        toIsoDate(addDays(today, -window.daysOverdue)),
        executionDate,
        (context) =>
          buildOverdueNotificationMail(
            {
              ...context,
              siteUrl: env.siteUrl,
              fallbackTo: env.mailFallbackTo,
              mode: env.siteMode,
            },
            window.daysOverdue,
          ),
        { markVencido: window.markVencido },
      )
    );

    const result = await Promise.all([...beforeDueResults, ...overdueResults]);

    return Response.json({
      ok: true,
      executionDate,
      windows: result,
    });
  } catch (error) {
    console.error("action-plan-periodic-notifications failed", error);

    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, {
      status: 500,
    });
  }
});
