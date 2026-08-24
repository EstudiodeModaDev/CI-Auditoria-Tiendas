export type causal = {
  id_causal?: number,
  created_at?: Date,
  id_item: string;
  descripcion: string
  activo: boolean
}

export type causalErrors = Partial<Record<keyof causal, string>>;