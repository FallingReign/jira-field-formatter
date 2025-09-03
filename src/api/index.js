// API Layer - Raw JIRA REST API bindings
// Clean exports for all API modules

export { default as JiraApiClient } from './client.js';
export { default as UsersApi } from './users.js';
export { default as IssuesApi } from './issues.js';
export { default as FieldsApi } from './fields.js';

// Individual method exports for convenience (FR-011)
import FieldsApi from './fields.js';
const fieldsApi = new FieldsApi();
export const resolveIssueTypeId = (issueType, projectKey, logger) => 
  fieldsApi.resolveIssueTypeId(issueType, projectKey, logger);
