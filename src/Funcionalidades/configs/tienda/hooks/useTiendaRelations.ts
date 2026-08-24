import * as React from 'react'
import { useRepositories } from '../../../../repositories/repositoriesContext'
import { mapBodegaOption, mapJefeZonaOption, mapMarcaOption, mapTipoTiendaOption, mapZonaOption } from '../../../shared/react-select'

export type SelectOption = {
  value: number | string
  label: string
  helper?: string
}

type RelationOptions = {
  zonas: SelectOption[]
  jefesZona: SelectOption[]
  bodegas: SelectOption[]
  tiposTienda: SelectOption[]
  marcas: SelectOption[]
}

const emptyOptions: RelationOptions = {
  zonas: [],
  jefesZona: [],
  bodegas: [],
  tiposTienda: [],
  marcas: [],
}

export function useTiendaRelations() {
  const { zonas, jefeZona, bodegas, tipo_tienda, marcas } = useRepositories()
  const [loading, setLoading] = React.useState(false)

  const loadRelationOptions = React.useCallback(async (): Promise<{
    ok: boolean
    errorMessage: string | null
    data: RelationOptions
  }> => {
    try {
      setLoading(true)

      const [zonasResponse, jefesZonaResponse, bodegasResponse, tiposTiendaResponse, marcasResponse] =
        await Promise.all([
          zonas?.loadOptions({ paginated: false }),
          jefeZona?.loadOptions({ paginated: false }),
          bodegas?.loadOptions({ paginated: false }),
          tipo_tienda?.loadOptions({ paginated: false }),
          marcas?.loadOptions({ paginated: false }),
        ])

      const errorMessage =
        zonasResponse?.message ||
        jefesZonaResponse?.message ||
        bodegasResponse?.message ||
        tiposTiendaResponse?.message ||
        marcasResponse?.message ||
        null

      if (
        !zonasResponse?.status ||
        !jefesZonaResponse?.status ||
        !bodegasResponse?.status ||
        !tiposTiendaResponse?.status ||
        !marcasResponse?.status
      ) {
        return {
          ok: false,
          errorMessage: errorMessage ?? 'No fue posible cargar las relaciones de tienda.',
          data: emptyOptions,
        }
      }

      return {
        ok: true,
        errorMessage: null,
        data: {
          zonas: zonasResponse.data.map(mapZonaOption),
          jefesZona: jefesZonaResponse.data.map(mapJefeZonaOption),
          bodegas: bodegasResponse.data.map(mapBodegaOption),
          tiposTienda: tiposTiendaResponse.data.map(mapTipoTiendaOption),
          marcas: marcasResponse.data.map(mapMarcaOption),
        },
      }
    } catch (error: any) {
      return {
        ok: false,
        errorMessage: error?.message ?? 'No fue posible cargar las relaciones de tienda.',
        data: emptyOptions,
      }
    } finally {
      setLoading(false)
    }
  }, [bodegas, jefeZona, marcas, tipo_tienda, zonas])

  return {
    loadRelationOptions,
    loading,
  }
}
