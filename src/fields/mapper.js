// INTERNAL: schema -> internal type mapping via dynamic inference
// Strategy: prefer explicit schema.type; fall back to system; then derive from custom identifier patterns.
// Avoids hard-coded map so changes in Jira schema surface degrade gracefully to 'unknown'.
export function mapSchema(schema){
  if(!schema || typeof schema !== 'object') return { fieldType: 'unknown' };
  const { type, items, system, custom } = schema;

  // Direct primitive types we accept as-is
  const primitive = ['string','number','date','datetime','user','priority','issuetype','project'];
  if(primitive.includes(type)) return { fieldType: type };

  // Array: derive item subtype heuristically (string/number/option/user) else unknown
  if(type === 'array'){
    let arrayItemType = 'unknown';
    if(['string','number','user','option','date','datetime'].includes(items)) arrayItemType = items;
    return { fieldType: 'array', arrayItemType };
  }

  // System fallback if provided and looks like primitive
  if(system && primitive.includes(system)) return { fieldType: system };

  // Custom identifier heuristics
  if(custom){
    const id = custom.toLowerCase();
    if(id.includes('select')) return { fieldType: 'option' };
    if(id.includes('cascading')) return { fieldType: 'option' };
    if(id.includes('user')) return { fieldType: 'user' };
    if(id.includes('date') && id.includes('time')) return { fieldType: 'datetime' };
    if(id.endsWith(':textarea')) return { fieldType: 'string' };
  }

  return { fieldType: 'unknown' };
}
