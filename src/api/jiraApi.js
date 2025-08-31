// @deprecated Facade wrapper maintained for backward compatibility.
// Prefer using individual domain APIs (UsersApi, IssuesApi, FieldsApi, IssuesApi) and JiraApiClient directly.

import UsersApi from './users.js';
import IssuesApi from './issues.js';
import FieldsApi from './fields.js';

let depreciationWarned = false;

class JiraApi {
  constructor() {
    this.usersApi = new UsersApi();
    this.issuesApi = new IssuesApi();
    this.fieldsApi = new FieldsApi();
    if (!depreciationWarned) {
      console.warn('[DEPRECATED] JiraApi is deprecated. Use UsersApi/IssuesApi/FieldsApi directly.');
      depreciationWarned = true;
    }
  }

  /** @deprecated Use UsersApi.findUser */
  async findUser(username, logger) {
    return this.usersApi.findUser(username, logger);
  }

  /** @deprecated Use IssuesApi.createIssue */
  async createIssue(issueData, logger) {
    return this.issuesApi.createIssue(issueData, logger);
  }

  /** @deprecated Use IssuesApi.getIssueTypeIdByName */
  async getIssueTypeIdByName(projectKey, issueTypeName, logger) {
    return this.issuesApi.getIssueTypeIdByName(projectKey, issueTypeName, logger);
  }

  /** @deprecated Use FieldsApi.isFieldPresent */
  async isFieldPresent(fieldName, projectKey, issueTypeId, logger) {
    return this.fieldsApi.isFieldPresent(fieldName, projectKey, issueTypeId, logger);
  }

  /** @deprecated Use FieldsApi.getFieldSchema */
  async getFieldSchema(fieldName, projectKey, issueTypeId, logger) {
    return this.fieldsApi.getFieldSchema(fieldName, projectKey, issueTypeId, logger);
  }

  /** @deprecated Use FieldsApi.getAllFieldSchemas */
  async getAllFieldSchemas(projectKey, issueTypeId, logger) {
    return this.fieldsApi.getAllFieldSchemas(projectKey, issueTypeId, logger);
  }
}

export default JiraApi;
