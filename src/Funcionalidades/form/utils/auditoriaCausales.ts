import type { SelectOption } from "../../configs/tienda/hooks/useTiendaRelations";
import type { causal } from "../../../models/database/causal";

export function mapCausalOption(item: causal): SelectOption {
  return {
    value: Number(item.id_causal),
    label: item.descripcion,
  }
}

export function getActiveCausalOptions(causales: causal[]) {
  const toReturn = causales.filter((causalItem) => causalItem.activo).map(mapCausalOption)
  console.log(toReturn)
  return toReturn
}

export function getCausalesByItem(causales: causal[], itemId: number | undefined) {
  if (itemId == null) {
    return []
  }

  return causales
    .filter((causalItem) => causalItem.activo)
    .filter((causalItem) => Number(causalItem.id_item) === itemId)
    .map(mapCausalOption)
}
