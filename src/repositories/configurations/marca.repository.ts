import type { ListItem } from '../../models/components/config'
import type { marca } from '../../models/database/marca'
import { supabase } from '../../services/supabase.service'
import type { configResult, configurationsFilter, ConfigurationsRepository } from './configuration.repository'

export class SupabaseMarcaRepository implements ConfigurationsRepository<marca> {
  private readonly tableName = 'MARCA'

  async activateOption(id: string): Promise<{ data: marca | null; status: boolean; message: string | null }> {
    if (!id) {
      return {
        data: null,
        status: false,
        message: 'Debe seleccionar un ID',
      }
    }

    const { data, error } = await supabase.from(this.tableName).update({ activo: true }).eq('id_marca', id)

    if (error) {
      return {
        data: null,
        message: error.message ?? 'Algo ha salido mal',
        status: false,
      }
    }

    return {
      data,
      message: null,
      status: true,
    }
  }

  async loadOptions(filter?: configurationsFilter): Promise<configResult<marca>> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact' })

      if (filter?.nombre) {
        query = query.eq('nombre', filter.nombre)
      }

      const pageSize = Math.max(1, Number(filter?.pageSize ?? 10))
      const pageIndex = Math.max(1, Number(filter?.pageIndex ?? 1))
      const from = (pageIndex - 1) * pageSize
      const to = from + pageSize - 1

      if (filter?.paginated) {
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        return {
          data: [],
          message: error.message,
          status: false,
        }
      }

      return {
        data,
        hasNext: filter?.paginated ? from + (data?.length ?? 0) < (count ?? 0) : false,
        message: null,
        pageIndex,
        pageSize,
        status: true,
        total: count ?? data?.length ?? 0,
      }
    } catch (error: any) {
      return {
        data: [],
        status: false,
        message: error?.message ?? 'Error cargando las marcas registradas',
      }
    }
  }

  async createOption(payload: Partial<marca>): Promise<{ data: marca | null; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase.from(this.tableName).insert(payload).select().single()

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
        }
      }

      return {
        data,
        message: null,
        status: true,
      }
    } catch (e: any) {
      return {
        data: null,
        message: e?.message ?? 'Error creando la marca',
        status: false,
      }
    }
  }

  async updateOption(
    id: string,
    payload: Partial<marca>,
  ): Promise<{ data: marca | null; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq('id_marca', id)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
        }
      }

      return {
        data,
        message: null,
        status: true,
      }
    } catch (e: any) {
      return {
        data: null,
        message: e?.message ?? 'Error actualizando la marca',
        status: false,
      }
    }
  }

  async getById(id: string): Promise<{ data: marca | null; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase.from(this.tableName).select('*').eq('id_marca', id).single()

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
        }
      }

      return {
        data,
        message: null,
        status: true,
      }
    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? 'Error cargando la marca seleccionada',
      }
    }
  }

  async inactivateOption(id: string): Promise<{ data: marca | null; status: boolean; message: string | null }> {
    if (!id) {
      return {
        data: null,
        status: false,
        message: 'Debe seleccionar un ID',
      }
    }

    const { data, error } = await supabase.from(this.tableName).update({ activo: false }).eq('id_marca', id)

    if (error) {
      return {
        data: null,
        message: error.message ?? 'Algo ha salido mal',
        status: false,
      }
    }

    return {
      data,
      message: null,
      status: true,
    }
  }
}

export function mapMarcaToListItem(marca: marca): ListItem {
  return {
    id: String(marca.id_marca),
    title: marca.nombre,
    subtitle: '',
    summary: marca.activo ? 'Marca activa en el sistema.' : 'Marca inactiva.',
    status: marca.activo,
    values: {
      id_marca: String(marca.id_marca),
      nombre: marca.nombre,
      activo: marca.activo ? 'true' : 'false',
      created_at: String(marca.created_at),
    },
  }
}
