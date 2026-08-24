export type ListDefinition = {
  id: string
  name: string
  shortName: string
}

export type ListItem = {
  id: string
  title: string
  subtitle: string
  summary: string
  status: boolean
  values: Record<string, string>
}

export type ItemMap = Record<string, ListItem[]>