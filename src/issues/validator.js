// Payload validation (structure + required fields presence).
import { Fields } from '../fields/index.js';

export async function validatePayload({ payload }){
  const errors = [];
  if(!payload || typeof payload !== 'object'){
    return { valid: false, errors: [{ code: 'INVALID_PAYLOAD', message: 'Payload must be object' }], warnings: [] };
  }
  const fields = payload.fields || {};
  // Minimal checks for required structural keys
  if(!fields.project) errors.push({ code: 'MISSING_PROJECT', message: 'Missing project' });
  if(!fields.issuetype) errors.push({ code: 'MISSING_ISSUETYPE', message: 'Missing issuetype' });
  return { valid: errors.length === 0, errors, warnings: [] };
}
