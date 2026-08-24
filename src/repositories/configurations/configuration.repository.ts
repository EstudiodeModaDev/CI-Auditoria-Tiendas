

export type configurationsFilter = {
  nombre? : string,
  paginated: boolean
  pageSize?: number;
  pageNumber?: number;
  pageIndex?: number
}

export type configResult<T> = {
  data: T[]
  status: boolean
  message: string | null
  total?: number
  pageSize?: number
  pageIndex?: number
  hasNext?: boolean
}

export interface ConfigurationsRepository<T> {
  loadOptions(filter?: configurationsFilter): Promise<configResult<T>>;
  createOption(payload: T): Promise<{data: T | null, status: boolean, message: string | null}>;
  inactivateOption(id: string): Promise<{data: T | null, status: boolean, message: string | null}>;
  activateOption(id: string,): Promise<{data: T | null, status: boolean, message: string | null}>;
  getById(id: string): Promise<{data: T | null, status: boolean, message: string | null}>
  updateOption(id: string, payload: Partial<T>): Promise<{data: T | null, status: boolean, message: string | null}>
}
