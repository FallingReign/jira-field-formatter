# Jira Field Formatter

A focused Jira integration utility that converts raw input (including Excel serials) into Jira REST API–compatible payloads and now (Phase 3 architecture) offers domain + service + orchestration layers for full issue creation workflows.

**🔧 Designed for Git Submodules** – Drop into any project without publishing to npm.

## At a Glance

| Need | Start Here | Key Methods | Side Effects | When to Choose |
|------|------------|-------------|--------------|----------------|
| Format a single known field | `formatValue` | `formatValue()` | None | Quick, explicit field type known |
| Bulk format & validate against Jira schemas | `FieldService` | `formatInputPayload()`, `validateInputPayload()` | Fetch createmeta | Dynamic field sets, schema-driven |
| Full issue lifecycle (format → prepare → create) | `IssueService` | `format()`, `validate()`, `prepare()`, `create()` | Fetch + (optional) create | Clear stage boundaries |
| Functional wrappers for orchestration | Helpers | `formatIssueFields()`, `validateIssueFields()`, `createIssue()` | Same as above | Prefer functions over classes |
| Raw HTTP operations | `JiraApiClient` + *Apis | `get()`, `post()` | Network | Custom / advanced workflows |

> Deprecation: Procedural `formatValue` now emits a Node warning (`code: JIRA_FF_DEPRECATED`) on first use. It will be removed or become an opt-in alias in v3.0.0. Prefer `Field`, `FieldService`, or `IssueService`. Silence with `JIRA_FF_SUPPRESS_DEPRECATION=1`.

## Features

- ✅ **Full Field Type Coverage** – Jira system + array, cascading select, timetracking, watches, Service Desk fields
- ✅ **Excel Aware** – Date & datetime serial number parsing
- ✅ **Domain Layer** – `Field` encapsulates schema mapping & per-field behavior
- ✅ **Service Layer** – `FieldService` caches schemas & performs bulk formatting / validation
- ✅ **Orchestration Layer** – `IssueService` provides single-purpose workflow steps
- ✅ **Schema Caching** – In-memory TTL (default 300s) reduces createmeta calls
- ✅ **Functional Helpers** – Pure functions wrapping orchestration for functional style
- ✅ **ESM Only** – Modern module system
- ✅ **Minimal Runtime Dependency** – Only `dotenv` for self-contained env loading
## Requirements

- **Node.js 18+** – Required (uses native `fetch`). If using earlier Node versions you must polyfill; official support targets 18+.
- **Jira Cloud / Data Center REST API** – Supply credentials via environment variables.

### Environment Variables (Required for API usage)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JIRA_BASE_URL` | Yes | — | Base Jira URL (e.g. `https://your-domain.atlassian.net`) |
| `JIRA_API_VERSION` | Yes | — | REST API version segment (e.g. `3`) |
| `JIRA_TOKEN` | Yes | — | Jira personal access (Bearer) token |
| `JIRA_SCHEMA_CACHE_TTL` | No | `300` | Seconds to cache field schemas (createmeta) |

`.env.example` illustrates expected keys. Never commit your real `.env`.

> **Note:** This library is ESM-only and does not support CommonJS. If you need CommonJS support, consider upgrading your project to ES modules or using dynamic imports: `const { formatValue } = await import('./path/to/jira-field-formatter/index.js')`

## Installation

### Git Submodule (Recommended)

Add this library as a git submodule to your project:

```bash
# Add the submodule (gets latest development version)
git submodule add https://github.com/FallingReign/jira-field-formatter.git lib/jira-field-formatter

# For production: pin to a specific stable version
cd lib/jira-field-formatter
git checkout v1.2.0  # Replace with desired version
cd ../..

# Commit the submodule
git add .gitmodules lib/jira-field-formatter
git commit -m "Add jira-field-formatter submodule (v1.2.0)"

# Initialize for team members
git submodule update --init --recursive
```

### Available Versions
| Tag | Status | Notes |
|-----|--------|-------|
| `v2.2.1` | Current | Deprecation hardened warning for procedural formatValue |
| `v2.2.0` | Stable | Domain unified exports, stronger deprecation path |
| `v2.1.0` | Stable | Domain consolidation, shims introduced |
| `v2.0.0` | Breaking | Removed deprecated JiraApi/JiraHttpClient |
| `v1.2.0` | Legacy | Pre-domain/service orchestration baseline |
| `master` | Active Dev | Latest (potentially unstable) features – do not pin for prod |

> Until the next tag (e.g. `v1.3.0`) is cut, new orchestration features live on `master`.

Then import it in your project:

```javascript
// ES Modules (Required - Node.js 14+)
import { formatValue, FieldTypes } from './lib/jira-field-formatter/index.js';

// Or for specific utilities
import { formatDateValue } from './lib/jira-field-formatter/src/utils/dateUtils.js';
```

### Alternative: Direct Clone

```bash
# Clone the repository
git clone https://github.com/FallingReign/jira-field-formatter.git

# Include in your project
import { formatValue } from './jira-field-formatter/index.js';
```

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
const issueType = formatValue('Bug', FieldTypes.ISSUE_TYPE);
// Returns: { name: 'Bug' }

