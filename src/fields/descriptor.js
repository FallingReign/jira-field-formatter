// INTERNAL: descriptor builder
import { mapSchema } from './mapper.js';

/**
 * Build a normalized field descriptor from raw Jira field info.
 */
export function buildDescriptor(raw){
  if(!raw) return null;
  const schemaInfo = mapSchema(raw.schema || {});
  return {
    id: raw.id,
    name: raw.name,
    required: !!raw.required,
    schema: raw.schema || {},
    fieldType: schemaInfo.fieldType,
    arrayItemType: schemaInfo.arrayItemType
  };
}
