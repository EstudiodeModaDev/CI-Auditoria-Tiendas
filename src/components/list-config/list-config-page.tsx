import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './list-config-page.css'
import { ConfigSidebar } from './sidebar'
import type { ItemMap, ListItem } from '../../models/components/config'
import { ListItemCard } from './Card'
import { validateSession } from '../../auth/supabase.session.validation'
import { useNavigate } from 'react-router'
import type { auditor } from '../../models/database/auditor'
import type { zona } from '../../models/database/zona'
import type { jefe_zona } from '../../models/database/jefe_zona'
import type { bodega } from '../../models/database/bodega'
import type { item_evaluacion } from '../../models/database/items_evaluacion'
import type { tipo_tienda } from '../../models/database/tipo_tienda'
import type { tienda } from '../../models/database/tienda'
import type { marca } from '../../models/database/marca'
import type { causal } from '../../models/database/causal'
import type { areas_responsables } from '../../models/database/areas_responsables'
import { mapAuditorToListItem } from '../../repositories/configurations/auditor.reposity'
import { mapZonaToListItem } from '../../repositories/configurations/zona.repository'
import { mapJefeZonaToListItem } from '../../repositories/configurations/jefes_zona.repository'
import { mapBodegaToItemList } from '../../repositories/configurations/bodega.repository'
import { mapItemEvaluacionToItemList } from '../../repositories/configurations/item_evaluacion.repository'
import { mapTipoTiendaToListItem } from '../../repositories/configurations/tipo_tienda.repository'
import { mapTiendaToListItem } from '../../repositories/configurations/tienda.repository'
import { mapMarcaToListItem } from '../../repositories/configurations/marca.repository'
import { mapCausalToListItem } from '../../repositories/configurations/causales.repository'
import { mapAreaResponsableToListItem } from '../../repositories/configurations/areas_responsables.repository'
import { AuditorModal } from './modals/auditor-modal'
import { ZonaModal } from './modals/zona-modal'
import { JefeZonaModal } from './modals/jefe-zona-modal'
import { BodegaModal } from './modals/bodega-modal'
import { ItemEvaluacionModal } from './modals/item-evaluacion-modal'
import { TipoTiendaModal } from './modals/tipo-tienda-modal'
import { TiendaModal } from './modals/tienda-modal'
import type { TiendaFormState, TiendaRelationOptions } from './modals/tienda-modal'
import { MarcaModal } from './modals/marca-modal'
import type { MarcaFormState } from './modals/marca-modal'
import { CausalModal } from './modals/causal-modal'
import type { CausalFormState } from './modals/causal-modal'
import { AreaResponsableModal } from './modals/area-responsable-modal'
import type { AreaResponsableFormState } from './modals/area-responsable-modal'
import type { AuditorFormState } from './modals/auditor-modal'
import type { ZonaFormState } from './modals/zona-modal'
import type { JefeZonaFormState } from './modals/jefe-zona-modal'
import type { BodegaFormState } from './modals/bodega-modal'
import type { ItemEvaluacionFormState } from './modals/item-evaluacion-modal'
import type { TipoTiendaFormState } from './modals/tipo-tienda-modal'
import { useAuditor } from '../../Funcionalidades/configs/auditor/hooks/useAuditor'
import { useZona } from '../../Funcionalidades/configs/zonas/hooks/useAuditor'
import { useJefeZona } from '../../Funcionalidades/configs/jefe-zona/hooks/useAuditor'
import { useBodega } from '../../Funcionalidades/configs/bodegas/hooks/useBodega'
import { useItemEvaluacion } from '../../Funcionalidades/configs/item_evaluacion/hooks/useItemEvaluacion'
import { useTipoTienda } from '../../Funcionalidades/configs/tipo_tienda/hooks/useTipoTienda'
import { useTienda } from '../../Funcionalidades/configs/tienda/hooks/useTienda'
import { useTiendaRelations } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { useMarca } from '../../Funcionalidades/configs/marca/hooks/useMarca'
import { useCausal } from '../../Funcionalidades/configs/causales/hooks/useCausal'
import { useCausalRelations } from '../../Funcionalidades/configs/causales/hooks/useCausalRelations'
import type { CausalSelectOption } from '../../Funcionalidades/configs/causales/hooks/useCausalRelations'
import { useAreaResponsable } from '../../Funcionalidades/configs/area_responsable/hooks/useAreaResponsable'
import toast from 'react-hot-toast'
import { ConfirmModal } from '../commons/confirmModal'
import {
  entityNoun,
  entityWithArticle,
  entityWithDePrefix,
  listDefinitions,
  type EntityId,
} from './entity-config'

