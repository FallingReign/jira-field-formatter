// Build Jira payload from raw values via Fields facade.
import { Fields } from '../fields/index.js';

export async function buildPayload({ projectKey, issueType, values, options = {}, client }){
  // First format incoming values (handles caseInsensitive etc.)
  const formatted = await Fields.formatValues({ values, projectKey, issueType, options, client });
  const descriptors = formatted.descriptors || await Fields.getAllForIssueType({ projectKey, issueType, client });

  // Build quick set of provided field IDs for detection
  const providedIds = new Set(Object.keys(formatted.fields));

  for(const d of descriptors){
    if(!d.required) continue;
    if(!providedIds.has(d.id)){
      formatted.errors.push({ code: 'MISSING_REQUIRED_FIELD', field: d.id });
    }
  }

  const payload = {
    fields: {
      project: { key: projectKey },
      issuetype: typeof issueType === 'string' ? { name: issueType } : { id: issueType },
      ...formatted.fields
    }
  };
  return {
    payload,
    diagnostics: {
      errors: formatted.errors,
      warnings: formatted.warnings,
      unknown: formatted.unknown,
      suggestions: formatted.suggestions || []
    }
  };
}
