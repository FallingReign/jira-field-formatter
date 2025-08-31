// Issue-related API methods
import JiraApiClient from './client.js';

class IssuesApi {
  constructor() {
    this.client = new JiraApiClient();
  }

  /**
   * Create a Jira issue
   * @param {Object} issueData - Issue creation data
   * @param {Object} logger - Logging utility
   * @returns {Promise<Object>} Created issue details
   */
  async createIssue(issueData, logger) {
    logger.info('Creating Jira issue with data:', JSON.stringify(issueData, null, 2));

    const response = await this.client.post('issue', issueData);

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Issue creation error:', errorData);
      throw new Error(`Failed to create issue: ${response.status} ${errorData}`);
    }

    const issue = await response.json();
    return {
      issue_link: `${this.client.getBaseURL()}/browse/${issue.key}`,
      issue_key: issue.key,
      issue_id: issue.id
    };
  }

  /**
   * Get issue type ID by name for a project
   * @param {string} projectKey
   * @param {string} issueTypeName
   * @param {Object} logger
   * @returns {Promise<string|null>} Issue type ID or null
   */
  async getIssueTypeIdByName(projectKey, issueTypeName, logger) {
    try {
      const response = await this.client.get(`issue/createmeta/${projectKey}/issuetypes`);
      
      if (!response.ok) {
        logger.error('getIssueTypeIdByName error:', await response.text());
        return null;
      }
      
      const data = await response.json();
      if (!data.values) return null;
      
      const issueType = data.values.find(it => it.name.toLowerCase() === issueTypeName.toLowerCase());
      return issueType ? issueType.id : null;
    } catch (error) {
      logger.error('getIssueTypeIdByName exception:', error);
      return null;
    }
  }
}

export default IssuesApi;
