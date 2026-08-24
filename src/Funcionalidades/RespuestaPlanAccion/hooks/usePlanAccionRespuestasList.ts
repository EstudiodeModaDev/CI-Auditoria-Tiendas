import * as React from "react";
import { useRepositories } from "../../../repositories/repositoriesContext";
import type { planAccionSeguimiento } from "../../../models/database/plan_accion";

export function usePlanAccionRespuestasList(id_plan_accion: string) {
  const {planesSeguimientos} = useRepositories()
  const [respuestas, setRespuestas] = React.useState<planAccionSeguimiento[]>([])
  const [total, setTotal] = React.useState<number>(0)


  const loadPlanAccionResponses = React.useCallback(async (): Promise<{ ok: boolean; errorMessage: string | null; data: planAccionSeguimiento[];}> => {
      try {

        const response = await planesSeguimientos?.loadAll(id_plan_accion);

        if (!response?.status) {
          setTotal(0)
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando las respuestas de los planes de acción",
            ok: false,
            data: [],
          };
        }

        setRespuestas(response.data ?? []);
        setTotal(response.total ?? 0)

        return {
          errorMessage: null,
          ok: true,
          data: response.data ?? [],
        };
      } catch (e: unknown) {
        return {
          errorMessage: e instanceof Error ? e.message : String(e),
          ok: false,
          data: [],
        };
      }
    },
    [id_plan_accion, planesSeguimientos]
  );

  const loadSpecificRespuesta = React.useCallback(async (plan_id: string): Promise<{ ok: boolean; errorMessage: string | null; data: planAccionSeguimiento | null;}> => {
      try {


        const response = await planesSeguimientos?.load(plan_id);

        if (!response?.status) {
          setTotal(0)
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando la respuesta",
            ok: false,
            data: null,
          };
        }

        return {
          data: response.data,
          ok: true,
          errorMessage: ""
        }

      } catch (e: unknown) {
        return {
          errorMessage: e instanceof Error ? e.message : String(e),
          ok: false,
          data: null,
        };
      }
    },
    [planesSeguimientos]
  );


  return {
    loadPlanAccionResponses, loadSpecificRespuesta, respuestas, total,
  };
}
