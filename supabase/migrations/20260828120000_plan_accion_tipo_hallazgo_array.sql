-- tipo_hallazgo pasa de texto simple a lista (jsonb) para permitir seleccionar
-- uno o varios tipos de hallazgo por plan de accion.
alter table public."PLAN_ACCION"
  alter column tipo_hallazgo drop default;

alter table public."PLAN_ACCION"
  alter column tipo_hallazgo type jsonb
  using case
    when tipo_hallazgo is null or tipo_hallazgo = '' then '[]'::jsonb
    else jsonb_build_array(tipo_hallazgo)
  end;

alter table public."PLAN_ACCION"
  alter column tipo_hallazgo set default '[]'::jsonb;
