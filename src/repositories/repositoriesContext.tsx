import * as React from "react";
import type { ConfigurationsRepository } from "./configurations/configuration.repository";
import type { auditor } from "../models/database/auditor";
import { SupabaseAuditorRepository } from "./configurations/auditor.reposity";
import type { zona } from "../models/database/zona";
import { SupabaseZonaRepository } from "./configurations/zona.repository";
import { SupabaseJefeZonaRepository } from "./configurations/jefes_zona.repository";
import type { jefe_zona } from "../models/database/jefe_zona";
import { SupabaseBodegaRepository } from "./configurations/bodega.repository";
import type { bodega } from "../models/database/bodega";
import type { item_evaluacion } from "../models/database/items_evaluacion";
import { SupabaseItemEvaluacionRepository } from "./configurations/item_evaluacion.repository";
import type { tipo_tienda } from "../models/database/tipo_tienda";
import { SupabaseTipoTiendaRepository } from "./configurations/tipo_tienda.repository";
import type { tienda } from "../models/database/tienda";
import { SupabaseTiendaRepository } from "./configurations/tienda.repository";
import type { marca } from "../models/database/marca";
import { SupabaseMarcaRepository } from "./configurations/marca.repository";
import type { causal } from "../models/database/causal";
import { SupabaseCausalRepository } from "./configurations/causales.repository";
import { SupabaseAuditoriaRepository } from "./auditoria/auditoria.supabase";
import { SupabaseAuditoriaDetalleRepository } from "./auditoriaDetalle/auditoria.supabase";
import { SupabaseAreaResponsableRepository } from "./configurations/areas_responsables.repository";
import type { areas_responsables } from "../models/database/areas_responsables";
import type { AuditoriaRepository } from "./auditoria/auditoria.repository";
import type { AuditoriaDetalleRepository } from "./auditoriaDetalle/auditoriaDetalle.repository";
import type { PlanAccionRepository } from "./plan_accion/plan_accion.repository";
import { PlanAccionSupabase } from "./plan_accion/PlanAccionSupabase";
import type { AttachmentBridgeRepository } from "./Attachments_bridege/AttachmentsBridgeRepository";
import type { AttachmentsRepository } from "./Attachments/AttachmentsRepository";
import { AttachmentsFromBucket } from "./Attachments/EvidenciasRepository";
import { AttachmentBridgeSupabase } from "./Attachments_bridege/SupabaseEvidencias";
import type { PlanAccionRespuestaRepository } from "./plan_seguimiento/plan_seguimiento_repository";
import { PlanAccionSeguimientoSupabase } from "./plan_seguimiento/plan_seguimiento_supabase";
import { SeguimientosAttachmentBridgeSupabase } from "./Attachments_bridege/SupabaseSeguimientos";


type RepositorySource = "supabase" | "sharepoint";

export type AppRepositories = {
  auditores: ConfigurationsRepository<auditor> | null,
  zonas: ConfigurationsRepository<zona> | null
  jefeZona: ConfigurationsRepository<jefe_zona> | null
  bodegas: ConfigurationsRepository<bodega> | null
  item_evaluacion: ConfigurationsRepository<item_evaluacion> | null
  tipo_tienda: ConfigurationsRepository<tipo_tienda> | null
  marcas: ConfigurationsRepository<marca> | null
  causales: ConfigurationsRepository<causal> | null
  tienda: ConfigurationsRepository<tienda> | null
  auditoria: AuditoriaRepository
  auditoriaDetalle: AuditoriaDetalleRepository
  areasResponsables: ConfigurationsRepository<areas_responsables> | null
  planAccion: PlanAccionRepository
  attachmentEvidencias: AttachmentBridgeRepository
  attachments: AttachmentsRepository
  SeguimientosAttachments: AttachmentBridgeRepository
  planesSeguimientos: PlanAccionRespuestaRepository
};

type RepositoriesProviderProps = {
  children: React.ReactNode;
  sources?: Partial<{
    auditor: RepositorySource;
    zona: RepositorySource
  }>;
};

const RepositoriesContext = React.createContext<AppRepositories | null>(null);

export const RepositoriesProvider: React.FC<RepositoriesProviderProps> = ({
  children,
  sources,
}) => {

  const repositories = React.useMemo<AppRepositories>(() => {
    const auditorSource = sources?.auditor ?? "supabase"

    return {
      auditores: auditorSource === "supabase" ? new SupabaseAuditorRepository() : null,
      zonas: new SupabaseZonaRepository(),
      jefeZona: new SupabaseJefeZonaRepository(),
      item_evaluacion: new SupabaseItemEvaluacionRepository(),
      bodegas: new SupabaseBodegaRepository(),
      tipo_tienda: new SupabaseTipoTiendaRepository(),
      marcas: new SupabaseMarcaRepository(),
      causales: new SupabaseCausalRepository(),
      tienda: new SupabaseTiendaRepository(),
      auditoria: new SupabaseAuditoriaRepository(),
      auditoriaDetalle: new SupabaseAuditoriaDetalleRepository(),
      areasResponsables: new SupabaseAreaResponsableRepository(),
      planAccion: new PlanAccionSupabase(),
      attachmentEvidencias: new AttachmentBridgeSupabase(),
      attachments: new AttachmentsFromBucket(),
      planesSeguimientos: new PlanAccionSeguimientoSupabase(),
      SeguimientosAttachments: new SeguimientosAttachmentBridgeSupabase()
    };
  }, [sources]);

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
};

export function useRepositories(): AppRepositories {
  const ctx = React.useContext(RepositoriesContext);

  if (!ctx) {
    throw new Error("useRepositories must be used within <RepositoriesProvider>");
  }

  return ctx;
}
