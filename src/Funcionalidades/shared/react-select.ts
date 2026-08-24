import type { areas_responsables } from "../../models/database/areas_responsables";
import type { auditor } from "../../models/database/auditor";
import type { bodega } from "../../models/database/bodega";
import type { causal } from "../../models/database/causal";
import type { jefe_zona } from "../../models/database/jefe_zona";
import type { marca } from "../../models/database/marca";
import type { tienda } from "../../models/database/tienda";
import type { tipo_tienda } from "../../models/database/tipo_tienda";
import type { zona } from "../../models/database/zona";
import type { SelectOption } from "../configs/tienda/hooks/useTiendaRelations";

export function selectedOption(options: SelectOption[], value: number | null | string) {
    if(!options) return
    return options.find((option) => option.value === value) ?? null
  }

export function mapZonaOption(item: zona): SelectOption {
  return {
    value: Number(item.id_zona),
    label: item.nombre,
  }
}

export function mapJefeZonaOption(item: jefe_zona): SelectOption {
  return {
    value: Number(item.id_jefe_zona),
    label: item.nombre,
    helper: item.correo,
  }
}

export function mapBodegaOption(item: bodega): SelectOption {
  return {
    value: Number(item.id_bodega),
    label: item.codigo,
    helper: item.codigo_co,
  }
}

export function mapTipoTiendaOption(item: tipo_tienda): SelectOption {
  return {
    value: Number(item.id_tipo_tienda),
    label: item.nombre,
  }
}

export function mapMarcaOption(item: marca): SelectOption {
  return {
    value: Number(item.id_marca),
    label: item.nombre,
  }
}

export function mapTiendaOption(item: tienda): SelectOption {
  return {
    value: Number(item.id_tienda),
    label: item.nombre,
  }
}

export function mapAuditorOption(item: auditor): SelectOption {
  return {
    value: Number(item.id_auditor),
    label: item.nombre,
  }
}

export function mapCausalesOption(item: causal): SelectOption {
  return {
    value: Number(item.id_causal),
    label: item.descripcion,
  }
}

export function mapAreaResponsableOption(item: areas_responsables): SelectOption {
  return {
    value: Number(item.id_area_responsable),
    label: item.nombre,
  }
}

