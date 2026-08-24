import './App.css'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { Form } from './components/form/form'
import { ListConfigPage } from './components/list-config/list-config-page'
import { LoginPage } from './components/login/LoginPage'
import React from 'react'
import type { zona } from './models/database/zona'
import type { jefe_zona } from './models/database/jefe_zona'
import type { tienda } from './models/database/tienda'
import type { bodega } from './models/database/bodega'
import type { tipo_tienda } from './models/database/tipo_tienda'
import type { auditor } from './models/database/auditor'
import { mapAreaResponsableOption, mapAuditorOption, mapJefeZonaOption, mapTipoTiendaOption, mapZonaOption } from './Funcionalidades/shared/react-select'
import { useRepositories } from './repositories/repositoriesContext'
import type { causal } from './models/database/causal'
import { AuditoriaHomePage } from './components/home/AuditoriaHomePage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import type { areas_responsables } from './models/database/areas_responsables'
import { PlanAccionHome } from './components/planes-accion/plan-accion-page'
import { PlanRespuesta } from './components/plan-respuesta/plan-respuesta'
import { NotAuthorizedPage } from './components/auth/NotAuthorizedPage'
import { ExportExcelPage } from './components/export-excel/export-excel-page'


type AuditoriaFormRouteProps = {
  auditoriaId?: number | null
  jefe_zonas: jefe_zona[]
  zonas: zona[]
  tienda: tienda[]
  bodegas: bodega[]
  tipos_tienda: tipo_tienda[]
  auditores: auditor[]
  causales: causal[]
  areasResponsables: areas_responsables[]
}

const estadoInventarioOptions = [
  { label: "Ejecutado", value: "Ejecutado" },
  { label: "Cancelado", value: "Cancelado" },
  { label: "No programado", value: "No programado" },
]

const causalCancelacionOptions = [
  { label: "Incumplimiento de politicas", value: 1 },
  { label: "Solicitud del jefe de zona", value: 2 },
  { label: "Solicitud de control interno", value: 3 },
  { label: "Priorizacion de otra actividad", value: 4 },
  { label: "Problemas operativos - sistema", value: 5 },
  { label: "Cierre inesperado de tienda", value: 6 },
  { label: "Otro", value: 7 },
]

function AuditoriaFormRoute(props: AuditoriaFormRouteProps) {
  return (
    <Form
      auditoriaId={props.auditoriaId}
      jefe_zonas={props.jefe_zonas.map((j) => mapJefeZonaOption(j))}
      zonas={props.zonas.map((z) => mapZonaOption(z))}
      tienda={props.tienda}
      bodegas={props.bodegas}
      tipos_tiendas={props.tipos_tienda.map((tt) => mapTipoTiendaOption(tt))}
      auditores={props.auditores.map((a) => mapAuditorOption(a))}
      modalidades={[
        { label: "Presencial", value: "Presencial" },
        { label: "Monitoreado", value: "Monitoreado" },
      ]}
      estado_invetarios={estadoInventarioOptions}
      causales_cancelacion={causalCancelacionOptions}
      estados_tienda={[
        { label: "Abierta", value: "Abierta" },
        { label: "Cerrada", value: "Cerrada" },
      ]}
      causales={props.causales}
      tiendas_originales={props.tienda} 
      areasResponsables={props.areasResponsables.map((a) => {return mapAreaResponsableOption(a)})}    />
  )
}

function EditAuditoriaRoute(props: Omit<AuditoriaFormRouteProps, 'auditoriaId'>) {
  const params = useParams()
  const auditoriaId = params.id ? Number(params.id) : null

  return <AuditoriaFormRoute {...props} auditoriaId={Number.isNaN(auditoriaId) ? null : auditoriaId} />
}

function PlanAccionRespuestaRoute({tiendas}: {tiendas: tienda[]}) {
  const params = useParams()
  const planAccionId = params.planAccionId ? Number(params.planAccionId) : null
  const auditoriaId = params.auditoriaId ? Number(params.auditoriaId) : null

  return (
    <PlanRespuesta
      planAccionId={Number.isNaN(planAccionId) ? null : planAccionId}
      auditoriaId={Number.isNaN(auditoriaId) ? null : auditoriaId} 
      tiendas={tiendas}    
      />
  )
}

