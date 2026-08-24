import { startTransition, useDeferredValue, useState } from 'react'
import './list-config-page.css'
import { ConfigSidebar } from './sidebar'
import type { ItemMap, ListDefinition, ListItem } from '../../models/components/config'
import { ListItemCard } from './Card'
import { validateSession } from '../../auth/supabase.session.validation'
import { useNavigate } from 'react-router'
import React from 'react'
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
import { MarcaModal } from './modals/marca-modal'
import { CausalModal } from './modals/causal-modal'
import { AreaResponsableModal } from './modals/area-responsable-modal'
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
import { useAreaResponsable } from '../../Funcionalidades/configs/area_responsable/hooks/useAreaResponsable'
import toast from 'react-hot-toast'
import type { AuditorFormState } from './modals/auditor-modal'
import type { ZonaFormState } from './modals/zona-modal'
import type { JefeZonaFormState } from './modals/jefe-zona-modal'
import type { BodegaFormState } from './modals/bodega-modal'
import type { ItemEvaluacionFormState } from './modals/item-evaluacion-modal'
import type { TipoTiendaFormState } from './modals/tipo-tienda-modal'
import type { TiendaFormState, TiendaRelationOptions } from './modals/tienda-modal'
import type { MarcaFormState } from './modals/marca-modal'
import type { CausalFormState } from './modals/causal-modal'
import type { AreaResponsableFormState } from './modals/area-responsable-modal'
import type { CausalSelectOption } from '../../Funcionalidades/configs/causales/hooks/useCausalRelations'
import { ConfirmModal } from '../commons/confirmModal'


const listDefinitions: ListDefinition[] = [
  {
    id: 'auditores',
    name: 'Auditores',
    shortName: 'AU',
  },
  {
    id: 'causales',
    name: 'Causales',
    shortName: 'CA',
  },
  {
    id: 'zonas',
    name: 'Zonas',
    shortName: 'ZN',
  },
  {
    id: 'jefes-zona',
    name: 'Jefes de zona',
    shortName: 'JZ',
  },
  {
    id: 'tiendas',
    name: 'Tiendas',
    shortName: 'TD',
  },
  {
    id: 'tipos-tienda',
    name: 'Tipos de tienda',
    shortName: 'TT',
  },
  {
    id: 'marcas',
    name: 'Marcas',
    shortName: 'MK',
  },
  {
    id: 'bodegas',
    name: 'Bodegas',
    shortName: 'BG',
  },
  {
    id: 'areas-responsables',
    name: 'Areas responsables',
    shortName: 'AR',
  },
  {
    id: 'items-evaluacion',
    name: 'Items de evaluacion',
    shortName: 'IE',
  },
]

