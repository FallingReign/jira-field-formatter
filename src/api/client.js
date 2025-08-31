// Jira API HTTP Client - core HTTP transport for JIRA REST API
// Renamed and refactored from src/http/httpClient.js

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load library's own .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libraryRoot = join(__dirname, '..', '..');
config({ path: join(libraryRoot, '.env') });

/**
 * Core HTTP client for Jira API communication
 * Handles authentication, configuration, and base HTTP operations
 */
class JiraApiClient {
  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.apiVersion = process.env.JIRA_API_VERSION;
    this.token = process.env.JIRA_TOKEN;
  }

  /**
   * Validate Jira configuration
   * @throws {Error} If Jira configuration is missing
   */
  validateConfig() {
    if (!this.baseURL || !this.apiVersion || !this.token) {
      throw new Error('Missing JIRA configuration in environment variables');
    }
  }

  /**
   * Create headers for Jira API requests
   * @returns {Object} Request headers
   */
  getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Atlassian-Token': 'no-check',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  /**
   * Construct full API endpoint
   * @param {string} endpoint - Endpoint path
   * @returns {string} Full API URL
   */
  getEndpoint(endpoint) {
    return `${this.baseURL}/rest/api/${this.apiVersion}/${endpoint}`;
  }

  /**
   * Make authenticated GET request to Jira API
   * @param {string} endpoint - API endpoint path
   * @returns {Promise<Response>} Fetch response
   */
  async get(endpoint) {
    this.validateConfig();
    return fetch(this.getEndpoint(endpoint), {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  /**
   * Make authenticated POST request to Jira API
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request body data
   * @returns {Promise<Response>} Fetch response
   */
  async post(endpoint, data) {
    this.validateConfig();
    return fetch(this.getEndpoint(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  }

  /**
   * Get base URL for link construction
   * @returns {string} Base URL
   */
  getBaseURL() {
    return this.baseURL;
  }
}

export default JiraApiClient;
