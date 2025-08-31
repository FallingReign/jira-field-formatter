// @deprecated Backward compatibility wrapper for the old HTTP client location.
// Use JiraApiClient from '../api/client.js' instead.
import JiraApiClient from '../api/client.js';

let warned = false;

class JiraHttpClient extends JiraApiClient {
  constructor() {
    super();
    if (!warned) {
      console.warn('[DEPRECATED] JiraHttpClient is deprecated. Use JiraApiClient from \'../api/client.js\'.');
      warned = true;
    }
  }
}

export default JiraHttpClient;
