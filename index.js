// New concise public surface – only noun facades
export { Fields } from './src/fields/index.js';
export { Issues } from './src/issues/index.js';
export { Projects } from './src/projects/index.js';
export { Users } from './src/users/index.js';
export { Screens } from './src/screens/index.js';
export { Diagnostics } from './src/diagnostics/index.js';

// (Optional) Raw API clients still available for advanced usage
export { JiraApiClient, UsersApi, IssuesApi, FieldsApi, resolveIssueTypeId } from './src/api/index.js';

// No default export – intentional.