// Los miembros con datos de entidad se declaran con sintaxis de metodo
// (`mapper(...)`, no `mapper: (...) =>`) a proposito: TypeScript compara los
// parametros de un metodo de forma bivariante, lo que permite que cada fila
// de `entityAdapters` use el tipo concreto de su propia entidad (auditor,
// zona, tienda...) en vez de forzar todo a traves de `any`.
type EntityAdapter = {
  mapper(raw: unknown): ListItem
  Modal(props: Record<string, unknown>): ReactNode
  getId(raw: unknown): string
  loadList(): Promise<{ ok: boolean; errorMessage?: string | null; data?: unknown[] | null } | undefined>
  loadSingle(id: string): Promise<{ ok: boolean; errorMessage?: string | null; data?: unknown | null }>
  create(payload: unknown): Promise<boolean>
  edit(id: string, payload: unknown): Promise<boolean>
  deactivate(id: string): Promise<boolean>
  activate(id: string): Promise<boolean>
  isSaving: boolean
  isLoadingRelations?: boolean
  prepareRelations?(): Promise<boolean>
  extraModalProps?: Record<string, unknown>
  // false cuando la activacion/desactivacion de esta entidad no debe hacerse
  // manualmente (p.ej. bodegas, que se desactivan automaticamente junto con
  // su tienda).
  canDeactivate?: boolean
  cannotDeactivateReason?: string
}

function isEntityBusy(adapter: EntityAdapter) {
  return adapter.isSaving || Boolean(adapter.isLoadingRelations)
}

type ModalState = {
  entityId: EntityId
  mode: 'create' | 'edit'
  data: unknown
}

