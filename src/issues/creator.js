// Issue creation wrappers (new minimalist implementation bypassing deprecated jiraApi facade)
import JiraApiClient from '../api/client.js';

/**
 * Create a single issue via REST API
 * Mirrors shape of IssuesApi#createIssue return for compatibility
 */
export async function createIssue({ payload, client, logger = console }) {
  const http = client || new JiraApiClient();
  const resp = await http.post('issue', payload);
  if (!resp.ok) {
    const text = await resp.text();
    logger.error('createIssue error:', text);
    throw new Error(`Failed to create issue: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  return {
    issue_link: `${http.getBaseURL()}/browse/${data.key}`,
    issue_key: data.key,
    issue_id: data.id
  };
}

/**
 * Bulk create issues (Jira bulk endpoint). Returns raw response for now.
 * Future: normalize into array of issue_link/issue_key objects.
 */
export async function createIssuesBulk({ payloads, client, logger = console }) {
  const http = client || new JiraApiClient();
  const body = { issueUpdates: payloads };
  const resp = await http.post('issue/bulk', body);
  if (!resp.ok) {
    const text = await resp.text();
    logger.error('createIssuesBulk error:', text);
    throw new Error(`Failed bulk create: ${resp.status} ${text}`);
  }
  return resp.json();
}
