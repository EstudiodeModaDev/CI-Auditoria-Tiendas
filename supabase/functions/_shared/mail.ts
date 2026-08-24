import type { GraphSendMailPayload } from "./types.ts";

type GraphCredentials = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

async function getGraphAccessToken(credentials: GraphCredentials) {
  const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error autenticando contra Microsoft Graph");
  }

  const data = await response.json() as { access_token?: string };

  if (!data.access_token) {
    throw new Error("Microsoft Graph no devolvio access_token");
  }

  return data.access_token;
}

export async function sendMailWithGraph(
  credentials: GraphCredentials,
  senderMail: string,
  payload: GraphSendMailPayload,
) {
  const accessToken = await getGraphAccessToken(credentials);
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderMail)}/sendMail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error enviando correo con Microsoft Graph");
  }
}
