# Test Index & Method Coverage

This file maps Section 3 public surface methods to test files.

| Module | Method | Test File |
|--------|--------|----------|
| Fields | getAll | fields.getAll.test.js |
| Fields | getAllForIssueType | fields.facade.test.js |
| Fields | findField | fields.facade.test.js |
| Fields | findFields | fields.facade.test.js |
| Fields | formatValue | fields.facade.test.js |
| Fields | formatValues | fields.facade.test.js |
| Fields | isRequired | fields.facade.test.js |
| Issues | buildPayload | issues.facade.test.js / issues.payload.test.js |
| Issues | validatePayload | issues.validatePayload.test.js |
| Issues | create | issues.create.test.js |
| Issues | createMany | (pending future) |
| Projects | list | projects.facade.extended.test.js |
| Projects | get | projects.facade.extended.test.js |
| Projects | getIssueTypes | projects.facade.extended.test.js |
| Projects | getIssueType | projects.facade.extended.test.js |
| Users | search | users.facade.test.js / users.facade.extended.test.js |
| Users | get | users.facade.extended.test.js |
| Diagnostics | getCacheMeta | diagnostics.facade.test.js |
| Diagnostics | clearCache | diagnostics.facade.test.js |
| Diagnostics | getWarnings | diagnostics.extended.test.js |
| Screens | getCreate | screens.facade.test.js |
| Screens | getCreate (cache) | screens.cache.test.js |
| LIVE | Fields.getAll | live/fields.live.test.js |
| LIVE | Issues.buildPayload | live/issues.live.test.js |
| LIVE | Screens.getCreate | live/screens.live.test.js |
| LIVE | Projects.list | live/projects.live.test.js |
| LIVE | Users.search | live/users.live.test.js |
| LIVE | Diagnostics.getCacheMeta | live/diagnostics.live.test.js |

Legend: LIVE tests require `LIVE_JIRA_TESTS=true` and Jira env vars.
