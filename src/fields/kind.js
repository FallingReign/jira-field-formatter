// INTERNAL helper: derive minimal formatting kind from raw Jira schema.
// Intentionally tiny and data-driven; returns one of: 'date','datetime','number','array','raw'.
export function deriveKind(schema){
  if(!schema || typeof schema !== 'object') return 'raw';
  const t = (schema.type || schema.system || '').toLowerCase();
  switch(t){
    case 'date': return 'date';
    case 'datetime': return 'datetime';
    case 'number': return 'number';
    case 'array': return 'array';
    default: return 'raw';
  }
}

// Convenience predicate helpers (could expand later)
export const isDateKind = s => deriveKind(s) === 'date';
export const isDateTimeKind = s => deriveKind(s) === 'datetime';
export const isNumberKind = s => deriveKind(s) === 'number';
export const isArrayKind = s => deriveKind(s) === 'array';