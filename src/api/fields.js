// Field-related API methods
import JiraApiClient from './client.js';

class FieldsApi {
  constructor() {
    this.client = new JiraApiClient();
  }

  /**
   * Check if field is allowed for a project/issue type
   * @param {string} fieldName
   * @param {string} projectKey
   * @param {string} issueTypeId
   * @param {Object} logger
   * @returns {Promise<boolean>} True if field is allowed
   */
  async isFieldPresent(fieldName, projectKey, issueTypeId, logger) {
    try {
      const response = await this.client.get(`issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?maxResults=1000`);
      
      if (!response.ok) {
        logger.error('isFieldPresent error:', await response.text());
        return false;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.values)) return false;
      const field = data.values.find(it => it.name.toLowerCase() === fieldName.toLowerCase());
      return !!field;
    } catch (error) {
      logger.error('isFieldPresent exception:', error);
      return false;
    }
  }

  /**
   * Get field schema information for a project/issue type
   * @param {string} fieldName
   * @param {string} projectKey  
   * @param {string} issueTypeId
   * @param {Object} logger
   * @returns {Promise<Object|null>} Field schema object or null
   */
  async getFieldSchema(fieldName, projectKey, issueTypeId, logger) {
    try {
      const response = await this.client.get(`issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?maxResults=1000`);
      
      if (!response.ok) {
        logger.error('getFieldSchema error:', await response.text());
        return null;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.values)) return null;
      const field = data.values.find(it => it.name.toLowerCase() === fieldName.toLowerCase());
      return field || null;
    } catch (error) {
      logger.error('getFieldSchema exception:', error);
      return null;
    }
  }

  /**
   * Get all field schemas for a project/issue type
   * @param {string} projectKey
   * @param {string} issueTypeId
   * @param {Object} logger
   * @returns {Promise<Array>} Array of field schema objects
   */
  async getAllFieldSchemas(projectKey, issueTypeId, logger) {
    try {
      const response = await this.client.get(`issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?maxResults=1000`);
      
      if (!response.ok) {
        logger.error('getAllFieldSchemas error:', await response.text());
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data.values) ? data.values : [];
    } catch (error) {
      logger.error('getAllFieldSchemas exception:', error);
      return [];
    }
  }
}

export default FieldsApi;
