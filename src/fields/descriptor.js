// INTERNAL: descriptor builder (raw passthrough – no classification)
// We intentionally do NOT derive fieldType / arrayItemType to avoid bias.
export function buildDescriptor(raw){
  if(!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    required: !!raw.required,
    schema: raw.schema || {}
  };
}
