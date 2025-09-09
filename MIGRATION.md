# Migration Guide (v2 → v3)

This guide summarizes the breaking changes and how to move to the new facade-based API. The final v3 design removed the interim dynamic classifier/mapper entirely—raw Jira schema is now passed through with only minimal formatting inference.

## Key Goals of v3
- Single, noun-based entry points (`Fields`, `Issues`, `Projects`, `Users`, `Screens`, `Diagnostics`).
- Remove legacy services (`FieldService`, `IssueService`) and scattered helpers.
- Eliminate static mapping tables / constants and ultimately any internal classification layer.
- Batch formatting focuses on field names/ids; internal logic handles schema & types.

## Removed / Replaced
| Legacy | Status | Replacement |
|--------|--------|-------------|
| `FieldService` | Removed | `Fields` facade methods |
| `IssueService` | Removed | `Issues.buildPayload` + `Issues.create` |
| `formatIssueFields()` | Removed | `Fields.formatValues()` |
| `validateIssueFields()` | Removed | `Issues.validatePayload()` (and internal field validation) |
| Root `formatFieldValue(value, type, arrayItemType?)` | Removed | `Fields.formatValue({ fieldNameOrId, value, projectKey, issueType })` (context-aware) |
| `Field` class | Removed | Plain descriptor objects |
| Static schema mapping constants | Removed | Raw schema passthrough + minimal `deriveKind` helper (internal) |
| `fields/constants.js` | Removed | Not needed |
| `mapper.js` / heuristic map layer | Removed | Not needed; raw schema only |

## What Stayed
| Still Available | Notes |
|-----------------|-------|
| `JiraApiClient`, `FieldsApi`, `IssuesApi`, `UsersApi`, `resolveIssueTypeId` | Advanced use; imported from root. |

## Descriptor Shape (v3 raw passthrough)
```js
{
  id: 'customfield_10010',
  name: 'Story Points',
  required: false,
  schema: { ...raw Jira schema... }
}
```

## Common Migration Examples
### 1. Single Field Formatting
Old:
```js
formatFieldValue('Bug', 'issuetype');
```
New (context aware):
```js
await Fields.formatValue({ fieldNameOrId: 'Issue Type', value: 'Bug', projectKey: 'PROJ', issueType: 'Task' });
```
If you only need a primitive transform (e.g., date) and already know the schema, you can create a tiny descriptor manually:
```js
import { Fields } from 'jira-formatter';
// Temporary helper (until optional public single-value helper considered)
const { field, formatted } = await Fields.formatValue({
  fieldNameOrId: 'Due Date',
  value: new Date(),
  projectKey: 'PROJ',
  issueType: 'Task'
});
```

### 2. Bulk Formatting
Old:
```js
FieldService.formatInputPayload(values, projectKey, issueType);
```
New:
```js
const result = await Fields.formatValues({
  values,
  projectKey: 'PROJ',
  issueType: 'Task',
  options: { caseInsensitive: true, omitEmpty: true }
});
// result: { fields, errors, warnings, unknown, suggestions }
```

### 3. Build Issue Payload
Old (implicit formatting):
```js
IssueService.prepare(rawValues, projectKey, issueType);
```
New (explicit, composable):
```js
const formatted = await Fields.formatValues({ values: rawValues, projectKey: 'PROJ', issueType: 'Bug' });
const { payload } = await Issues.buildPayload({
  projectKey: 'PROJ',
  issueType: 'Bug',
  values: rawValues
});
```

### 4. Create Issue
Old:
```js
IssueService.create(rawValues, projectKey, issueType);
```
New:
```js
const { payload } = await Issues.buildPayload({ projectKey: 'PROJ', issueType: 'Bug', values: rawValues });
await Issues.create(payload);
```

## FAQ
**Why remove root `formatFieldValue`?**  
It encouraged bypassing schema context (required flags, type inference). Facades ensure consistent descriptor-driven logic. A lightweight public helper may return later if needed.

**How do I map field names to IDs now?**  
`Fields.formatValues` and `Fields.formatValue` resolve IDs automatically based on the create screen for your project + issue type.

**What if I need a type hint?**  
Inspect `descriptor.schema`. Minimal strategies (date/datetime/number/array) are inferred on-the-fly; everything else is passthrough. Future diagnostics may surface unsupported schema patterns.

## Next Planned Enhancements (Post v3 Initial)
See `.ai/SYSTEM_OVERVIEW.md` Deferred Enhancements section (diagnostics warnings, optional formatting hook, strict mode, validation expansion).

## Versioning
Treat this as a breaking change (major). If you depended on removed symbols, refactor using the mappings above.

---
PRs welcome; open an issue if a removed helper blocks migration.
