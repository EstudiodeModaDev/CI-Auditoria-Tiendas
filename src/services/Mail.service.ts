export type EnviarCorreoPayload = {
  senderMail: string,
  message: {
    subject: string,
    body: {
      contentType: string,
      content: string
    },
    toRecipients : {
      emailAddress : {
        address : string
      }
    }[],
    ccRecipients: {
      "emailAddress": {
        "address": string
      }
    }[],
  },
  saveToSentItems: true
};

export async function enviarCorreo(payload: EnviarCorreoPayload) {
  const response = await fetch(`https://api-envio-correos-bchfaebqdhfcbdgw.canadacentral-01.azurewebsites.net/mail/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error enviando correo");
  }

  return response.json();
}