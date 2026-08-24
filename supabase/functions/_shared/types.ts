export type ActionPlan = {
  id_plan_accion: number;
  id_auditoria: number | null;
  id_tienda: number | null;
  id_area_responsable: number | null;
  fecha_creacion: string;
  fecha_compromiso: string;
  estado: string;
  responsable: string;
  correo_responsable: string;
  descripcion_hallazgo: string;
};

export type Auditoria = {
  id_auditoria: number;
  id_auditor: number | null;
};

export type Auditor = {
  id_auditor: number;
  nombre: string;
  correo: string;
};

export type Tienda = {
  id_tienda: number;
  nombre: string;
  correo_tienda: string;
};

export type AreaResponsable = {
  id_area_responsable: number;
  nombre: string;
};

export type NotificationType =
  | "reminder_2_days_before"
  | "reminder_1_day_before"
  | "reminder_due_today"
  | "overdue_2_days_after"
  | "overdue_4_days_after"
  | "overdue_6_days_after";

export type ActionPlanNotificationLog = {
  id_plan_accion: number;
  tipo_alerta: NotificationType;
  fecha_generacion: string;
  descripcion?: string
  receptor?: string
};

export type GraphSendMailPayload = {
  message: {
    subject: string;
    body: {
      contentType: "HTML";
      content: string;
    };
    toRecipients: Array<{
      emailAddress: {
        address: string;
      };
    }>;
    ccRecipients: Array<{
      emailAddress: {
        address: string;
      };
    }>;
  };
  saveToSentItems: true;
};
