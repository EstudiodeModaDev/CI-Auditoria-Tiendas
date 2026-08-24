import type { GraphSendMailPayload } from "./types.ts";

export type TiendaInventoryWarning = {
  id_tienda: number;
  nombre: string;
  totalInventarios: number;
  ultimaFecha: string;
  diasSinInventario: number;
};

function formatElapsed(days: number) {
  const months = Math.floor(days / 30);
  return `${days} dias (aprox. ${months} ${months === 1 ? "mes" : "meses"})`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function buildInventoryWarningMail(
  warning: TiendaInventoryWarning,
  recipient: string,
  siteUrl: string,
): GraphSendMailPayload {
  const storeUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/home` : "";

  const content = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;color:#1f2937;">
      <div style="background:#f59e0b;padding:22px;text-align:center;">
        <h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Tienda sin inventario reciente</h2>
        <p style="margin:8px 0 0;color:#ffffff;opacity:0.88;font-size:14px;">Codigo de tienda: ${warning.id_tienda}</p>
      </div>

      <div style="padding:24px;line-height:1.6;">
        <p style="margin-top:0;">Hola,</p>
        <p>La siguiente tienda tiene mas de un inventario registrado, pero su ultimo inventario supera los tres meses de antiguedad y requiere seguimiento.</p>

        <div style="background:#fffbeb;border:1px solid #fcd34d;border-left:5px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 10px;"><strong>Tienda:</strong> ${warning.nombre}</p>
          <p style="margin:0 0 10px;"><strong>Codigo de tienda:</strong> ${warning.id_tienda}</p>
          <p style="margin:0 0 10px;"><strong>Cantidad total de inventarios registrados:</strong> ${warning.totalInventarios}</p>
          <p style="margin:0 0 10px;"><strong>Fecha del ultimo inventario:</strong> ${formatDate(warning.ultimaFecha)}</p>
          <p style="margin:0;"><strong>Tiempo transcurrido desde el ultimo inventario:</strong> ${formatElapsed(warning.diasSinInventario)}</p>
        </div>

        ${storeUrl ? `
          <div style="text-align:center;margin-top:28px;">
            <a href="${storeUrl}" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;">
              Consultar inventarios de la tienda
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
      subject: `Alerta: la tienda ${warning.nombre} no tiene inventario reciente`,
      body: {
        contentType: "HTML",
        content,
      },
      toRecipients: [
        {
          emailAddress: {
            address: recipient,
          },
        },
      ],
      ccRecipients: [],
    },
    saveToSentItems: true,
  };
}
