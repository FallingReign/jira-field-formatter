// Pure helper functions delegating to IssueService
import IssueService from './issueService.js';
import { FieldService } from './index.js';
import { IssuesApi } from '../api/index.js';

export function formatIssueFields(rawFields, projectKey, issueTypeId, { fieldService, logger } = {}) {
  const svc = new IssueService({ fieldService: fieldService || new FieldService(), issuesApi: new IssuesApi(), logger });
  return svc.format(rawFields, projectKey, issueTypeId);
}

export function validateIssueFields(fields, projectKey, issueTypeId, { fieldService, logger } = {}) {
  const svc = new IssueService({ fieldService: fieldService || new FieldService(), issuesApi: new IssuesApi(), logger });
  return svc.validate(fields, projectKey, issueTypeId);
}

export function createIssue(issuePayload, { issuesApi, logger } = {}) {
  const svc = new IssueService({ fieldService: new FieldService(), issuesApi: issuesApi || new IssuesApi(), logger });
  return svc.create(issuePayload);
}