export function ListConfigPage() {
  const navigate = useNavigate()
  const auditorController = useAuditor()
  const causalController = useCausal()
  const causalRelationsController = useCausalRelations()
  const zonaController = useZona()
  const jefeZonaController = useJefeZona()
  const bodegaController = useBodega()
  const itemEvaluacionController = useItemEvaluacion()
  const tipoTiendaController = useTipoTienda()
  const marcaController = useMarca()
  const tiendaController = useTienda()
  const tiendaRelationsController = useTiendaRelations()
  const areaResponsableController = useAreaResponsable()

  const [itemsByList, setItemsByList] = useState<ItemMap>({
    zonas: [],
    'jefes-zona': [],
    tiendas: [],
    'tipos-tienda': [],
    marcas: [],
    bodegas: [],
    'areas-responsables': [],
    'items-evaluacion': [],
    auditores: [],
    causales: [],
  })
  const [selectedListId, setSelectedListId] = useState<string>(listDefinitions[0].id)
  const [search, setSearch] = useState('')
  const [activeItemId, setActiveItemId] = useState<string>('')
  const [isLogged, setIsLogged] = useState<boolean>(true)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ListItem | null>(null)
  const [causalItemOptions, setCausalItemOptions] = useState<CausalSelectOption[]>([])
  const [tiendaRelationOptions, setTiendaRelationOptions] = useState<TiendaRelationOptions>({
    zonas: [],
    jefesZona: [],
    bodegas: [],
    tiposTienda: [],
    marcas: [],
  })

  const deferredSearch = useDeferredValue(search)
  const selectedDefinition =
    listDefinitions.find((definition) => definition.id === selectedListId) ?? listDefinitions[0]
  const selectedItems = itemsByList[selectedDefinition.id] ?? []
  const filteredItems = selectedItems.filter((item) => {
    const haystack = `${item.title} ${item.subtitle} ${item.summary} ${item.status}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  async function prepareTiendaRelations() {
    const response = await tiendaRelationsController.loadRelationOptions()

    if (!response.ok) {
      toast.error(response.errorMessage ?? 'No fue posible cargar las relaciones de la tienda.')
      return false
    }

    setTiendaRelationOptions(response.data)
    return true
  }

  async function prepareCausalRelations() {
    const response = await causalRelationsController.loadItemOptions()

    if (!response.ok) {
      toast.error(response.errorMessage ?? 'No fue posible cargar los items para la causal.')
      return false
    }

    setCausalItemOptions(response.data)
    return true
  }

  // Cada entidad se comporta igual (cargar, crear, editar, desactivar) pero
  // sus hooks/controladores exponen nombres de metodo distintos (algunos con
  // errores de copiar-pegar historicos, p.ej. zonaController.loadAuditor).
  // Esta tabla mapea esas particularidades una sola vez; el resto de la
  // pagina solo conoce la interfaz uniforme de EntityAdapter.
  const entityAdapters: Record<EntityId, EntityAdapter> = {
    auditores: {
      mapper: mapAuditorToListItem,
      Modal: AuditorModal,
      getId: (raw: auditor) => String(raw.id_auditor ?? ''),
      loadList: () => auditorController.loadAuditores(search),
      loadSingle: (id) => auditorController.loadAuditor(id),
      create: (payload: AuditorFormState) => auditorController.createAuditor(payload),
      edit: (id, payload: AuditorFormState) => auditorController.editAuditor(id, payload),
      deactivate: (id) => auditorController.desactivateAuditor(id),
      activate: (id) => auditorController.activateAuditor(id),
      isSaving: auditorController.loading,
    },
    zonas: {
      mapper: mapZonaToListItem,
      Modal: ZonaModal,
      getId: (raw: zona) => String(raw.id_zona ?? ''),
      loadList: () => zonaController.loadZonas(search),
      loadSingle: (id) => zonaController.loadAuditor(id),
      create: (payload: ZonaFormState) => zonaController.createZona(payload),
      edit: (id, payload: ZonaFormState) => zonaController.editZona(id, payload),
      deactivate: (id) => zonaController.desactivateZona(id),
      activate: (id) => zonaController.activateZona(id),
      isSaving: zonaController.loading,
    },
    causales: {
      mapper: mapCausalToListItem,
      Modal: CausalModal,
      getId: (raw: causal) => String(raw.id_causal ?? ''),
      loadList: () => causalController.loadCausales(search),
      loadSingle: (id) => causalController.loadCausal(id),
      create: (payload: CausalFormState) => causalController.createCausal(payload),
      edit: (id, payload: CausalFormState) => causalController.editCausal(id, payload),
      deactivate: (id) => causalController.desactivateCausal(id),
      activate: (id) => causalController.activateCausal(id),
      isSaving: causalController.loading,
      isLoadingRelations: causalRelationsController.loading,
      prepareRelations: prepareCausalRelations,
      extraModalProps: { itemOptions: causalItemOptions },
    },
    'jefes-zona': {
      mapper: mapJefeZonaToListItem,
      Modal: JefeZonaModal,
      getId: (raw: jefe_zona) => String(raw.id_jefe_zona ?? ''),
      loadList: () => jefeZonaController.loadJefesZona(search),
      loadSingle: (id) => jefeZonaController.loadJefeZona(id),
      create: (payload: JefeZonaFormState) => jefeZonaController.createJefeZona(payload),
      edit: (id, payload: JefeZonaFormState) => jefeZonaController.editJefeZona(id, payload),
      deactivate: (id) => jefeZonaController.desactivateJefeZona(id),
      activate: (id) => jefeZonaController.activateJefeZona(id),
      isSaving: jefeZonaController.loading,
    },
    tiendas: {
      mapper: mapTiendaToListItem,
      Modal: TiendaModal,
      getId: (raw: tienda) => String(raw.id_tienda ?? ''),
      loadList: () => tiendaController.loadTiendas(search),
      loadSingle: (id) => tiendaController.loadTienda(id),
      create: (payload: TiendaFormState) => tiendaController.createTienda(payload),
      edit: (id, payload: TiendaFormState) => tiendaController.editTienda(id, payload),
      deactivate: (id) => tiendaController.desactivateTienda(id),
      activate: (id) => tiendaController.activateTienda(id),
      isSaving: tiendaController.loading,
      isLoadingRelations: tiendaRelationsController.loading,
      prepareRelations: prepareTiendaRelations,
      extraModalProps: { relationOptions: tiendaRelationOptions },
    },
    'tipos-tienda': {
      mapper: mapTipoTiendaToListItem,
      Modal: TipoTiendaModal,
      getId: (raw: tipo_tienda) => String(raw.id_tipo_tienda ?? ''),
      loadList: () => tipoTiendaController.loadTipoTiendas(search),
      loadSingle: (id) => tipoTiendaController.loadTipoTienda(id),
      create: (payload: TipoTiendaFormState) => tipoTiendaController.createTipoTienda(payload),
      edit: (id, payload: TipoTiendaFormState) => tipoTiendaController.editTipoTienda(id, payload),
      deactivate: (id) => tipoTiendaController.desactivateTipoTienda(id),
      activate: (id) => tipoTiendaController.activateTipoTienda(id),
      isSaving: tipoTiendaController.loading,
    },
    marcas: {
      mapper: mapMarcaToListItem,
      Modal: MarcaModal,
      getId: (raw: marca) => String(raw.id_marca ?? ''),
      loadList: () => marcaController.loadMarcas(search),
      loadSingle: (id) => marcaController.loadMarca(id),
      create: (payload: MarcaFormState) => marcaController.createMarca(payload),
      edit: (id, payload: MarcaFormState) => marcaController.editMarca(id, payload),
      deactivate: (id) => marcaController.desactivateMarca(id),
      activate: (id) => marcaController.activateMarca(id),
      isSaving: marcaController.loading,
    },
    bodegas: {
      mapper: mapBodegaToItemList,
      Modal: BodegaModal,
      getId: (raw: bodega) => String(raw.id_bodega ?? ''),
      loadList: () => bodegaController.loadBodegas(search),
      loadSingle: (id) => bodegaController.loadBodega(id),
      create: (payload: BodegaFormState) => bodegaController.createBodega(payload),
      edit: (id, payload: BodegaFormState) => bodegaController.editBodega(id, payload),
      deactivate: (id) => bodegaController.desactivateBodega(id),
      activate: (id) => bodegaController.activateBodega(id),
      isSaving: bodegaController.loading,
      canDeactivate: false,
      cannotDeactivateReason: 'La bodega se desactiva automaticamente cuando se desactiva su tienda.',
    },
    'areas-responsables': {
      mapper: mapAreaResponsableToListItem,
      Modal: AreaResponsableModal,
      getId: (raw: areas_responsables) => String(raw.id_area_responsable ?? ''),
      loadList: () => areaResponsableController.loadAreasResponsable(search),
      loadSingle: (id) => areaResponsableController.loadAreaResponsable(id),
      create: (payload: AreaResponsableFormState) => areaResponsableController.createAreaResponsable(payload),
      edit: (id, payload: AreaResponsableFormState) => areaResponsableController.editAreaResponsable(id, payload),
      deactivate: (id) => areaResponsableController.desactivateAreaResponsable(id),
      activate: (id) => areaResponsableController.activateAreaResponsable(id),
      isSaving: areaResponsableController.loading,
    },
    'items-evaluacion': {
      mapper: mapItemEvaluacionToItemList,
      Modal: ItemEvaluacionModal,
      getId: (raw: item_evaluacion) => String(raw.id_item_evaluacion ?? ''),
      loadList: () => itemEvaluacionController.loadItemsEvaluacion(search),
      loadSingle: (id) => itemEvaluacionController.loadItemEvaluacion(id),
      create: (payload: ItemEvaluacionFormState) => itemEvaluacionController.createItemEvaluacion(payload),
      edit: (id, payload: ItemEvaluacionFormState) => itemEvaluacionController.editItemEvaluacion(id, payload),
      deactivate: (id) => itemEvaluacionController.desactivateItemValuacion(id),
      activate: (id) => itemEvaluacionController.activateItemEvaluacion(id),
      isSaving: itemEvaluacionController.loading,
    },
  }

  async function loadEntityItems(entityId: EntityId) {
    const adapter = entityAdapters[entityId]
    const response = await adapter.loadList()

    if (!response || !response.ok) {
      const definitionName = listDefinitions.find((definition) => definition.id === entityId)?.name ?? entityId
      toast.error(response?.errorMessage ?? `No fue posible cargar ${definitionName.toLowerCase()}`)
      return
    }

    const items = (response.data ?? []).map(adapter.mapper)
    setItemsByList((current) => ({ ...current, [entityId]: items }))
  }

  async function openCreateForm() {
    const entityId = selectedListId as EntityId
    const adapter = entityAdapters[entityId]

    if (!adapter) {
      return
    }

    setActiveItemId('')
    setModalError(null)

    if (adapter.prepareRelations && !(await adapter.prepareRelations())) {
      return
    }

    setModal({ entityId, mode: 'create', data: null })
  }

  async function openEditForm(item: ListItem) {
    const entityId = selectedListId as EntityId
    const adapter = entityAdapters[entityId]

    if (!adapter) {
      return
    }

    setActiveItemId(item.id)
    setModalError(null)

    if (adapter.prepareRelations && !(await adapter.prepareRelations())) {
      return
    }

    const response = await adapter.loadSingle(item.id)

    if (!response.ok || !response.data) {
      toast.error(response.errorMessage ?? `No fue posible cargar ${entityWithArticle(entityId)}.`)
      setModal({ entityId, mode: 'edit', data: null })
      return
    }

    setModal({ entityId, mode: 'edit', data: response.data })
  }

  function closeModal() {
    if (modal && isEntityBusy(entityAdapters[modal.entityId])) {
      return
    }

    setModal(null)
    setModalError(null)
  }

  async function handleModalSubmit(payload: unknown) {
    if (!modal) {
      return
    }

    const adapter = entityAdapters[modal.entityId]
    setModalError(null)

    const ok =
      modal.mode === 'create'
        ? await adapter.create(payload)
        : await adapter.edit(adapter.getId(modal.data), payload)

    if (!ok) {
      setModalError(`No fue posible guardar la informacion ${entityWithDePrefix(modal.entityId)}.`)
      return
    }

    await loadEntityItems(modal.entityId)
    closeModal()
  }

  function handleDelete(item: ListItem) {
    const adapter = entityAdapters[selectedListId as EntityId]

    if (adapter.canDeactivate === false) {
      toast.error(adapter.cannotDeactivateReason ?? 'Esta accion no esta disponible para esta lista.')
      return
    }

    setPendingDeleteItem(item)
    setIsConfirmModalOpen(true)
  }

  function closeConfirmModal() {
    if (Object.values(entityAdapters).some(isEntityBusy)) {
      return
    }

    setIsConfirmModalOpen(false)
    setPendingDeleteItem(null)
  }

  async function confirmDelete() {
    if (!pendingDeleteItem) {
      return
    }

    const entityId = selectedListId as EntityId
    const adapter = entityAdapters[entityId]
    const isActivating = !pendingDeleteItem.status
    const ok = isActivating
      ? await adapter.activate(pendingDeleteItem.id)
      : await adapter.deactivate(pendingDeleteItem.id)

    if (!ok) {
      toast.error(`No fue posible ${isActivating ? 'activar' : 'desactivar'} ${entityWithArticle(entityId)}.`)
      return
    }

    await loadEntityItems(entityId)
    closeConfirmModal()
  }

  useEffect(() => {
    async function checkSession() {
      const valid = await validateSession()

      if (!valid) {
        navigate('/login')
        return
      }

      setIsLogged(true)
    }

    checkSession()
  }, [navigate])

  useEffect(() => {
    void Promise.all(listDefinitions.map((definition) => loadEntityItems(definition.id as EntityId)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLogged === null) {
    return null
  }

  const activeAdapter = modal ? entityAdapters[modal.entityId] : null
  const ActiveModal = activeAdapter?.Modal

  return (
    <main className="list-config">
      <ConfigSidebar setSelectedListId={setSelectedListId} selectedDefinition={selectedDefinition} itemsByList={itemsByList} />

      <section className="list-config__workspace">
        <header className="list-config__hero">
          <div>
            <span className="list-config__eyebrow">Lista seleccionada</span>
            <h2>{selectedDefinition.name}</h2>
          </div>
        </header>

        {/*Busqueda*/}
        <div className="list-config__toolbar">
          <label className="list-config__search">
            <span>Buscar en la lista</span>
            <input
              type="search"
              placeholder={`Buscar ${selectedDefinition.name.toLowerCase()}`}
              value={search}
              onChange={(event) => {
                const nextValue = event.target.value
                startTransition(() => setSearch(nextValue))
              }}
            />
          </label>

          <button
            className="list-config__primary-button"
            type="button"
            onClick={() => void openCreateForm()}
            disabled={!entityAdapters[selectedListId as EntityId]}
          >
            Crear registro
          </button>
        </div>

        <div className="list-config__content">
          <section className="list-config__cards-panel">
            <div className="list-config__cards-grid">
              {filteredItems.map((item) => (
                <ListItemCard
                  key={item.id}
                  item={item}
                  isSelected={item.id === activeItemId}
                  onOpen={() => setActiveItemId(item.id)}
                  onEdit={() => void openEditForm(item)}
                  onDelete={() => handleDelete(item)}
                  deactivateDisabled={entityAdapters[selectedListId as EntityId].canDeactivate === false}
                />
              ))}

              {filteredItems.length === 0 ? (
                <article className="list-config__empty-state">
                  <strong>Sin resultados</strong>
                  <p>Ajusta la búsqueda o crea un nuevo registro para esta lista.</p>
                </article>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      {modal && ActiveModal ? (
        <ActiveModal
          isOpen
          mode={modal.mode}
          initialData={modal.data}
          isSaving={activeAdapter!.isSaving}
          isLoadingRelations={activeAdapter!.isLoadingRelations}
          errorMessage={modalError}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          {...activeAdapter!.extraModalProps}
        />
      ) : null}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        mode="warning"
        title={`${pendingDeleteItem?.status ? 'Desactivar' : 'Activar'} ${entityNoun(selectedListId as EntityId)}`}
        description={
          pendingDeleteItem
            ? `Se ${pendingDeleteItem.status ? 'desactivara' : 'activara'} ${entityWithArticle(selectedListId as EntityId)} "${pendingDeleteItem.title}".`
            : ''
        }
        confirmText={pendingDeleteItem?.status ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        isLoading={Object.values(entityAdapters).some(isEntityBusy)}
        onClose={closeConfirmModal}
        onSubmit={() => void confirmDelete()}
      />
    </main>
  )
}
