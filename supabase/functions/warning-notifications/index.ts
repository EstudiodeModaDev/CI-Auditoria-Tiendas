import { createClient } from "npm:@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";
import { sendMailWithGraph } from "../_shared/mail.ts";
import { buildInventoryWarningMail } from "../_shared/inventory-warning-template.ts";
import type { TiendaInventoryWarning } from "../_shared/inventory-warning-template.ts";

const env = getEnv();
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type TiendaRow = {
  id_tienda: number;
  nombre: string;
};

type WarningLogRow = {
  id_tienda: number;
  last_inventory_date: string;
  last_notified_at: string;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

async function loadActiveTiendas() {
  const response = await supabase
    .from("TIENDA")
    .select("id_tienda,nombre")

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []) as TiendaRow[];
}

async function loadInventorySummaryByTienda() {
  const response = await supabase
    .from("AUDITORIA")
    .select("id_tienda,fecha_auditoria");

  if (response.error) {
    throw new Error(response.error.message);
  }

  const summary = new Map<number, { total: number; lastDate: string }>();

  for (const row of (response.data ?? []) as Array<{ id_tienda: number | null; fecha_auditoria: string | null }>) {
    if (!row.id_tienda || !row.fecha_auditoria) {
      continue;
    }

    const idTienda = Number(row.id_tienda);
    const current = summary.get(idTienda);

    if (!current) {
      summary.set(idTienda, { total: 1, lastDate: row.fecha_auditoria });
      continue;
    }

    current.total += 1;

    if (row.fecha_auditoria > current.lastDate) {
      current.lastDate = row.fecha_auditoria;
    }
  }

  return summary;
}

async function loadWarningLog() {
  const response = await supabase
    .from("tienda_inventory_warning_log")
    .select("id_tienda,last_inventory_date,last_notified_at");

  if (response.error) {
    throw new Error(response.error.message);
  }

  return new Map(
    (response.data ?? []).map((item: WarningLogRow) => [Number(item.id_tienda), item]),
  );
}

async function upsertWarningLog(idTienda: number, lastInventoryDate: string, notifiedAt: string) {
  const response = await supabase
    .from("tienda_inventory_warning_log")
    .upsert({
      id_tienda: idTienda,
      last_inventory_date: lastInventoryDate,
      last_notified_at: notifiedAt,
    }, { onConflict: "id_tienda" });

  if (response.error) {
    throw new Error(response.error.message);
  }
}

async function clearWarningLog(idTienda: number) {
  const response = await supabase
    .from("tienda_inventory_warning_log")
    .delete()
    .eq("id_tienda", idTienda);

  if (response.error) {
    throw new Error(response.error.message);
  }
}

Deno.serve(async () => {
  try {
    const today = new Date();
    const executionDate = toIsoDate(today);
    const staleThreshold = toIsoDate(addMonths(today, -env.inventoryWarningStaleMonths));

    const [tiendas, inventorySummary, warningLog] = await Promise.all([
      loadActiveTiendas(),
      loadInventorySummaryByTienda(),
      loadWarningLog(),
    ]);

    let scanned = 0;
    let qualified = 0;
    let notified = 0;
    let resolved = 0;

    for (const tienda of tiendas) {
      scanned += 1;
      const idTienda = Number(tienda.id_tienda);
      const summary = inventorySummary.get(idTienda);
      const isStale = Boolean(summary) && summary!.lastDate < staleThreshold;
      const existingLog = warningLog.get(idTienda);

      if (!isStale) {
        if (existingLog) {
          await clearWarningLog(idTienda);
          resolved += 1;
        }
        continue;
      }

      qualified += 1;

      const daysSinceLastNotified = existingLog
        ? daysBetween(new Date(existingLog.last_notified_at), today)
        : null;

      const shouldNotify = !existingLog || (daysSinceLastNotified !== null && daysSinceLastNotified >= env.inventoryWarningRenotifyDays);

      if (!shouldNotify) {
        continue;
      }

      const warning: TiendaInventoryWarning = {
        id_tienda: idTienda,
        nombre: tienda.nombre,
        totalInventarios: summary!.total,
        ultimaFecha: summary!.lastDate,
        diasSinInventario: daysBetween(new Date(summary!.lastDate), today),
      };

      const recipient = env.siteMode === "prod" ? env.inventoryWarningRecipient : env.mailFallbackTo;
      const payload = buildInventoryWarningMail(warning, recipient, env.siteUrl);

      await sendMailWithGraph(
        {
          tenantId: env.graphTenantId,
          clientId: env.graphClientId,
          clientSecret: env.graphClientSecret,
        },
        env.mailSender,
        payload,
      );

      await upsertWarningLog(idTienda, summary!.lastDate, executionDate);
      notified += 1;
    }

    return Response.json({
      ok: true,
      executionDate,
      staleThreshold,
      scanned,
      qualified,
      notified,
      resolved,
    });
  } catch (error) {
    console.error("warning-notifications failed", error);

    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, {
      status: 500,
    });
  }
});
