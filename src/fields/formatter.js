import { isEmpty } from '../core/utils/isEmpty.js';
import { deriveKind } from './kind.js';

// Simple Levenshtein distance for suggestion scoring (small input set so perf fine)
function levenshtein(a, b){
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0] = i;
  for(let j=0;j<=n;j++) dp[0][j] = j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      if(a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1];
      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

function buildSuggestionList(input, descriptors, limit = 3){
  const scored = [];
  for(const d of descriptors){
    const labelCandidates = [d.name, d.id].filter(Boolean);
    let best = Infinity;
    for(const cand of labelCandidates){
      best = Math.min(best, levenshtein(input, cand));
    }
    scored.push({ value: d.name || d.id, score: best });
  }
  scored.sort((a,b)=> a.score - b.score);
  return scored.slice(0, limit).map(s => s.value);
}

// Simple date/datetime formatting placeholders (real impl can reuse existing utils once migrated)
function formatDate(value){
  if(!value) return value;
  if(value instanceof Date) return value.toISOString().slice(0,10); // YYYY-MM-DD
  return String(value);
}
function formatDateTime(value){
  if(!value) return value;
  if(value instanceof Date) return value.toISOString();
  return String(value);
}

export function formatFieldValue(descriptor, value){
  if(!descriptor) return { error: 'UNKNOWN_FIELD', value, formatted: null };
  if(isEmpty(value)) return { formatted: null };
  const kind = deriveKind(descriptor.schema);
  switch(kind){
    case 'date':
      return { formatted: formatDate(value) };
    case 'datetime':
      return { formatted: formatDateTime(value) };
    case 'number':
      return { formatted: Number(value) };
    case 'array':
      if(!Array.isArray(value)) return { error: 'EXPECTED_ARRAY', value, formatted: null };
      return { formatted: value.slice() };
    default:
      return { formatted: value };
  }
}

export function formatValues({ descriptors, inputValues, options = {} }){
  const { caseInsensitive, omitEmpty, suggestOnUnknown } = options;
  const fields = {};
  const errors = [];
  const warnings = [];
  const unknown = [];
  const suggestions = [];

  if(!descriptors || descriptors.length === 0){
    return { fields, errors, warnings, unknown: Object.keys(inputValues || {}), suggestions };
  }

  // Build quick lookup maps for case sensitive / insensitive matching
  let descriptorByExact = new Map();
  let descriptorByLower = null;
  for(const d of descriptors){
    descriptorByExact.set(d.id, d);
    descriptorByExact.set(d.name, d);
  }
  if(caseInsensitive){
    descriptorByLower = new Map();
    for(const d of descriptors){
      descriptorByLower.set(d.id.toLowerCase(), d);
      descriptorByLower.set(d.name.toLowerCase(), d);
    }
  }

  for(const [rawKey, rawVal] of Object.entries(inputValues || {})){
    let descriptor = descriptorByExact.get(rawKey);
    if(!descriptor && caseInsensitive){
      descriptor = descriptorByLower.get(rawKey.toLowerCase()) || null;
    }
    if(!descriptor){
      unknown.push(rawKey);
      if(suggestOnUnknown){
        suggestions.push({ input: rawKey, suggestions: buildSuggestionList(rawKey, descriptors) });
      }
      continue;
    }
    const { formatted, error } = formatFieldValue(descriptor, rawVal);
    if(error){
      errors.push({ field: descriptor.id, code: error, value: rawVal });
      continue;
    }
    if(isEmpty(rawVal) && omitEmpty){
      // skip entirely
      continue;
    }
    if(formatted !== null && formatted !== undefined){
      fields[descriptor.id] = formatted;
    }
  }

  return { fields, errors, warnings, unknown, suggestions, descriptors };
}
