# Jira Field Formatter

A standalone Node.js library for formatting field values to be compatible with the Jira REST API. This library handles the conversion of various input types (strings, numbers, Excel data) into properly formatted JSON objects that Jira's API expects.

**🔧 Designed for Git Submodules** - No npm installation required, just clone and import!

## Features

- ✅ **Complete Field Type Support** - Handles all Jira field types including arrays, dates, users, options, etc.
- ✅ **Excel Integration** - Automatically converts Excel date serial numbers and other Excel-specific formats
- ✅ **Type Safety** - Comprehensive validation and error handling
- ✅ **Modular Design** - Use individual functions or the main formatValue function
- ✅ **Zero Dependencies** - Pure JavaScript with no external dependencies
- ✅ **ES Modules Only** - Modern JavaScript module support (Node.js 14+)
- ✅ **Submodule Ready** - Perfect for git submodule integration

## Requirements

- **Node.js 14+** - Required for ES modules support
- **Modern JavaScript environment** - This library uses ES modules exclusively

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
- `v1.2.0` - Current stable release ⭐
- `master` - Latest development version (default)

> **🔖 Version Strategy:** We use semantic versioning with git tags. Pin to specific versions (like `v1.2.0`) for production stability, or use `master` for latest features.

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

Users can easily check their version and get updates using the included version check script:

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

## API Reference

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

## Error Handling

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

## TypeScript Support

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
