# Jira Field Formatter

Convert your data into the exact format Jira expects. Handles Excel dates, arrays, user fields, and all Jira field types automatically.

[![npm version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/FallingReign/jira-field-formatter)

## What do you need to do?

| **I want to...** | **Use this** | **Example** |
|------------------|--------------|-------------|
| Format a single field quickly | `formatFieldValue()` | `formatFieldValue('Bug', 'issuetype')` |
| Format multiple fields at once | `FieldService.formatInputPayload()` | Bulk convert spreadsheet data |
| Create a complete Jira issue | `IssueService` | Full workflow from data to issue |

## Quick Examples

```javascript
import { formatFieldValue, FieldService, IssueService } from 'jira-field-formatter';

// ✅ Format one field
const issueType = formatFieldValue('Bug', 'issuetype');
// Returns: { name: 'Bug' }

// ✅ Format Excel date
const dueDate = formatFieldValue(45290, 'date'); // Excel serial number
// Returns: '2023-12-25'

// ✅ Format array (comma-separated)
const labels = formatFieldValue('urgent,bug,frontend', 'array', 'string');
// Returns: ['urgent', 'bug', 'frontend']
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
import { formatFieldValue, FieldService, IssueService } from './lib/jira-field-formatter/index.js';
```

> **Requirements:** Node.js 14+ with ES modules support
import { formatValue } from './jira-field-formatter/index.js';

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
import { formatValue, FieldTypes } from 'jira-field-formatter';

// Format using constants (recommended for IDE support)
const issueType = formatFieldValue('Bug', FieldTypes.ISSUE_TYPE);
// Returns: { name: 'Bug' }

// Format using strings directly from Jira (convenient for dynamic usage)
const priority = formatFieldValue('High', 'priority');
// Returns: { name: 'High' }

const dateField = formatFieldValue('2023-12-25', 'date');
// Returns: '2023-12-25'

const arrayField = formatFieldValue('Option1,Option2,Option3', 'array', 'option');
// Returns: [{ name: 'Option1' }, { name: 'Option2' }, { name: 'Option3' }]
```

## 🏷️ Issue Type Resolution

No more dealing with cryptic issue type IDs! Use natural issue type names throughout the library:

```javascript
import { FieldsApi, resolveIssueTypeId } from 'jira-field-formatter';

const fieldsApi = new FieldsApi();

// ✅ NEW: Use issue type names directly
const taskFields = await fieldsApi.getAllFieldSchemas('PROJ', 'Task');
const bugSchema = await fieldsApi.getFieldSchema('Priority', 'PROJ', 'Bug');

// ✅ Still works: Use issue type IDs
const epicFields = await fieldsApi.getAllFieldSchemas('PROJ', '10000');

// ✅ Direct resolution
const taskId = await fieldsApi.resolveIssueTypeId('Task', 'PROJ');
// Returns: "10200"

// ✅ Standalone helper
const bugId = await resolveIssueTypeId('Bug', 'PROJ');
// Returns: "10203"
```

### Issue Type Resolution Features:

- **🎯 Natural Names**: Use `"Task"`, `"Bug"`, `"Epic"` instead of `"10200"`, `"10203"`, `"10000"`
- **🔄 Backward Compatible**: Existing code using IDs continues to work unchanged
- **⚡ Cached**: Issue type mappings cached for 5 minutes per project
- **🛡️ Error Handling**: Clear error messages list available issue types
- **🔍 Auto-Detection**: Numeric IDs passed through directly for performance

### Supported Methods:
All field-related methods now accept issue type names:

- `fieldsApi.getFieldSchema(fieldName, projectKey, issueType)`
- `fieldsApi.getAllFieldSchemas(projectKey, issueType)`
- `fieldsApi.isFieldPresent(fieldName, projectKey, issueType)`
- `fieldService.formatInputPayload(rawInput, projectKey, issueType)`
- `fieldService.validateInputPayload(rawInput, projectKey, issueType)`

## 🧠 Issue Orchestration (IssueService)

Phase 3d introduced an orchestration layer that keeps formatting, validation, preparation, and creation as single-purpose steps. This improves testability and lets you inspect or modify intermediate payloads before sending them to Jira.

```javascript
import { IssueService, FieldService } from 'jira-field-formatter';

// Instantiate (can inject logger / custom IssuesApi)
const issueService = new IssueService({ fieldService: new FieldService() });

// 1. Format raw user input using dynamic field schemas
const formatRes = await issueService.format({ Summary: ' Title ', Labels: 'one,two', Foo: 'x' }, 'PROJ', '10001');
console.log(formatRes.fields);  // { Summary: 'Title', Labels: ['one','two'] }
console.log(formatRes.errors);  // Unknown fields, etc.

// 2. Validate (optional) - ensures required fields present & values valid
const validation = await issueService.validate(formatRes.fields, 'PROJ', '10001');
if (!validation.valid) console.warn(validation.fieldErrors);

// 3. Prepare a full Jira issue payload (does NOT call Jira)
const { baseIssue } = await issueService.prepare({
  projectKey: 'PROJ',
  issueTypeId: '10001',
  summary: 'Title',
  description: 'Body',
  fields: { Summary: 'Title', Labels: 'one,two' }
});

// 4. Create (side effect) - expects already formatted structure from prepare()
const created = await issueService.create(baseIssue);
if (created.success) {
  console.log('Created issue:', created.key);
} else {
  console.error('Create failed:', created.errors);
}
```

Why no single `formatAndCreate`? Separation gives:
- Faster retries (skip re-formatting)
- Hook points for adding attachments / transitions between steps
- Deterministic unit tests per phase

See `examples/issue-service-usage.js` for a runnable mocked example (no real network calls – schemas & create are mocked).

---

## 🔀 Decision Matrix (Detailed)

| Scenario | Use This | Returns | Throw Behavior | Notes |
|----------|----------|---------|----------------|-------|
| Format one field quickly | `formatFieldValue()` | Formatted value or null | Throws on invalid type / array misuse | Fast, explicit |
| Bulk format raw fields | `FieldService.formatInputPayload()` | `{ fields, diagnostics }` | Never for unknown fields | Diagnostics include counts & unknown list |
| Bulk validate raw fields | `FieldService.validateInputPayload()` | `{ valid, fieldResults, errors }` | Never for unknown fields | Marks missing required fields |
| One-step (validate+format) | `FieldService.autoDetectAndFormat()` | `{ validation, fields }` | Same as above | Convenience combo |
| Workflow formatting | `IssueService.format()` | `FormatResult` | Non-throwing (collects errors) | Adds meta timing |
| Workflow validation | `IssueService.validate()` | `ValidationResult` | Non-throwing | Summaries for pass/fail |
| Prepare full payload | `IssueService.prepare()` | `{ baseIssue, format }` | Throws only if missing projectKey / issueTypeId | No network create |
| Create already prepared | `IssueService.create()` | `{ success, key?, errors? }` | Transport errors caught -> result | Idempotent if you reuse payload |
| Functional equivalents | Helpers (`formatIssueFields`, etc.) | Same as above | Same | Stateless wrappers |

---

## 🧩 Function Catalog

### Core Formatting
| Function | Purpose | Input | Output | Throws |
|----------|---------|-------|--------|-------|
| `formatFieldValue(value, fieldType, arrayType?)` | Format a single value | Primitive / string / number | Jira-compatible value (object, primitive or null) | Invalid field type, missing array subtype, bad JSON for checklist |
| `getFieldTypeDefinitions()` | Enumerate field type constants | – | Object map | – |
| `validateFieldType(type)` | Check if supported | String | Boolean | – |
| `getFieldTypeInfo(type)` | Metadata & formatting category | String | `{ fieldType, format, isArray, ... }` | Invalid type |

### Domain
| Symbol | Purpose | Key Methods |
|--------|---------|-------------|
| `Field` | Encapsulates schema mapping & per-field behavior | `format(value)`, `validate(value)`, `isEmpty(value)` |
| `mapSchemaToFieldType(schema)` | Convert Jira schema → internal field type | Returns internal type or throws (caught & downgraded to ANY) |

### Services
| Symbol | Purpose | Highlight Methods / Returns |
|--------|---------|-----------------------------|
| `FieldService` | Schema retrieval + caching + multi-field operations | `formatInputPayload()`, `validateInputPayload()`, `autoDetectAndFormat()` |
| `IssueService` | Workflow orchestration stages | `format()`, `validate()`, `prepare()`, `create()` |

### Helper Functions (Stateless Wrappers)
| Function | Wraps | Return |
|----------|-------|--------|
| `formatIssueFields(...)` | `IssueService.format` | FormatResult |
| `validateIssueFields(...)` | `IssueService.validate` | ValidationResult |
| `createIssue(...)` | `IssueService.create` | CreateResult |

### API Layer
| Class | Purpose | Core Methods |
|-------|---------|--------------|
| `JiraApiClient` | Low-level HTTP (auth, fetch) | `get()`, `post()`, `getEndpoint()`, `getBaseURL()` |
| `IssuesApi` | Issue REST endpoints | `createIssue()`, `getIssueTypeIdByName()` |
| `FieldsApi` | Field schema endpoints | `getAllFieldSchemas()`, `getFieldSchema()`, `isFieldPresent()`, `resolveIssueTypeId()` |
| `UsersApi` | User lookups | `findUser()` |

### Issue Type Resolution
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `resolveIssueTypeId(issueType, projectKey, logger?)` | Convert issue type name to ID | Name or ID + project | Issue type ID string |

### Utilities (Selected)
| Function | Purpose |
|----------|---------|
| `formatDateValue` / `formatDateTimeValue` | Normalize user / Excel date inputs |
| `parseTimeTracking` | Parse original estimate syntax | 
| `isValidTimeTrackingFormat` | Validate time pattern |
| `isEmpty`, `sanitizeString`, `parseNumber` | Normalization helpers |
| `isJiraKey` | Simple issue key pattern check |
| `validateFieldTypes` / `validateValueForFieldType` | Pre-flight validation |

> Full internals documented in code; catalog lists stable entry points.

---

## 🗂 Architecture Layers

```
Raw Input -> FieldService (schemas + Field objects) -> IssueService (workflow) -> IssuesApi -> JiraApiClient -> Jira REST API
                                 |             
                                 +-- Helpers (functional wrappers)
```

### Caching Strategy
| Aspect | Detail |
|--------|--------|
| Store | In-memory Map keyed `projectKey:issueTypeId` |
| TTL | Default 300s (override via `JIRA_SCHEMA_CACHE_TTL`) |
| Invalidation | `forceRefresh` option on `fetchSchemas` |
| Failure Behavior | Empty schema array; formatting logs unknown fields |

### Error Model
| Layer | Throws | Collects |
|-------|-------|----------|
| `formatValue` | Invalid config (field type) | – |
| `Field.format` | Propagates formatting errors (caught by service) | – |
| `FieldService.formatInputPayload` | Never (logs) | Unknown / empty / per-field failure reasons |
| `IssueService.format` | Never (except catastrophic) | Unknown fields as errors array, non-fatal warnings |
| `IssueService.create` | Converts API failures to `{ success:false, errors:[...] }` | – |

### Deprecation Path
| Item | Status | Guidance |
|------|--------|----------|
| `formatValue` (procedural) | Deprecated – emits `JIRA_FF_DEPRECATED` warning (removed/aliased in v3.0.0) | Migrate to Field / FieldService / IssueService |
| Deep imports `src/formatter.js`, `src/fieldTypes.js` | Discouraged (may break in v3.0.0) | Use root exports (`import { formatValue } from 'jira-field-formatter'`) |
| `JiraApi` / `JiraHttpClient` | Removed in v2.0.0 | Use `JiraApiClient` + domain APIs |

Migration Tip: Start by replacing procedural multi-field loops with `FieldService.formatInputPayload`, then introduce `IssueService.prepare` before final create step.

---


## Supported Field Types

### Basic Types
- **String** (`string`) - Plain text values
- **Number** (`number`) - Numeric values
- **Date** (`date`) - Date values in YYYY-MM-DD format
- **DateTime** (`datetime`) - ISO datetime format

### Object Types (Name Format)
- **Issue Type** (`issuetype`) - `{ name: "Bug" }`
- **Assignee** (`assignee`) - `{ name: "john.doe" }`
- **Reporter** (`reporter`) - `{ name: "jane.smith" }`
- **Priority** (`priority`) - `{ name: "High" }`
- **User** (`user`) - `{ name: "username" }`
- **Option** (`option`) - `{ name: "Option Value" }`
- **Version** (`version`) - `{ name: "1.0.0" }`
- **Component** (`component`) - `{ name: "Component Name" }`
- **Attachment** (`attachment`) - `{ name: "filename.pdf" }`

### Object Types (Key Format)
- **Project** (`project`) - `{ key: "PROJ" }`
- **Issue Link** (`issuelink`) - `{ key: "PROJ-123" }`
- **Issue Links** (`issuelinks`) - `{ key: "PROJ-123" }`

### Special Types
- **Option with Child** (`option-with-child`) - Cascading selects: `"Parent -> Child"`
- **Time Tracking** (`timetracking`) - Time estimates: `"2w 3d 4h 30m"`
- **Array** (`array`) - Arrays of any supported type

## Creating Complete Jira Issues

For full issue creation workflow:

```javascript
import { IssueService, FieldService } from 'jira-field-formatter';

// Set up environment variables first:
// JIRA_BASE_URL=https://your-domain.atlassian.net
// JIRA_API_VERSION=3
// JIRA_TOKEN=your-token

const fieldService = new FieldService();
const issueService = new IssueService({ fieldService });

// Your data from any source
const issueData = {
  summary: 'Fix login bug',
  'Issue Type': 'Bug',
  'Priority': 'High',
  'Assignee': 'john.doe',
  'Labels': 'urgent,bug,frontend',
  'Due Date': 45290  // Excel date
};

// 1. Format the data
const formatted = await issueService.format(issueData, 'MY-PROJECT', 'Bug');

// 2. Create the issue
const result = await issueService.create(formatted.fields);
if (result.success) {
  console.log(`Created issue: ${result.key}`);
}
```

## Environment Setup

For API operations (FieldService, IssueService), create a `.env` file:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_API_VERSION=3
JIRA_TOKEN=your-personal-access-token
```

## All Supported Field Types

| **Field Type** | **Example Input** | **Jira Output** |
|----------------|------------------|-----------------|
| `string` | `"Hello World"` | `"Hello World"` |
| `number` | `"42"` | `42` |
| `date` | `45290` (Excel) or `"2023-12-25"` | `"2023-12-25"` |
| `datetime` | `"2023-12-25T10:30:00Z"` | `"2023-12-25T10:30:00.000Z"` |
| `issuetype` | `"Bug"` | `{ name: "Bug" }` |
| `priority` | `"High"` | `{ name: "High" }` |
| `assignee` | `"john.doe"` | `{ name: "john.doe" }` |
| `user` | `"jane.smith"` | `{ name: "jane.smith" }` |
| `project` | `"PROJ"` | `{ key: "PROJ" }` |
| `component` | `"Frontend"` | `{ name: "Frontend" }` |
| `version` | `"1.0.0"` | `{ name: "1.0.0" }` |
| `option` | `"Option A"` | `{ name: "Option A" }` |
| `timetracking` | `"2w 3d 4h 30m"` | `{ originalEstimate: "2w 3d 4h 30m" }` |
| `array` + subtype | `"Red,Green,Blue"` | Array of formatted values |

### Array Examples
```javascript
// Array of strings
formatFieldValue('tag1,tag2,tag3', 'array', 'string')
// Returns: ['tag1', 'tag2', 'tag3']

// Array of components  
formatFieldValue('Frontend,Backend', 'array', 'component')
// Returns: [{ name: 'Frontend' }, { name: 'Backend' }]

// Array of users
formatFieldValue('john,jane,bob', 'array', 'user')  
// Returns: [{ name: 'john' }, { name: 'jane' }, { name: 'bob' }]
```

## Error Handling

```javascript
try {
  const result = formatFieldValue('test', 'invalid-type');
} catch (error) {
  console.log('Invalid field type:', error.message);
}

// For bulk operations, errors are collected, not thrown
const result = await fieldService.formatInputPayload(data, 'PROJ', 'Bug');
console.log(result.diagnostics.unknownFields); // Shows unrecognized fields
```

## Contributing

Found a bug or want to add a field type? [Open an issue](https://github.com/FallingReign/jira-field-formatter/issues) or submit a pull request.

## License

MIT License
