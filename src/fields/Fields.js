// Public Fields facade
import { loadAllFields, loadCreateScreen } from './loader.js';
import { formatFieldValue, formatValues } from './formatter.js';
import { validateValues } from './validator.js';

function matchDescriptor(descriptors, fieldNameOrId, caseInsensitive){
  if(!caseInsensitive){
    return descriptors.find(d => d.id === fieldNameOrId || d.name === fieldNameOrId) || null;
  }
  const lower = fieldNameOrId.toLowerCase();
  return descriptors.find(d => d.id.toLowerCase() === lower || d.name.toLowerCase() === lower) || null;
}

export const Fields = {
  async getAll(opts = {}){
    return loadAllFields(opts);
  },
  async getAllForIssueType({ projectKey, issueType, forceRefresh, client }){
    return loadCreateScreen({ projectKey, issueType, forceRefresh, client });
  },
  async findField({ fieldNameOrId, projectKey, issueType, caseInsensitive, forceRefresh, client }){
    const descriptors = await this.getAllForIssueType({ projectKey, issueType, forceRefresh, client });
    return matchDescriptor(descriptors, fieldNameOrId, caseInsensitive);
  },
  async findFields({ fieldNamesOrIds, projectKey, issueType, caseInsensitive, forceRefresh, client }){
    const descriptors = await this.getAllForIssueType({ projectKey, issueType, forceRefresh, client });
    const found = [];
    const missing = [];
    for(const name of fieldNamesOrIds){
      const d = matchDescriptor(descriptors, name, caseInsensitive);
      if(d) found.push(d); else missing.push(name);
    }
    return { found, missing };
  },
  async formatValue({ fieldNameOrId, value, projectKey, issueType, caseInsensitive, client }){
    const d = await this.findField({ fieldNameOrId, projectKey, issueType, caseInsensitive, client });
    if(!d) return { error: 'UNKNOWN_FIELD', field: fieldNameOrId };
    return { field: d.id, ...formatFieldValue(d, value) };
  },
  async formatValues({ values, projectKey, issueType, options = {}, client }){
    const descriptors = await this.getAllForIssueType({ projectKey, issueType, client });
    return formatValues({ descriptors, inputValues: values, options });
  },
  async isRequired({ fieldNameOrId, projectKey, issueType, caseInsensitive, client }){
    const d = await this.findField({ fieldNameOrId, projectKey, issueType, caseInsensitive, client });
    return d ? d.required : false;
  }
};
