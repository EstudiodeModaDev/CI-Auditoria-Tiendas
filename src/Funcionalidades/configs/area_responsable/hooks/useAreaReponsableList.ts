import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { areas_responsables } from "../../../../models/database/areas_responsables";

export function useAreaResponsableList() {
  const {areasResponsables} = useRepositories()
  const [areaResponsableRows, setAreaResponsableRows] = React.useState<areas_responsables[]>([])

  const loadAreasResponsable = React.useCallback(
    async (search: string): Promise<{ ok: boolean; errorMessage: string | null;data: areas_responsables[];}> => {
      try {
        const filter: configurationsFilter = {
          paginated: false,
          nombre: search,
        };

        const response = await areasResponsables?.loadOptions(filter);

        if (!response?.status) {
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando las áreas responsables",
            ok: false,
            data: [],
          };
        }

        setAreaResponsableRows(response.data);

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
    []
  );

  const loadAreaResponsable = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: areas_responsables | null,}> => {      
    try{
      const response = await areasResponsables?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando la área responsable",
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
    loadAreasResponsable, areaResponsableRows, loadAreaResponsable
  };
}
