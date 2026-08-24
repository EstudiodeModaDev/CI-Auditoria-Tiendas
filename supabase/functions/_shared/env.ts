const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GRAPH_TENANT_ID",
  "GRAPH_CLIENT_ID",
  "GRAPH_CLIENT_SECRET",
  "MAIL_SENDER",
] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

function readRequiredEnv(name: RequiredEnvKey): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEnv() {
  return {
    supabaseUrl: readRequiredEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    graphTenantId: readRequiredEnv("GRAPH_TENANT_ID"),
    graphClientId: readRequiredEnv("GRAPH_CLIENT_ID"),
    graphClientSecret: readRequiredEnv("GRAPH_CLIENT_SECRET"),
    mailSender: readRequiredEnv("MAIL_SENDER"),
    siteUrl: Deno.env.get("SITE_URL") ?? "",
    siteMode: Deno.env.get("SITE_MODE") ?? "prod",
    mailFallbackTo: Deno.env.get("MAIL_FALLBACK_TO") ?? "dpalacios@estudiodemoda.com.co",
    closedStatuses: (Deno.env.get("ACTION_PLAN_CLOSED_STATUSES") ?? "Cerrado")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    inventoryWarningRecipient: Deno.env.get("INVENTORY_WARNING_RECIPIENT") ?? "lmgonzalez@estudiodemoda.com.co",
    inventoryWarningStaleMonths: Number(Deno.env.get("INVENTORY_WARNING_STALE_MONTHS") ?? "2"),
    inventoryWarningRenotifyDays: Number(Deno.env.get("INVENTORY_WARNING_RENOTIFY_DAYS") ?? "30"),
  };
}