function App() {
  const repositories = useRepositories()
  const [jefesZonas, setJefesZona] = React.useState<jefe_zona[]>([])
  const [zonas, setZonas] = React.useState<zona[]>([])
  const [tienda, setTienda] = React.useState<tienda[]>([])
  const [bodegas, setBodegas] = React.useState<bodega[]>([])
  const [tipos_tienda, setTiposTienda] = React.useState<tipo_tienda[]>([])
  const [auditores, setAuditores] = React.useState<auditor[]>([])
  const [causales, setCausales] = React.useState<causal[]>([])
  const [areasResponsables, setAreasResponsables] = React.useState<areas_responsables[]>([])


  React.useEffect(() => {
    async function cargarOptions() {
      const [bosses, zones, shops, bodeg, shops_types, auditors, causa, area] = await Promise.all([
        repositories.jefeZona?.loadOptions(),
        repositories.zonas?.loadOptions(),
        repositories.tienda?.loadOptions(),
        repositories.bodegas?.loadOptions(),
        repositories.tipo_tienda?.loadOptions(),
        repositories.auditores?.loadOptions(),
        repositories.causales?.loadOptions(),
        repositories.areasResponsables?.loadOptions()
      ])

      setJefesZona(bosses?.data ?? [])
      setZonas(zones?.data ?? [])
      setTienda(shops?.data ?? [])
      setBodegas(bodeg?.data ?? [])
      setTiposTienda(shops_types?.data ?? [])
      setAuditores(auditors?.data ?? [])
      setCausales(causa?.data ?? [])
      setAreasResponsables(area?.data ?? [])
    }

    cargarOptions();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/not-authorized" element={
        <ProtectedRoute allowedRoles={['authenticated', 'admin', 'auditor', 'supervisor']}>
          <NotAuthorizedPage />
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute allowedRoles={['admin', 'auditor']}>
          <AppShell>
            <AuditoriaHomePage
              auditores={auditores}
              tiendas={tienda}
              zonas={zonas}
              jefesZona={jefesZonas}
              modalidades={[
                { label: "Presencial", value: "Presencial" },
                { label: "Monitoreado", value: "Monitoreado" },
              ]}
              estadosInventario={estadoInventarioOptions}
            />
          </AppShell>
        </ProtectedRoute>
      }/>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/nueva-auditoria" element={
          <ProtectedRoute allowedRoles={['admin', 'auditor']}>
            <AppShell>
              <AuditoriaFormRoute
              jefe_zonas={jefesZonas}
              zonas={zonas}
              tienda={tienda}
              bodegas={bodegas}
              tipos_tienda={tipos_tienda}
              auditores={auditores}
              causales={causales} 
              areasResponsables={areasResponsables}              />
            </AppShell>
          </ProtectedRoute>
        }/>
      <Route path="/plan-accion" element={
          <ProtectedRoute allowedRoles={['admin', 'auditor']}>
            <AppShell>
              <PlanAccionHome 
                auditores={auditores} 
                tiendas={tienda} 
                zonas={zonas} 
                jefesZona={jefesZonas} 
                modalidades={[]} 
                estadosInventario={estadoInventarioOptions}            
              />
            </AppShell>
          </ProtectedRoute>
        }/>
      <Route path="/plan-accion-respuesta/:planAccionId/:auditoriaId" element={
          <ProtectedRoute allowedRoles={['authenticated', 'admin', 'auditor']}>
            <AppShell>
              <PlanAccionRespuestaRoute tiendas={tienda}/>
            </AppShell>
          </ProtectedRoute>
        }/>
      <Route path="/auditoria/:id" element={
        <ProtectedRoute allowedRoles={['admin', 'auditor']}>
          <AppShell>
            <EditAuditoriaRoute
              jefe_zonas={jefesZonas}
              zonas={zonas}
              tienda={tienda}
              bodegas={bodegas}
              tipos_tienda={tipos_tienda}
              auditores={auditores}
              causales={causales} areasResponsables={areasResponsables}            />
          </AppShell>
        </ProtectedRoute>
      }/>
      <Route path="/configuraciones" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppShell>
              <ListConfigPage />
            </AppShell>
          </ProtectedRoute>
        }/>
      <Route path="/exportar-excel" element={
          <ProtectedRoute allowedRoles={['admin', 'auditor']}>
            <AppShell>
              <ExportExcelPage
                auditores={auditores}
                tiendas={tienda}
                zonas={zonas}
                jefesZona={jefesZonas}
                bodegas={bodegas}
                tiposTienda={tipos_tienda}
                causales={causales}
                modalidades={[
                  { label: "Presencial", value: "Presencial" },
                  { label: "Monitoreado", value: "Monitoreado" },
                ]}
              />
            </AppShell>
          </ProtectedRoute>
        }/>
    </Routes>
  )
}

export default App
