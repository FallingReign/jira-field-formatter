// Field-related API methods
import JiraApiClient from './client.js';

class FieldsApi {
  constructor() {
    this.client = new JiraApiClient();
    // Cache for issue type mappings: projectKey -> { name -> id }
    this.issueTypeCache = new Map();
    this.cacheTimestamp = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if issue type cache is valid for a project
   * @private
   */
  _isCacheValid(projectKey) {
    const timestamp = this.cacheTimestamp.get(projectKey);
    if (!timestamp) return false;
    return (Date.now() - timestamp) < this.cacheTTL;
  }

  /**
   * Get all issue types for a project
   * @private
   * @param {string} projectKey
   * @param {Object} logger
   * @returns {Promise<Array>} Array of issue type objects
   */
  async _getIssueTypes(projectKey, logger) {
    try {
      const response = await this.client.get(`project/${projectKey}`);
      
      if (!response.ok) {
        logger.error('_getIssueTypes error:', await response.text());
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data.issueTypes) ? data.issueTypes : [];
    } catch (error) {
      logger.error('_getIssueTypes exception:', error);
      return [];
    }
  }

  /**
   * Resolve issue type name to ID
   * @param {string} issueType - Either name or ID
   * @param {string} projectKey
   * @param {Object} logger
   * @returns {Promise<string>} Issue type ID
   */
  async resolveIssueTypeId(issueType, projectKey, logger = console) {
    // If it's already a numeric ID, return it
    if (/^\d+$/.test(issueType)) {
      return issueType;
    }

    // Check cache first
    if (this._isCacheValid(projectKey)) {
      const cached = this.issueTypeCache.get(projectKey);
      const resolvedId = cached?.[issueType.toLowerCase()];
      if (resolvedId) {
        return resolvedId;
      }
    }

    // Fetch issue types and build cache
    const issueTypes = await this._getIssueTypes(projectKey, logger);
    const nameToIdMap = {};
    
    for (const issueType of issueTypes) {
      if (issueType.name && issueType.id) {
        nameToIdMap[issueType.name.toLowerCase()] = issueType.id;
      }
    }

    // Update cache
    this.issueTypeCache.set(projectKey, nameToIdMap);
    this.cacheTimestamp.set(projectKey, Date.now());

    // Try to resolve the identifier
    const resolvedId = nameToIdMap[issueType.toLowerCase()];
    if (!resolvedId) {
      throw new Error(`Issue type '${issueType}' not found in project '${projectKey}'. Available issue types: ${Object.keys(nameToIdMap).join(', ')}`);
    }

    return resolvedId;
  }

  /**
   * Check if field is allowed for a project/issue type
   * @param {string} fieldName
   * @param {string} projectKey
   * @param {string} issueType - Issue type name or ID
   * @param {Object} logger
   * @returns {Promise<boolean>} True if field is allowed
   */
  async isFieldPresent(fieldName, projectKey, issueType, logger) {
    try {
      // Resolve issue type name to ID
      const issueTypeId = await this.resolveIssueTypeId(issueType, projectKey, logger);
      
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
   * @param {string} issueType - Issue type name or ID
   * @param {Object} logger
   * @returns {Promise<Object|null>} Field schema object or null
   */
  async getFieldSchema(fieldName, projectKey, issueType, logger) {
    try {
      // Resolve issue type name to ID
      const issueTypeId = await this.resolveIssueTypeId(issueType, projectKey, logger);
      
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
   * @param {string} issueType - Issue type name or ID
   * @param {Object} logger
   * @returns {Promise<Array>} Array of field schema objects
   */
  async getAllFieldSchemas(projectKey, issueType, logger) {
    try {
      // Resolve issue type name to ID
      const issueTypeId = await this.resolveIssueTypeId(issueType, projectKey, logger);
      
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