// Format using strings directly from Jira (convenient for dynamic usage)
const priority = formatValue('High', 'priority');
// Returns: { name: 'High' }

const dateField = formatValue('2023-12-25', 'date');
// Returns: '2023-12-25'

const arrayField = formatValue('Option1,Option2,Option3', 'array', 'option');
// Returns: [{ name: 'Option1' }, { name: 'Option2' }, { name: 'Option3' }]
```

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
| Format one field quickly | `formatValue()` | Formatted value or null | Throws on invalid type / array misuse | Fast, explicit |
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
| `formatValue(value, fieldType, arrayType?)` | Format a single value | Primitive / string / number | Jira-compatible value (object, primitive or null) | Invalid field type, missing array subtype, bad JSON for checklist |
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
| `FieldsApi` | Field schema endpoints | `getAllFieldSchemas()`, `getFieldSchema()`, `isFieldPresent()` |
| `UsersApi` | User lookups | `findUser()` |

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

## Using Field Type Strings

You can use field type strings directly as they appear in Jira, making integration easier:

```javascript
import { formatValue } from 'jira-field-formatter';

// Use string field types directly from Jira configuration
const result1 = formatValue('Bug', 'issuetype');          // { name: 'Bug' }
const result2 = formatValue('High', 'priority');          // { name: 'High' }
const result3 = formatValue('Done', 'resolution');        // { name: 'Done' }
const result4 = formatValue('In Progress', 'status');     // { name: 'In Progress' }
const result5 = formatValue('PROJ-123', 'issuelink');     // { key: 'PROJ-123' }
const result6 = formatValue('2023-12-25', 'date');        // '2023-12-25'
const result7 = formatValue('user1,user2', 'watches');    // { watchers: [{ name: 'user1' }, { name: 'user2' }] }
const result8 = formatValue('42', 'number');              // 42

// Arrays with string field types
const arrayResult = formatValue('Red,Green,Blue', 'array', 'option');
// [{ name: 'Red' }, { name: 'Green' }, { name: 'Blue' }]
```

**Supported field type strings:**
`timetracking`, `issuetype`, `string`, `priority`, `resolution`, `status`, `securitylevel`, `watches`, `any`, `array`, `option-with-child`, `user`, `option`, `date`, `project`, `number`, `datetime`, `issuelink`, `version`, `attachment`, `issuelinks`, `component`, `sd-servicelevelagreement`, `sd-approvals`, `sd-customerrequesttype`, `checklist-item`

## API Reference (Selected – see Function Catalog for more)

### formatValue(value, fieldType, arrayFieldType?)

Main formatting function that converts a value to Jira API format.

**Parameters:**
- `value` (any) - The value to format
- `fieldType` (string) - The Jira field type
- `arrayFieldType` (string, optional) - Required when fieldType is 'array'

**Returns:** Formatted value ready for Jira API

**Example:**
```javascript
import { formatValue, FieldTypes } from 'jira-field-formatter';

// Simple field
const result = formatValue('Bug', FieldTypes.ISSUE_TYPE);
// { name: 'Bug' }

// Array field - use any primary field type as the array item type
const arrayResult = formatValue('Red,Green,Blue', FieldTypes.ARRAY, FieldTypes.OPTION);
// [{ name: 'Red' }, { name: 'Green' }, { name: 'Blue' }]
```

### getFieldTypeDefinitions()

Returns all available field type constants.

```javascript
import { getFieldTypeDefinitions } from 'jira-field-formatter';

const fieldTypes = getFieldTypeDefinitions();
console.log(fieldTypes.STRING); // 'string'
console.log(fieldTypes.ARRAY); // 'array'
```

### validateFieldType(fieldType)

Validates if a field type is supported.

```javascript
import { validateFieldType } from 'jira-field-formatter';

console.log(validateFieldType('string')); // true
console.log(validateFieldType('invalid')); // false
```

## Excel Integration

The library automatically handles Excel-specific data formats:

### Excel Date Serial Numbers
```javascript
// Excel stores dates as serial numbers
const excelDate = 45290; // Represents 2023-12-25
const result = formatValue(excelDate, FieldTypes.DATE);
// Returns: '2023-12-25'
```

### Excel DateTime with Decimal
```javascript
// Excel datetime with time portion
const excelDateTime = 45290.5; // Date + 12:00:00
const result = formatValue(excelDateTime, FieldTypes.DATETIME);
// Returns: '2023-12-25T12:00:00.000Z'
```

## Array Field Types

When using `FieldTypes.ARRAY`, specify the type of items in the array using any of the primary field types:

```javascript
import { formatValue, FieldTypes } from 'jira-field-formatter';

// Array of options
formatValue('Red,Green,Blue', FieldTypes.ARRAY, FieldTypes.OPTION);
// [{ name: 'Red' }, { name: 'Green' }, { name: 'Blue' }]

// Array of strings
formatValue('Item1,Item2,Item3', FieldTypes.ARRAY, FieldTypes.STRING);
// ['Item1', 'Item2', 'Item3']

