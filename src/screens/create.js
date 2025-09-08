// INTERNAL create screen fetch implementation placeholder
import JiraApiClient from '../api/client.js';
import FieldsApi from '../api/fields.js';

const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

export async function getCreateScreen({ projectKey, issueType, forceRefresh, client }){
  const key = `${projectKey}:${issueType}`;
  const now = Date.now();
  const entry = cache.get(key);
  const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
  if(entry && !forceRefresh && !isTest && (now - entry.fetchedAt) < TTL_MS){
    return entry.data;
  }
  const http = client || new JiraApiClient();
  const resolver = new FieldsApi();
  const issueTypeId = await resolver.resolveIssueTypeId(issueType, projectKey, console);
  const resp = await http.get(`issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?maxResults=1000`);
  if(!resp.ok){
    throw new Error('Failed to fetch create meta');
  }
  const meta = await resp.json();
  const data = {
    projectKey,
    issueType,
    fields: (meta?.values || []).map(f => ({ id: f.id, name: f.name, required: !!f.required, schema: f.schema || {} }))
  };
  cache.set(key, { data, fetchedAt: now });
  return data;
}

export const __internalCreateScreenCache = { cache };
