// Diagnostics facade
// Lightweight introspection of in-memory caches used by loaders.
import { __internalFieldCaches } from '../fields/loader.js';
import { __internalCreateScreenCache } from '../screens/create.js';

function summarizeMapCache(map){
  if(!map || typeof map.size !== 'number') return { size: 0 };
  return { size: map.size };
}

export const Diagnostics = {
  getCacheMeta(){
    const fieldsGlobal = __internalFieldCaches.globalCache;
    const issueTypeCache = __internalFieldCaches.issueTypeCache;
    const createMetaCache = __internalCreateScreenCache.cache;
    return {
      fields: {
        globalLoaded: !!fieldsGlobal.fields,
        issueTypeEntries: issueTypeCache.size
      },
      createMeta: summarizeMapCache(createMetaCache),
      users: { size: 0 }
    };
  },
  clearCache({ region } = {}){
    const cleared = [];
    if(!region || region === 'fields'){
      __internalFieldCaches.globalCache.fields = null;
      __internalFieldCaches.issueTypeCache.clear();
      cleared.push('fields');
    }
    if(!region || region === 'createMeta'){
      __internalCreateScreenCache.cache.clear();
      cleared.push('createMeta');
    }
    return { cleared };
  },
  getWarnings(){ return []; }
};
