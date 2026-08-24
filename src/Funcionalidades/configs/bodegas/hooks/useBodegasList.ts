import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { bodega } from "../../../../models/database/bodega";

export function useBodegaList() {
  const {bodegas} = useRepositories()
  const [bodegasRows, setBodegasRows] = React.useState<bodega[]>([])

  const loadBodegas = React.useCallback(
    async (search: string): Promise<{ ok: boolean; errorMessage: string | null;data: bodega[];}> => {
      try {
        const filter: configurationsFilter = {
          paginated: false,
          nombre: search,
        };

        const response = await bodegas?.loadOptions(filter);

        if (!response?.status) {
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando las bodegas",
            ok: false,
            data: [],
          };
        }

        setBodegasRows(response.data);

        return {
          errorMessage: null,
          ok: true,
          data: response.data,
        };
      } catch (e: unknown) {
        return {
          errorMessage: e instanceof Error ? e.message : String(e),
          ok: false,
          data: [],
        };
      }
    },
    [bodegas]
  );

  const loadBodega = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: bodega | null,}> => {      
    try{
      const response = await bodegas?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando la bodega",
          ok: false,
          data: null
        }
      }
    
      return {
        errorMessage: null,
        ok: true,
        data: response.data
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false,
        data: null
      }
    }
  }

  return {
    loadBodegas, bodegasRows, loadBodega
  };
}