// Array of versions
formatValue('1.0,2.0,3.0', FieldTypes.ARRAY, FieldTypes.VERSION);
// [{ name: '1.0' }, { name: '2.0' }, { name: '3.0' }]

// Array of users
formatValue('john.doe,jane.smith', FieldTypes.ARRAY, FieldTypes.USER);
// [{ name: 'john.doe' }, { name: 'jane.smith' }]
```

## Special Field Formats

### Cascading Select (Option with Child)
```javascript
// Parent and child option
formatValue('Hardware -> Laptop', FieldTypes.OPTION_WITH_CHILD);
// { value: 'Hardware', child: { value: 'Laptop' } }

// Parent only
formatValue('Software', FieldTypes.OPTION_WITH_CHILD);
// { value: 'Software' }
```

### Time Tracking
```javascript
formatValue('2w 3d 4h 30m', FieldTypes.TIME_TRACKING);
// { originalEstimate: '2w 3d 4h 30m' }
```

## Error Handling (Procedural)

The library provides comprehensive error handling:

```javascript
try {
  const result = formatValue('test', 'invalid-field-type');
} catch (error) {
  console.error(error.message); // 'Invalid field type: invalid-field-type'
}

try {
  const result = formatValue('test', FieldTypes.ARRAY); // Missing arrayFieldType
} catch (error) {
  console.error(error.message); // 'Array field type is required when fieldType is "array"'
}
```

## Utility Functions

### Date Utilities
```javascript
import { formatDateValue, formatDateTimeValue } from 'jira-field-formatter';

const date = formatDateValue('12/25/2023');
const datetime = formatDateTimeValue('2023-12-25T10:30:00');
```

### Time Utilities
```javascript
import { parseTimeTracking, isValidTimeTrackingFormat } from 'jira-field-formatter';

const timeTracking = parseTimeTracking('2w 3d 4h 30m');
const isValid = isValidTimeTrackingFormat('1h 30m');
```

### Validation Utilities
```javascript
import { isEmpty, isJiraKey, validateFieldTypes } from 'jira-field-formatter';

const empty = isEmpty('   '); // true
const jiraKey = isJiraKey('PROJ-123'); // true
const validation = validateFieldTypes('array', 'option'); // { isValid: true }
```

## TypeScript Support / Roadmap

Currently untyped JavaScript. Planned minimal `.d.ts` surfaces (ETA Phase 3e or later):
1. Core formatting (`formatValue`, field type enums)
2. Domain & Services interfaces (Field, FieldService, IssueService result shapes)
3. Helper function result types

Interim: You can author local ambient declarations to wrap Create / Format / Validation result shapes.

The library includes TypeScript definitions (coming soon):

```typescript
import { formatValue, FieldTypes } from 'jira-field-formatter';

const result: any = formatValue('Bug', FieldTypes.ISSUE_TYPE);
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## License

MIT License - see LICENSE file for details.

## Changelog

### v2.2.0
- Deprecation hardening: root exports unified under domain; structured warning for `formatValue`; added suppression flag docs.

### v2.1.0
- Internal consolidation: single source of truth for field types & formatter in domain layer; shims introduced.

### v2.0.0
- BREAKING: Removed deprecated wrappers `JiraApi` and `JiraHttpClient` (use `JiraApiClient`, `UsersApi`, `IssuesApi`, `FieldsApi`).
- Added Domain + Service + Orchestration layers: `Field`, `FieldService`, `IssueService`.
- Added helper functions: `formatIssueFields`, `validateIssueFields`, `createIssue`.
- Introduced schema caching (TTL via `JIRA_SCHEMA_CACHE_TTL`).
- Added soft deprecation warning for procedural `formatValue` on first invocation.
- Added examples: `issue-service-usage.js`.
- Raised documented Node requirement to 18+ (native fetch).

### v1.2.0
- ✨ **New Field Types**: Added commonly requested field types:
  - `resolution` - Issue resolution values
  - `status` - Issue status values  
  - `securitylevel` - Security level restrictions
  - `watches` - Watchers (supports comma-separated user lists)
  - `sd-servicelevelagreement` - Service Desk SLA agreements
  - `sd-approvals` - Service Desk approval workflows
  - `sd-customerrequesttype` - Service Desk request types
- 🔧 **Special Handling**: Watches field returns `{watchers: []}` for empty values instead of `null`
- 📝 **Documentation**: Updated examples to showcase all new field types
- ✅ **Tests**: Added comprehensive test coverage for all new field types (64 total tests)

### v1.1.0
- ✨ **New Feature**: Support for direct string field types (e.g., `'issuetype'`, `'priority'`)
- ✨ **New Field Types**: Added `attachment` and `issuelinks` field types
- 🐛 **Fix**: Improved time tracking parsing to handle any string value
- 📝 **Documentation**: Updated examples and API documentation
- ✅ **Tests**: Enhanced test coverage for string field types

### v1.0.0
- Initial release
- Support for all Jira field types
- Excel integration
- Comprehensive test coverage
- Zero dependencies