export function ListConfigPage() {
  const navigate = useNavigate();
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
    causales: []
  })
  const [selectedListId, setSelectedListId] = useState<string>(listDefinitions[0].id)
  const [search, setSearch] = useState('')
  const [activeItemId, setActiveItemId] = useState<string>("")
  const [isLogged, setIsLogged] = useState<boolean>(true)
  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState(false)
  const [auditorModalMode, setAuditorModalMode] = useState<'create' | 'edit'>('create')
  const [selectedAuditor, setSelectedAuditor] = useState<auditor | null>(null)
  const [auditorModalError, setAuditorModalError] = useState<string | null>(null)
  const [isZonaModalOpen, setIsZonaModalOpen] = useState(false)
  const [zonaModalMode, setZonaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedZona, setSelectedZona] = useState<zona | null>(null)
  const [zonaModalError, setZonaModalError] = useState<string | null>(null)
  const [isCausalModalOpen, setIsCausalModalOpen] = useState(false)
  const [causalModalMode, setCausalModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCausal, setSelectedCausal] = useState<causal | null>(null)
  const [causalModalError, setCausalModalError] = useState<string | null>(null)
  const [causalItemOptions, setCausalItemOptions] = useState<CausalSelectOption[]>([])
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ListItem | null>(null)
  const [isJefeZonaModalOpen, setIsJefeZonaModalOpen] = useState(false)
  const [jefeZonaModalMode, setJefeZonaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedJefeZona, setSelectedJefeZona] = useState<jefe_zona | null>(null)
  const [jefeZonaModalError, setJefeZonaModalError] = useState<string | null>(null)
  const [isBodegaModalOpen, setIsBodegaModalOpen] = useState(false)
  const [bodegaModalMode, setBodegaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedBodega, setSelectedBodega] = useState<bodega | null>(null)
  const [bodegaModalError, setBodegaModalError] = useState<string | null>(null)
  const [isItemEvaluacionModalOpen, setIsItemEvaluacionModalOpen] = useState(false)
  const [itemEvaluacionModalMode, setItemEvaluacionModalMode] = useState<'create' | 'edit'>('create')
  const [selectedItemEvaluacion, setSelectedItemEvaluacion] = useState<item_evaluacion | null>(null)
  const [itemEvaluacionModalError, setItemEvaluacionModalError] = useState<string | null>(null)
  const [isTipoTiendaModalOpen, setIsTipoTiendaModalOpen] = useState(false)
  const [tipoTiendaModalMode, setTipoTiendaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTipoTienda, setSelectedTipoTienda] = useState<tipo_tienda | null>(null)
  const [tipoTiendaModalError, setTipoTiendaModalError] = useState<string | null>(null)
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false)
  const [marcaModalMode, setMarcaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedMarca, setSelectedMarca] = useState<marca | null>(null)
  const [marcaModalError, setMarcaModalError] = useState<string | null>(null)
  const [isTiendaModalOpen, setIsTiendaModalOpen] = useState(false)
  const [tiendaModalMode, setTiendaModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTienda, setSelectedTienda] = useState<tienda | null>(null)
  const [tiendaModalError, setTiendaModalError] = useState<string | null>(null)
  const [isAreaResponsableModalOpen, setIsAreaResponsableModalOpen] = useState(false)
  const [areaResponsableModalMode, setAreaResponsableModalMode] = useState<'create' | 'edit'>('create')
  const [selectedAreaResponsable, setSelectedAreaResponsable] = useState<areas_responsables | null>(null)
  const [areaResponsableModalError, setAreaResponsableModalError] = useState<string | null>(null)
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

  async function openCreateForm() {
    if (selectedListId === 'auditores') {
      setActiveItemId('')
      setSelectedAuditor(null)
      setAuditorModalMode('create')
      setAuditorModalError(null)
      setIsAuditorModalOpen(true)
      return
    }

    if (selectedListId === 'zonas') {
      setActiveItemId('')
      setSelectedZona(null)
      setZonaModalMode('create')
      setZonaModalError(null)
      setIsZonaModalOpen(true)
      return
    }

    if (selectedListId === 'causales') {
      setActiveItemId('')
      setSelectedCausal(null)
      setCausalModalMode('create')
      setCausalModalError(null)
      const loaded = await prepareCausalRelations()

      if (!loaded) {
        return
      }

      setIsCausalModalOpen(true)
      return
    }

    if (selectedListId === 'jefes-zona') {
      setActiveItemId('')
      setSelectedJefeZona(null)
      setJefeZonaModalMode('create')
      setJefeZonaModalError(null)
      setIsJefeZonaModalOpen(true)
      return
    }

    if (selectedListId === 'tiendas') {
      setActiveItemId('')
      setSelectedTienda(null)
      setTiendaModalMode('create')
      setTiendaModalError(null)
      const loaded = await prepareTiendaRelations()

      if (!loaded) {
        return
      }

      setIsTiendaModalOpen(true)
      return
    }

    if (selectedListId === 'marcas') {
      setActiveItemId('')
      setSelectedMarca(null)
      setMarcaModalMode('create')
      setMarcaModalError(null)
      setIsMarcaModalOpen(true)
      return
    }

    if (selectedListId === 'bodegas') {
      setActiveItemId('')
      setSelectedBodega(null)
      setBodegaModalMode('create')
      setBodegaModalError(null)
      setIsBodegaModalOpen(true)
      return
    }

    if (selectedListId === 'areas-responsables') {
      setActiveItemId('')
      setSelectedAreaResponsable(null)
      setAreaResponsableModalMode('create')
      setAreaResponsableModalError(null)
      setIsAreaResponsableModalOpen(true)
      return
    }

    if (selectedListId === 'items-evaluacion') {
      setActiveItemId('')
      setSelectedItemEvaluacion(null)
      setItemEvaluacionModalMode('create')
      setItemEvaluacionModalError(null)
      setIsItemEvaluacionModalOpen(true)
      return
    }

    if (selectedListId === 'tipos-tienda') {
      setActiveItemId('')
      setSelectedTipoTienda(null)
      setTipoTiendaModalMode('create')
      setTipoTiendaModalError(null)
      setIsTipoTiendaModalOpen(true)
    }
  }

  async function openEditForm(item: ListItem) {
    if (selectedListId === 'auditores') {
      setActiveItemId(item.id)
      setAuditorModalError(null)

      const response = await auditorController.loadAuditor(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar el auditor.')
        setSelectedAuditor(null)
        setAuditorModalMode('edit')
        setIsAuditorModalOpen(true)
        return
      }

      setSelectedAuditor(response.data)
      setAuditorModalMode('edit')
      setIsAuditorModalOpen(true)
      return
    }

    if (selectedListId === 'zonas') {
      setActiveItemId(item.id)
      setZonaModalError(null)

      const response = await zonaController.loadAuditor(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar la zona.')
        setSelectedZona(null)
        setZonaModalMode('edit')
        setIsZonaModalOpen(true)
        return
      }

      setSelectedZona(response.data)
      setZonaModalMode('edit')
      setIsZonaModalOpen(true)
      return
    }

    if (selectedListId === 'causales') {
      setActiveItemId(item.id)
      setCausalModalError(null)
      const loaded = await prepareCausalRelations()

      if (!loaded) {
        return
      }

      const response = await causalController.loadCausal(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar la causal.')
        setSelectedCausal(null)
        setCausalModalMode('edit')
        setIsCausalModalOpen(true)
        return
      }

      setSelectedCausal(response.data)
      setCausalModalMode('edit')
      setIsCausalModalOpen(true)
      return
    }

    if (selectedListId === 'jefes-zona') {
      setActiveItemId(item.id)
      setJefeZonaModalError(null)

      const response = await jefeZonaController.loadJefeZona(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar el jefe de zona.')
        setSelectedJefeZona(null)
        setJefeZonaModalMode('edit')
        setIsJefeZonaModalOpen(true)
        return
      }

      setSelectedJefeZona(response.data)
      setJefeZonaModalMode('edit')
      setIsJefeZonaModalOpen(true)
      return
    }

    if (selectedListId === 'tiendas') {
      setActiveItemId(item.id)
      setTiendaModalError(null)
      const loaded = await prepareTiendaRelations()

      if (!loaded) {
        return
      }

      const response = await tiendaController.loadTienda(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar la tienda.')
        setSelectedTienda(null)
        setTiendaModalMode('edit')
        setIsTiendaModalOpen(true)
        return
      }

      setSelectedTienda(response.data)
      setTiendaModalMode('edit')
      setIsTiendaModalOpen(true)
      return
    }

    if (selectedListId === 'marcas') {
      setActiveItemId(item.id)
      setMarcaModalError(null)

      const response = await marcaController.loadMarca(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar la marca.')
        setSelectedMarca(null)
        setMarcaModalMode('edit')
        setIsMarcaModalOpen(true)
        return
      }

      setSelectedMarca(response.data)
      setMarcaModalMode('edit')
      setIsMarcaModalOpen(true)
      return
    }

    if (selectedListId === 'bodegas') {
      setActiveItemId(item.id)
      setBodegaModalError(null)

      const response = await bodegaController.loadBodega(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar la bodega.')
        setSelectedBodega(null)
        setBodegaModalMode('edit')
        setIsBodegaModalOpen(true)
        return
      }

      setSelectedBodega(response.data)
      setBodegaModalMode('edit')
      setIsBodegaModalOpen(true)
      return
    }

    if (selectedListId === 'areas-responsables') {
      setActiveItemId(item.id)
      setAreaResponsableModalError(null)

      const response = await areaResponsableController.loadAreaResponsable(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar el area responsable.')
        setSelectedAreaResponsable(null)
        setAreaResponsableModalMode('edit')
        setIsAreaResponsableModalOpen(true)
        return
      }

      setSelectedAreaResponsable(response.data)
      setAreaResponsableModalMode('edit')
      setIsAreaResponsableModalOpen(true)
      return
    }

    if (selectedListId === 'items-evaluacion') {
      setActiveItemId(item.id)
      setItemEvaluacionModalError(null)

      const response = await itemEvaluacionController.loadItemEvaluacion(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar el item de evaluacion.')
        setSelectedItemEvaluacion(null)
        setItemEvaluacionModalMode('edit')
        setIsItemEvaluacionModalOpen(true)
        return
      }

      setSelectedItemEvaluacion(response.data)
      setItemEvaluacionModalMode('edit')
      setIsItemEvaluacionModalOpen(true)
      return
    }

    if (selectedListId === 'tipos-tienda') {
      setActiveItemId(item.id)
      setTipoTiendaModalError(null)

      const response = await tipoTiendaController.loadTipoTienda(item.id)

      if (!response.ok || !response.data) {
        toast.error(response.errorMessage ?? 'No fue posible cargar el tipo de tienda.')
        setSelectedTipoTienda(null)
        setTipoTiendaModalMode('edit')
        setIsTipoTiendaModalOpen(true)
        return
      }

      setSelectedTipoTienda(response.data)
      setTipoTiendaModalMode('edit')
      setIsTipoTiendaModalOpen(true)
    }
  }

  function closeAuditorModal() {
    if (auditorController.loading) {
      return
    }

    setIsAuditorModalOpen(false)
    setAuditorModalError(null)
    setSelectedAuditor(null)
  }

  function closeZonaModal() {
    if (zonaController.loading) {
      return
    }

    setIsZonaModalOpen(false)
    setZonaModalError(null)
    setSelectedZona(null)
  }

  function closeCausalModal() {
    if (causalController.loading || causalRelationsController.loading) {
      return
    }

    setIsCausalModalOpen(false)
    setCausalModalError(null)
    setSelectedCausal(null)
  }

  function closeJefeZonaModal() {
    if (jefeZonaController.loading) {
      return
    }

    setIsJefeZonaModalOpen(false)
    setJefeZonaModalError(null)
    setSelectedJefeZona(null)
  }

  function closeBodegaModal() {
    if (bodegaController.loading) {
      return
    }

    setIsBodegaModalOpen(false)
    setBodegaModalError(null)
    setSelectedBodega(null)
  }

  function closeAreaResponsableModal() {
    if (areaResponsableController.loading) {
      return
    }

    setIsAreaResponsableModalOpen(false)
    setAreaResponsableModalError(null)
    setSelectedAreaResponsable(null)
  }

  function closeMarcaModal() {
    if (marcaController.loading) {
      return
    }

    setIsMarcaModalOpen(false)
    setMarcaModalError(null)
    setSelectedMarca(null)
  }

  function closeTiendaModal() {
    if (tiendaController.loading || tiendaRelationsController.loading) {
      return
    }

    setIsTiendaModalOpen(false)
    setTiendaModalError(null)
    setSelectedTienda(null)
  }

  function closeItemEvaluacionModal() {
    if (itemEvaluacionController.loading) {
      return
    }

    setIsItemEvaluacionModalOpen(false)
    setItemEvaluacionModalError(null)
    setSelectedItemEvaluacion(null)
  }

  function closeTipoTiendaModal() {
    if (tipoTiendaController.loading) {
      return
    }

    setIsTipoTiendaModalOpen(false)
    setTipoTiendaModalError(null)
    setSelectedTipoTienda(null)
  }

  async function handleAuditorSubmit(payload: AuditorFormState) {
    setAuditorModalError(null)

    const response =
      auditorModalMode === 'create'
        ? await auditorController.createAuditor(payload)
        : await auditorController.editAuditor(String(selectedAuditor?.id_auditor ?? ''), payload)

    if (!response) {
      setAuditorModalError('No fue posible guardar la informacion del auditor.')
      return
    }

    await loadAuditores()
    closeAuditorModal()
  }

  async function handleZonaSubmit(payload: ZonaFormState) {
    setZonaModalError(null)

    const response =
      zonaModalMode === 'create'
        ? await zonaController.createZona(payload)
        : await zonaController.editZona(String(selectedZona?.id_zona ?? ''), payload)

    if (!response) {
      setZonaModalError('No fue posible guardar la informacion de la zona.')
      return
    }

    await loadZonas()
    closeZonaModal()
  }

  async function handleCausalSubmit(payload: CausalFormState) {
    setCausalModalError(null)

    const response =
      causalModalMode === 'create'
        ? await causalController.createCausal(payload)
        : await causalController.editCausal(String(selectedCausal?.id_causal ?? ''), payload)

    if (!response) {
      setCausalModalError('No fue posible guardar la informacion de la causal.')
      return
    }

    await loadCausales()
    closeCausalModal()
  }

  async function handleJefeZonaSubmit(payload: JefeZonaFormState) {
    setJefeZonaModalError(null)

    const response =
      jefeZonaModalMode === 'create'
        ? await jefeZonaController.createJefeZona(payload)
        : await jefeZonaController.editJefeZona(String(selectedJefeZona?.id_jefe_zona ?? ''), payload)

    if (!response) {
      setJefeZonaModalError('No fue posible guardar la informacion del jefe de zona.')
      return
    }

    await loadJefesZona()
    closeJefeZonaModal()
  }

  async function handleBodegaSubmit(payload: BodegaFormState) {
    setBodegaModalError(null)

    const response =
      bodegaModalMode === 'create'
        ? await bodegaController.createBodega(payload)
        : await bodegaController.editBodega(String(selectedBodega?.id_bodega ?? ''), payload)

    if (!response) {
      setBodegaModalError('No fue posible guardar la informacion de la bodega.')
      return
    }

    await loadBodegas()
    closeBodegaModal()
  }

  async function handleAreaResponsableSubmit(payload: AreaResponsableFormState) {
    setAreaResponsableModalError(null)

    const response =
      areaResponsableModalMode === 'create'
        ? await areaResponsableController.createAreaResponsable(payload)
        : await areaResponsableController.editAreaResponsable(String(selectedAreaResponsable?.id_area_responsable ?? ''), payload)

    if (!response) {
      setAreaResponsableModalError('No fue posible guardar la informacion del area responsable.')
      return
    }

    await loadAreasResponsables()
    closeAreaResponsableModal()
  }

  async function handleMarcaSubmit(payload: MarcaFormState) {
    setMarcaModalError(null)

    const response =
      marcaModalMode === 'create'
        ? await marcaController.createMarca(payload)
        : await marcaController.editMarca(String(selectedMarca?.id_marca ?? ''), payload)

    if (!response) {
      setMarcaModalError('No fue posible guardar la informacion de la marca.')
      return
    }

    await loadMarcas()
    closeMarcaModal()
  }

  async function handleTiendaSubmit(payload: TiendaFormState) {
    setTiendaModalError(null)

    const response =
      tiendaModalMode === 'create'
        ? await tiendaController.createTienda(payload)
        : await tiendaController.editTienda(String(selectedTienda?.id_tienda ?? ''), payload)

    if (!response) {
      setTiendaModalError('No fue posible guardar la informacion de la tienda.')
      return
    }

    await loadTiendas()
    closeTiendaModal()
  }

  async function handleItemEvaluacionSubmit(payload: ItemEvaluacionFormState) {
    setItemEvaluacionModalError(null)

    const response =
      itemEvaluacionModalMode === 'create'
        ? await itemEvaluacionController.createItemEvaluacion(payload)
        : await itemEvaluacionController.editItemEvaluacion(String(selectedItemEvaluacion?.id_item_evaluacion ?? ''), payload)

    if (!response) {
      setItemEvaluacionModalError('No fue posible guardar la informacion del item de evaluacion.')
      return
    }

    await loadItemsEvaluacion()
    closeItemEvaluacionModal()
  }

  async function handleTipoTiendaSubmit(payload: TipoTiendaFormState) {
    setTipoTiendaModalError(null)

    const response =
      tipoTiendaModalMode === 'create'
        ? await tipoTiendaController.createTipoTienda(payload)
        : await tipoTiendaController.editTipoTienda(String(selectedTipoTienda?.id_tipo_tienda ?? ''), payload)

    if (!response) {
      setTipoTiendaModalError('No fue posible guardar la informacion del tipo de tienda.')
      return
    }

    await loadTiposTienda()
    closeTipoTiendaModal()
  }

  async function handleDelete(item: ListItem) {
    setPendingDeleteItem(item)
    setIsConfirmModalOpen(true)
  }

  function closeConfirmModal() {
    if (
      auditorController.loading ||
      causalController.loading ||
      zonaController.loading ||
      jefeZonaController.loading ||
      tiendaController.loading ||
      marcaController.loading ||
      bodegaController.loading ||
      areaResponsableController.loading ||
      itemEvaluacionController.loading ||
      tipoTiendaController.loading
    ) {
      return
    }

    setIsConfirmModalOpen(false)
    setPendingDeleteItem(null)
  }

  async function confirmDelete() {
    if (!pendingDeleteItem) {
      return
    }

    if (selectedListId === 'auditores') {
      const response = await auditorController.desactivateAuditor(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar el auditor.')
        return
      }

      await loadAuditores()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'zonas') {
      const response = await zonaController.desactivateZona(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar la zona.')
        return
      }

      await loadZonas()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'causales') {
      const response = await causalController.desactivateCausal(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar la causal.')
        return
      }

      await loadCausales()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'jefes-zona') {
      const response = await jefeZonaController.desactivateJefeZona(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar el jefe de zona.')
        return
      }

      await loadJefesZona()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'tiendas') {
      const response = await tiendaController.desactivateTienda(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar la tienda.')
        return
      }

      await loadTiendas()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'marcas') {
      const response = await marcaController.desactivateMarca(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar la marca.')
        return
      }

      await loadMarcas()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'bodegas') {
      const response = await bodegaController.desactivateBodega(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar la bodega.')
        return
      }

      await loadBodegas()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'areas-responsables') {
      const response = await areaResponsableController.desactivateAreaResponsable(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar el area responsable.')
        return
      }

      await loadAreasResponsables()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'items-evaluacion') {
      const response = await itemEvaluacionController.desactivateItemValuacion(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar el item de evaluacion.')
        return
      }

      await loadItemsEvaluacion()
      closeConfirmModal()
      return
    }

    if (selectedListId === 'tipos-tienda') {
      const response = await tipoTiendaController.desactivateTipoTienda(pendingDeleteItem.id)

      if (!response) {
        toast.error('No fue posible desactivar el tipo de tienda.')
        return
      }

      await loadTiposTienda()
      closeConfirmModal()
    }
  }

  async function loadAuditores() {
    const response = await auditorController.loadAuditores(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar auditores')
      return
    }

    const auditores = response.data?.map(mapAuditorToListItem)

    setItemsByList((current) => ({
      ...current,
      auditores,
    }))
  }

  async function loadZonas() {
    const response = await zonaController.loadZonas(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar zonas')
      return
    }

    const zonas = response.data?.map(mapZonaToListItem)

    setItemsByList((current) => ({
      ...current,
      zonas,
    }))
  }

  async function loadCausales() {
    const response = await causalController.loadCausales(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar causales')
      return
    }

    const causales = response.data?.map(mapCausalToListItem)

    setItemsByList((current) => ({
      ...current,
      causales,
    }))
  }

  async function loadJefesZona() {
    const response = await jefeZonaController.loadJefesZona(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar jefes de zona')
      return
    }

    const jefesZona = response.data?.map(mapJefeZonaToListItem)

    setItemsByList((current) => ({
      ...current,
      'jefes-zona': jefesZona,
    }))
  }

  async function loadTiendas() {
    const response = await tiendaController.loadTiendas(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar tiendas')
      return
    }

    const tiendas = response.data?.map(mapTiendaToListItem)

    setItemsByList((current) => ({
      ...current,
      tiendas,
    }))
  }

  async function loadMarcas() {
    const response = await marcaController.loadMarcas(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar marcas')
      return
    }

    const marcas = response.data?.map(mapMarcaToListItem)

    setItemsByList((current) => ({
      ...current,
      marcas,
    }))
  }

  async function loadBodegas() {
    const response = await bodegaController.loadBodegas(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar bodegas')
      return
    }

    const bodegas = response.data?.map(mapBodegaToItemList)

    setItemsByList((current) => ({
      ...current,
      bodegas,
    }))
  }

  async function loadAreasResponsables() {
    const response = await areaResponsableController.loadAreasResponsable(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar areas responsables')
      return
    }

    const areasResponsables = response.data?.map(mapAreaResponsableToListItem)

    setItemsByList((current) => ({
      ...current,
      'areas-responsables': areasResponsables,
    }))
  }

  async function loadItemsEvaluacion() {
    const response = await itemEvaluacionController.loadItemsEvaluacion(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar items de evaluacion')
      return
    }

    const itemsEvaluacion = response.data?.map(mapItemEvaluacionToItemList)

    setItemsByList((current) => ({
      ...current,
      'items-evaluacion': itemsEvaluacion,
    }))
  }

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

  async function loadTiposTienda() {
    const response = await tipoTiendaController.loadTipoTiendas(search)

    if (!response || !response.ok) {
      toast.error(response?.errorMessage ?? 'No fue posible cargar tipos de tienda')
      return
    }

    const tiposTienda = response.data?.map(mapTipoTiendaToListItem)

    setItemsByList((current) => ({
      ...current,
      'tipos-tienda': tiposTienda,
    }))
  }


  React.useEffect(() => {
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

  //Convertir auditores a listas
  React.useEffect(() => {
    async function getConfigs() {
      await loadAuditores()
      await loadCausales()
      await loadZonas()
      await loadJefesZona()
      await loadTiendas()
      await loadMarcas()
      await loadBodegas()
      await loadAreasResponsables()
      await loadItemsEvaluacion()
      await loadTiposTienda()
    }

    void getConfigs()
  }, [])

  if (isLogged === null) {
    return null
  }

  return (
    <main className="list-config">
      <ConfigSidebar setSelectedListId={setSelectedListId}  selectedDefinition={selectedDefinition}  itemsByList={itemsByList}/>

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
            <input type="search" placeholder={`Buscar ${selectedDefinition.name.toLowerCase()}`} value={search} onChange={(event) => {
                const nextValue = event.target.value
                startTransition(() => setSearch(nextValue))
              }}/>
          </label>

          <button
            className="list-config__primary-button"
            type="button"
            onClick={() => void openCreateForm()}
            disabled={!['auditores', 'causales', 'zonas', 'jefes-zona', 'tiendas', 'marcas', 'bodegas', 'areas-responsables', 'items-evaluacion', 'tipos-tienda'].includes(selectedListId)}
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
                  isActive={item.id === activeItemId}
                  onOpen={() => setActiveItemId(item.id)}
                  onEdit={() => void openEditForm(item)}
                  onDelete={() => void handleDelete(item)}
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

      <AuditorModal
        isOpen={isAuditorModalOpen}
        mode={auditorModalMode}
        initialData={selectedAuditor}
        isSaving={auditorController.loading}
        errorMessage={auditorModalError}
        onClose={closeAuditorModal}
        onSubmit={handleAuditorSubmit}
      />
      <ZonaModal
        isOpen={isZonaModalOpen}
        mode={zonaModalMode}
        initialData={selectedZona}
        isSaving={zonaController.loading}
        errorMessage={zonaModalError}
        onClose={closeZonaModal}
        onSubmit={handleZonaSubmit}
      />
      <CausalModal
        isOpen={isCausalModalOpen}
        mode={causalModalMode}
        initialData={selectedCausal}
        itemOptions={causalItemOptions}
        isLoadingRelations={causalRelationsController.loading}
        isSaving={causalController.loading}
        errorMessage={causalModalError}
        onClose={closeCausalModal}
        onSubmit={handleCausalSubmit}
      />
      <JefeZonaModal
        isOpen={isJefeZonaModalOpen}
        mode={jefeZonaModalMode}
        initialData={selectedJefeZona}
        isSaving={jefeZonaController.loading}
        errorMessage={jefeZonaModalError}
        onClose={closeJefeZonaModal}
        onSubmit={handleJefeZonaSubmit}
      />
      <BodegaModal
        isOpen={isBodegaModalOpen}
        mode={bodegaModalMode}
        initialData={selectedBodega}
        isSaving={bodegaController.loading}
        errorMessage={bodegaModalError}
        onClose={closeBodegaModal}
        onSubmit={handleBodegaSubmit}
      />
      <AreaResponsableModal
        isOpen={isAreaResponsableModalOpen}
        mode={areaResponsableModalMode}
        initialData={selectedAreaResponsable}
        isSaving={areaResponsableController.loading}
        errorMessage={areaResponsableModalError}
        onClose={closeAreaResponsableModal}
        onSubmit={handleAreaResponsableSubmit}
      />
      <MarcaModal
        isOpen={isMarcaModalOpen}
        mode={marcaModalMode}
        initialData={selectedMarca}
        isSaving={marcaController.loading}
        errorMessage={marcaModalError}
        onClose={closeMarcaModal}
        onSubmit={handleMarcaSubmit}
      />
      <TiendaModal
        isOpen={isTiendaModalOpen}
        mode={tiendaModalMode}
        initialData={selectedTienda}
        relationOptions={tiendaRelationOptions}
        isLoadingRelations={tiendaRelationsController.loading}
        isSaving={tiendaController.loading}
        errorMessage={tiendaModalError}
        onClose={closeTiendaModal}
        onSubmit={handleTiendaSubmit}
      />
      <ItemEvaluacionModal
        isOpen={isItemEvaluacionModalOpen}
        mode={itemEvaluacionModalMode}
        initialData={selectedItemEvaluacion}
        isSaving={itemEvaluacionController.loading}
        errorMessage={itemEvaluacionModalError}
        onClose={closeItemEvaluacionModal}
        onSubmit={handleItemEvaluacionSubmit}
      />
      <TipoTiendaModal
        isOpen={isTipoTiendaModalOpen}
        mode={tipoTiendaModalMode}
        initialData={selectedTipoTienda}
        isSaving={tipoTiendaController.loading}
        errorMessage={tipoTiendaModalError}
        onClose={closeTipoTiendaModal}
        onSubmit={handleTipoTiendaSubmit}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        mode="warning"
        title={
          selectedListId === 'zonas'
            ? 'Desactivar zona'
            : selectedListId === 'causales'
              ? 'Desactivar causal'
            : selectedListId === 'jefes-zona'
              ? 'Desactivar jefe de zona'
              : selectedListId === 'tiendas'
                ? 'Desactivar tienda'
              : selectedListId === 'marcas'
                ? 'Desactivar marca'
              : selectedListId === 'bodegas'
                ? 'Desactivar bodega'
                : selectedListId === 'areas-responsables'
                  ? 'Desactivar area responsable'
                : selectedListId === 'items-evaluacion'
                  ? 'Desactivar item de evaluacion'
                  : selectedListId === 'tipos-tienda'
                    ? 'Desactivar tipo de tienda'
              : 'Desactivar auditor'
        }
        description={
          pendingDeleteItem
            ? `Se desactivara ${
                selectedListId === 'zonas'
                  ? 'la zona'
                  : selectedListId === 'causales'
                    ? 'la causal'
                  : selectedListId === 'jefes-zona'
                    ? 'el jefe de zona'
                    : selectedListId === 'tiendas'
                      ? 'la tienda'
                    : selectedListId === 'marcas'
                      ? 'la marca'
                    : selectedListId === 'bodegas'
                      ? 'la bodega'
                      : selectedListId === 'areas-responsables'
                        ? 'el area responsable'
                      : selectedListId === 'items-evaluacion'
                        ? 'el item de evaluacion'
                        : selectedListId === 'tipos-tienda'
                          ? 'el tipo de tienda'
                    : 'el auditor'
              } "${pendingDeleteItem.title}".`
            : ''
        }
        confirmText="Desactivar"
        cancelText="Cancelar"
        onClose={closeConfirmModal}
        onSubmit={() => void confirmDelete()}
      />
    </main>
  )
}
