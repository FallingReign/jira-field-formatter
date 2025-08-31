// User-related API methods
import JiraApiClient from './client.js';

class UsersApi {
  constructor() {
    this.client = new JiraApiClient();
  }

  /**
   * Find a user in Jira
   * @param {string} username - Username to search
   * @param {Object} logger - Logging utility
   * @returns {Promise<string|null>} Username or null
   */
  async findUser(username, logger) {
    if (!username) return null;

    try {
      const response = await this.client.get(`user/search?username=${username}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('User search response:', errorText);
        return null;
      }

      const users = await response.json();
      return users && users.length > 0 ? users[0].name : null;
    } catch (error) {
      logger.error('Error finding user:', error);
      return null;
    }
  }
}

export default UsersApi;
