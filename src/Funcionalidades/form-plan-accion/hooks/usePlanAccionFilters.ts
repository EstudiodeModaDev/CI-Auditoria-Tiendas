import React from "react"
import type { DateRange } from "../../../models/commons"

export function usePlanAccionFilters(){
  const[id_auditoria, setIdAuditoria] = React.useState<number | null>(null)
  const[idItem, setIdItem] = React.useState<number | null>(null)
  const[area_responsable, setAreaResponsable] = React.useState<number | null>(null)
  const[pageSize, setPageSize] = React.useState<number | null>(10)
  const[pageIndex, setPageIndex] = React.useState<number | null>(1)
  const[range, setRange] = React.useState<DateRange>({from: null, to: null})
  const[estado, setEstado] = React.useState<string>("")
  const[auditor, setAuditor] = React.useState<number | null>(null)
  const[tienda, setTienda] = React.useState<number | null>(null)

  const nextPage = React.useCallback(() => {
    setPageIndex((current) => Number(current ?? 1) + 1)
  }, [])

  const prevPage = React.useCallback(() => {
    setPageIndex((current) => Math.max(1, Number(current ?? 1) - 1))
  }, [])

  const resetFilters = () => {
    setIdAuditoria(null),
    setIdItem(null)
    setAreaResponsable(null)
    setPageSize(10)
    setPageIndex(1)
    setRange({from: null, to: null})
    setEstado("")
  }

  return {
    id_auditoria, setIdAuditoria, idItem, setIdItem, area_responsable, setAreaResponsable, pageSize, setPageSize, pageIndex, range, setRange,
    setPageIndex, nextPage, prevPage, resetFilters, estado, setEstado, auditor, setAuditor, tienda, setTienda
  }
}
