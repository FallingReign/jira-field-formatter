// INTERNAL: Lazy schema classification with rule engine + caching
// Provides classifySchema(schema) returning { kind, confidence, item? }
// No hard-coded closed enum; rules can be extended later via configureClassifier.

const primitiveDirect = new Set(['string','number','date','datetime','user','priority','issuetype','project']);

let rules = [
  // Array rule
  function arrayRule(s){
    if(s?.type !== 'array') return null;
    let item = 'unknown';
    if(typeof s.items === 'string' && primitiveDirect.has(s.items)) item = s.items;
    return { kind: 'array', item, confidence: item === 'unknown' ? 0.7 : 0.9 };
  },
  // Direct primitive type
  function directPrimitive(s){
    if(s && primitiveDirect.has(s.type)){
      return { kind: s.type, confidence: 1.0 };
    }
    return null;
  },
  // System fallback
  function systemFallback(s){
    if(s?.system && primitiveDirect.has(s.system)){
      return { kind: s.system, confidence: 0.95 };
    }
    return null;
  },
  // Custom heuristics
  function customHeuristics(s){
    if(!s?.custom) return null;
    const id = String(s.custom).toLowerCase();
    if(id.includes('cascading') || id.includes('select')) return { kind: 'option', confidence: 0.8 };
    if(id.includes('user')) return { kind: 'user', confidence: 0.85 };
    if(id.includes('date') && id.includes('time')) return { kind: 'datetime', confidence: 0.75 };
    if(id.endsWith(':textarea')) return { kind: 'string', confidence: 0.7 };
    return null;
  }
];

export function configureClassifier({ additionalRules } = {}){
  if(Array.isArray(additionalRules) && additionalRules.length){
    // append before fallback
    rules = [...additionalRules, ...rules];
  }
}

const cache = new WeakMap();

export function classifySchema(schema){
  if(!schema || typeof schema !== 'object') return { kind: 'unknown', confidence: 0 };
  if(cache.has(schema)) return cache.get(schema);
  for(const rule of rules){
    try {
      const res = rule(schema);
      if(res){
        cache.set(schema, res);
        return res;
      }
    } catch(_e){ /* swallow rule errors */ }
  }
  const fallback = { kind: 'unknown', confidence: 0 };
  cache.set(schema, fallback);
  return fallback;
}
