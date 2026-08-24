import * as React from "react";
import { useRepositories } from "../../../repositories/repositoriesContext";
import type { planAccion } from "../../../models/database/plan_accion";
import type { usePlanAccionFilters } from "./usePlanAccionFilters";
import type { PlanAccionFilterOptions } from "../../../repositories/plan_accion/plan_accion.repository";

export function usePlanAccionList(filterController: ReturnType<typeof usePlanAccionFilters>) {
  const {planAccion} = useRepositories()
  const [planAccionRows, setPlanAccionRows] = React.useState<planAccion[]>([])
  const [total, setTotal] = React.useState<number>(0)
  const [hasNext, setHasNext] = React.useState<boolean>(false)


  const loadPlanAccion = React.useCallback(async (): Promise<{ ok: boolean; errorMessage: string | null; data: planAccion[];}> => {
      try {
        const filter: PlanAccionFilterOptions = {
          paginated: true,
          range: filterController.range,
          area_responsable: filterController.area_responsable,
          id_auditoria: filterController.id_auditoria,
          id_item: filterController.idItem,
          estado: filterController.estado,
          id_auditor: filterController.auditor,
          id_tienda: filterController.tienda,
          pageIndex: filterController.pageIndex ?? 1,
          pageSize: filterController.pageSize ?? 10,
        };

        const response = await planAccion?.loadAll(filter);

        if (!response?.status) {
          setTotal(0)
          setHasNext(false)
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando los planes de acción",
            ok: false,
            data: [],
          };
        }

        setPlanAccionRows(response.data ?? []);
        setTotal(response.total ?? 0)
        setHasNext(response.hasNext ?? true)

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
    [
      filterController.area_responsable,
      filterController.id_auditoria,
      filterController.idItem,
      filterController.pageIndex,
      filterController.estado,
      filterController.auditor,
      filterController.tienda,
      filterController.pageSize,
      filterController.range,
      planAccion,
    ]
  );

  const loadSpecificPlanAccion = React.useCallback(async (plan_id: string): Promise<{ ok: boolean; errorMessage: string | null; data: planAccion | null;}> => {
      try {


        const response = await planAccion?.load(plan_id);

        if (!response?.status) {
          setTotal(0)
          setHasNext(false)
          return {
            errorMessage: response?.message ?? "Algo ha salido mal cargando el plan de acción",
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
    [
      filterController.area_responsable,
      filterController.id_auditoria,
      filterController.idItem,
      filterController.pageIndex,
      filterController.estado,
      filterController.auditor,
      filterController.tienda,
      filterController.pageSize,
      filterController.range,
      planAccion,
    ]
  );

  const viewTotal = React.useMemo(() => {
    return planAccionRows.length
  }, [planAccionRows])

  const viewOnGoing = React.useMemo(() => {
    return planAccionRows.filter((p) =>
      p.estado.toLocaleLowerCase() === "en proceso"
    ).length
  }, [planAccionRows])

  const viewAfterDate = React.useMemo(
    () => planAccionRows.filter((p) => p.estado.toLowerCase() === "vencido").length,
    [planAccionRows]
  );

  const viewWaiting = React.useMemo(() => {
    return planAccionRows.filter((p) => 
      p.estado.toLocaleLowerCase() === "pendiente"
    ).length
  }, [planAccionRows])

  const viewFinished = React.useMemo(() => {
    return planAccionRows.filter((p) => 
       p.estado.toLocaleLowerCase() === "cerrado"
    ).length
  }, [planAccionRows])


  return {
    loadPlanAccion, planAccionRows, hasNext, total, viewTotal, viewOnGoing, viewAfterDate, viewWaiting, viewFinished, loadSpecificPlanAccion
  };
}
