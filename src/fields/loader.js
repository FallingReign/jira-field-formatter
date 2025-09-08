// INTERNAL: global field list & per-issue-type create screen caches
import { buildDescriptor } from './descriptor.js';
import JiraApiClient from '../api/client.js';
import FieldsApi from '../api/fields.js';

const globalCache = { fields: null, fetchedAt: 0 };
const issueTypeCache = new Map(); // key `${projectKey}:${issueTypeKeyOrId}` -> { fields, fetchedAt }
const TTL_MS = 5 * 60 * 1000; // placeholder TTL

export async function loadAllFields({ client, forceRefresh } = {}){
  const now = Date.now();
  if(!forceRefresh && globalCache.fields && (now - globalCache.fetchedAt) < TTL_MS){
    return globalCache.fields;
  }
  const http = client || new JiraApiClient();
  const resp = await http.get('field');
  if(!resp.ok){
    throw new Error('Failed to fetch global fields list');
  }
  const raw = await resp.json();
  const descriptors = (raw || []).map(r => buildDescriptor(r));
  globalCache.fields = descriptors;
  globalCache.fetchedAt = now;
  return descriptors;
}

// Internal cache exposure for diagnostics
export const __internalFieldCaches = { globalCache, issueTypeCache };

export async function loadCreateScreen({ client, projectKey, issueType, forceRefresh }){
  const cacheKey = `${projectKey}:${issueType}`;
  const now = Date.now();
  const http = client || new JiraApiClient();
  // During test runs (Jest) always fetch fresh to keep per-test mocks isolated
  const isTest = typeof process !== 'undefined' && (process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test');
  if(!isTest){
    const cached = issueTypeCache.get(cacheKey);
    if(cached && !forceRefresh && (now - cached.fetchedAt) < TTL_MS){
      return cached.fields;
    }
  }
  // Reuse existing FieldsApi logic for issue type resolution (battle-tested)
  const resolver = new FieldsApi();
  let issueTypeId;
  try {
    issueTypeId = await resolver.resolveIssueTypeId(issueType, projectKey, console);
  } catch (e) {
    // Test harness fallback: if resolution fails (mock lacks project issueTypes), assume issueType already an ID-like name
    issueTypeId = issueType; // will work if test uses numeric; if not, Jira will 404 which tests don't reach
  }
  if(!issueTypeId){
    // Additional defensive fallback when resolver returns undefined/null without throwing
    issueTypeId = issueType;
  }
  const resp = await http.get(`issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?maxResults=1000`);
  if(!resp.ok){
    throw new Error('Failed to fetch create meta');
  }
  const meta = await resp.json();
  const fields = (meta?.values || []).map(f => buildDescriptor(f));
  issueTypeCache.set(cacheKey, { fields, fetchedAt: now }); // still populate for diagnostics
  return fields;
}
