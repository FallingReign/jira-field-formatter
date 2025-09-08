# Jira Field Formatter

Convert your data into the format Jira expects using simple facade objects (`Fields`, `Issues`, etc.). Dynamic schema inference – no manual type constants.

[![npm version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/FallingReign/jira-field-formatter)

## What do you need to do?

| **I want to...** | **Use this** | **Example** |
|------------------|--------------|-------------|
| Format a single field (context aware) | `Fields.formatValue()` | `Fields.formatValue({ fieldNameOrId: 'Summary', value: 'Fix bug', projectKey: 'APP', issueType: 'Bug' })` |
| Format multiple fields | `Fields.formatValues()` | Bulk convert spreadsheet data |
| Create a complete Jira issue payload | `Issues.buildPayload()` | Build payload for Jira REST |

## Quick Examples

```javascript
import { Fields, Issues } from 'jira-field-formatter';

// Format one field (descriptor resolved via create screen)
const summary = await Fields.formatValue({
  fieldNameOrId: 'Summary',
  value: 'Fix login redirect',
  projectKey: 'APP',
  issueType: 'Bug'
});

// Bulk format
const rawValues = { Summary: 'Fix login redirect', Labels: 'urgent,frontend', Priority: 'High' };
const formatted = await Fields.formatValues({
  values: rawValues,
  projectKey: 'APP',
  issueType: 'Bug',
  options: { caseInsensitive: true, omitEmpty: true, suggestOnUnknown: true }
});

// Build issue payload
const { payload } = await Issues.buildPayload({
  projectKey: 'APP',
  issueType: 'Bug',
  values: rawValues
});
```

## Installation

### Git Submodule (Recommended)
```bash
git submodule add https://github.com/FallingReign/jira-field-formatter.git lib/jira-field-formatter
cd lib/jira-field-formatter && git checkout v3.0.0 && cd ../..
git add . && git commit -m "Add jira-field-formatter submodule"
```

### Import in your code
```javascript
import { formatFieldValue, Fields, Issues } from './lib/jira-field-formatter/index.js';
```

> **Requirements:** Node.js 14+ with ES modules support

## 🔧 Submodule Management

### Updating Your Submodule

```bash
# Update to latest development version
cd lib/jira-field-formatter
git checkout master
git pull origin master
cd ../..
git add lib/jira-field-formatter
git commit -m "Update jira-field-formatter to latest development"

# Or switch to a different version
cd lib/jira-field-formatter
git fetch origin
git checkout v1.3.0  # Replace with desired version
cd ../..
git add lib/jira-field-formatter
git commit -m "Update jira-field-formatter to v1.3.0"
```

### When Others Clone Your Project

```bash
# Clone with submodules
git clone --recursive https://github.com/your-username/your-project.git

# Or initialize submodules after cloning
git clone https://github.com/your-username/your-project.git
cd your-project
git submodule update --init --recursive
```

📖 **Complete submodule setup guide included below**

> **Important:** This library is ESM-only and requires Node.js 14+ with ES modules support. It does not support CommonJS.

### 🔍 Version Management

Users can easily check their version and get updates using the included version check script (floating `latest` tag discontinued – only semantic version tags are published now):

```bash
# Copy the version checker to your project
cp lib/jira-field-formatter/scripts/version-check.js ./check-version.js

# Check your current version and available updates  
node check-version.js
```

## Quick Start

```javascript
import { Fields, Issues } from 'jira-field-formatter';

const one = await Fields.formatValue({ fieldNameOrId: 'Summary', value: 'Add search', projectKey: 'APP', issueType: 'Task' });
const many = await Fields.formatValues({ values: { Summary: 'Add search', Labels: 'feature,search' }, projectKey: 'APP', issueType: 'Task' });
```

## 🏷️ Issue Type Resolution

Use natural issue type names everywhere:

```javascript
import { FieldsApi } from 'jira-field-formatter';
const fieldsApi = new FieldsApi();
const taskFields = await fieldsApi.getAllFieldSchemas('PROJ', 'Task');
const bugSchema = await fieldsApi.getFieldSchema('Priority', 'PROJ', 'Bug');
```

## 🧠 Issue Payload Assembly (Issues facade)

Use the `Fields` and `Issues` facades for all workflows. Legacy services were removed in v3.

```javascript
import { Fields, Issues } from 'jira-field-formatter';
const formatted = await Fields.formatValues({
  values: { Summary: ' Title ', Labels: 'one,two', Foo: 'x' },
  projectKey: 'PROJ',
  issueType: 'Task',
  options: { omitEmpty: true }
});
const { payload } = await Issues.buildPayload({ projectKey: 'PROJ', issueType: 'Task', values: { Summary: ' Title ', Labels: 'one,two', Foo: 'x' } });
```

## 🔀 Decision Matrix (Simplified)

| Scenario | Use This | Returns | Throws | Notes |
|----------|----------|---------|--------|-------|
| Format one field with context | `Fields.formatValue()` | `{ field, formatted, error? }` | Never (collects) | Resolves descriptor first |
| Bulk format raw fields | `Fields.formatValues()` | `{ fields, errors, warnings, unknown, suggestions }` | Never | Normalization + suggestions |
| Build issue payload | `Issues.buildPayload()` | `{ payload, diagnostics }` | Arg validation | Assembles full Jira payload |

## 🧩 Function Catalog (Facades)

| Facade | Purpose | Key Methods |
|--------|---------|-------------|
| `Fields` | Schema + field & bulk formatting | `formatValue`, `formatValues`, `findField`, `isRequired` |
| `Issues` | Issue payload assembly | `buildPayload` |

## 🗂 Architecture Layers

```
Raw Input -> Fields (schema + formatting) -> Issues (payload assembly) -> IssuesApi -> JiraApiClient -> Jira REST API
```

### Deprecation / Removal Summary

| Item | Status | Replacement |
|------|--------|-------------|
| `FieldService`, `IssueService` | Removed in v3 | `Fields`, `Issues` |
| `formatIssueFields`, etc. | Removed | `Fields.formatValues` / `Issues.buildPayload` |
| Deep internal imports | Discouraged | Root exports |

## Creating Complete Jira Issues (Facade Approach)

```javascript
import { Fields, Issues } from 'jira-field-formatter';
const raw = { Summary: 'Fix login bug', Labels: 'urgent,bug,frontend', Priority: 'High' };
const formatted = await Fields.formatValues({ values: raw, projectKey: 'MY-PROJECT', issueType: 'Bug' });
const { payload } = await Issues.buildPayload({ projectKey: 'MY-PROJECT', issueType: 'Bug', values: raw });
// send payload via Issues.create(payload) or your own REST client
```

## Environment Setup

Create a `.env` file if using API-backed operations:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_API_VERSION=3
JIRA_TOKEN=your-personal-access-token
```

## Supported Field Types (Selected)

- String (`string`)
- Number (`number`)
- Date (`date`)
- DateTime (`datetime`)
- Issue Type (`issuetype`)
- Priority (`priority`)
- User / Assignee (`user`, `assignee`)
- Project (`project`)
- Component (`component`)
- Version (`version`)
- Option (`option`)
- Time Tracking (`timetracking`)
- Array (`array` + subtype)

## Error Handling

```javascript
const { unknown, suggestions } = await Fields.formatValues({ values: data, projectKey: 'PROJ', issueType: 'Bug', options: { suggestOnUnknown: true } });
console.log(unknown, suggestions);
```

## Contributing

Found a bug or want to add a field type? Open an issue or PR.

## License

MIT License

## Migration
Upgrading from a pre‑v3 release? See `MIGRATION.md` for mappings and rationale. Legacy service-based examples are in `examples/archive`.
