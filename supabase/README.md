# Supabase Edge Functions

Esta carpeta deja la base para una notificacion periodica diaria de planes de accion.

## Funcion incluida

- `action-plan-periodic-notifications`
  Ejecuta 6 validaciones cada dia (maximo 6 notificaciones por plan de accion):
  - planes que vencen en 2 dias
  - planes que vencen en 1 dia
  - planes que vencen hoy
  - planes que vencieron hace 2 dias (ademas marca el plan como `Vencido`)
  - planes que vencieron hace 4 dias
  - planes que vencieron hace 6 dias

Las 3 notificaciones posteriores al vencimiento solo se envian si el plan no esta en un estado de `ACTION_PLAN_CLOSED_STATUSES` (es decir, sigue pendiente/abierto/sin finalizar).

Cada correo incluye: id del plan, tienda, area/proceso responsable, descripcion, responsable, fecha de creacion, fecha de vencimiento, estado actual, dias restantes o de vencido, y el enlace al plan.

La funcion registra cada envio en la tabla `ALERTA` (columna `tipo_alerta`) para no reenviar la misma notificacion si el cron se vuelve a ejecutar el mismo dia.

- `warning-notifications`
  Corre una vez al dia y detecta tiendas activas que cumplen ambas condiciones:
  - Tienen al menos un inventario (fila en `AUDITORIA`) registrado.
  - Su ultimo inventario (`fecha_auditoria` mas reciente) supera `INVENTORY_WARNING_STALE_MONTHS` meses (por defecto 3).

  Envia un correo a `INVENTORY_WARNING_RECIPIENT` (por defecto `lmgonzalez@estudiodemoda.com.co`) con: nombre y codigo (id) de la tienda, fecha del ultimo inventario, cantidad total de inventarios registrados, tiempo transcurrido desde el ultimo inventario, y un enlace al historial de auditorias.

  Mientras la tienda siga sin inventario reciente, solo se reenvia el correo cada `INVENTORY_WARNING_RENOTIFY_DAYS` dias (por defecto 30). En cuanto la tienda registra un inventario reciente, el seguimiento se reinicia. El estado de seguimiento se guarda en la tabla `tienda_inventory_warning_log`.

## Variables de entorno requeridas

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GRAPH_TENANT_ID`
- `GRAPH_CLIENT_ID`
- `GRAPH_CLIENT_SECRET`
- `MAIL_SENDER`

## Variables opcionales

- `SITE_URL`
- `SITE_MODE`
- `MAIL_FALLBACK_TO`
- `ACTION_PLAN_CLOSED_STATUSES`
- `INVENTORY_WARNING_RECIPIENT` (solo `warning-notifications`, por defecto `lmgonzalez@estudiodemoda.com.co`)
- `INVENTORY_WARNING_STALE_MONTHS` (solo `warning-notifications`, por defecto `3`)
- `INVENTORY_WARNING_RENOTIFY_DAYS` (solo `warning-notifications`, por defecto `30`)

## Despliegue sugerido

1. Crear secretos:
   `supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GRAPH_TENANT_ID=... GRAPH_CLIENT_ID=... GRAPH_CLIENT_SECRET=... MAIL_SENDER=... SITE_URL=... SITE_MODE=prod MAIL_FALLBACK_TO=... ACTION_PLAN_CLOSED_STATUSES=Cerrado`
2. Desplegar las funciones:
   `supabase functions deploy action-plan-periodic-notifications --no-verify-jwt`
   `supabase functions deploy warning-notifications --no-verify-jwt`
3. Aplicar las migraciones para crear las bitacoras y los cron jobs (`supabase db push`).

## Permisos de Microsoft Graph

La app registrada en Azure AD debe tener permisos de aplicacion para `Mail.Send` y consentimiento de administrador.
`MAIL_SENDER` debe ser un buzón valido sobre el que Graph pueda ejecutar `sendMail`.

## Nota sobre cron

La migracion agenda el job a las `12:00 UTC`, que equivale a `07:00` en `America/Bogota` mientras la zona este en UTC-5.
Si quieres otra hora, cambia la expresion cron en la migracion.
