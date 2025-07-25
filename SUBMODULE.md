# Using Jira Field Formatter as a Git Submodule

This guide explains how to integrate this library into your project using git submodules.

## Adding the Submodule

```bash
# Navigate to your project root
cd your-project

# Add this library as a submodule
git submodule add https://github.com/FallingReign/jira-field-formatter.git lib/jira-field-formatter

# Commit the submodule addition
git add .gitmodules lib/jira-field-formatter
git commit -m "Add jira-field-formatter submodule"
```

## Using in Your Project

### ES Modules (Required)

> **Note:** This library is ESM-only and requires Node.js 14+ with ES modules support.

```javascript
// Import main functions
import { formatValue, FieldTypes } from './lib/jira-field-formatter/index.js';

// Import specific utilities
import { formatDateValue } from './lib/jira-field-formatter/src/utils/dateUtils.js';
import { parseTimeTracking } from './lib/jira-field-formatter/src/utils/timeUtils.js';

// Example usage
const formattedValue = formatValue('Bug', FieldTypes.ISSUE_TYPE);
const formattedDate = formatDateValue('2023-12-30');
```

### Using with CommonJS Projects

If your project still uses CommonJS, you can use dynamic imports:

```javascript
// In an async function
async function setupJiraFormatter() {
  const { formatValue, FieldTypes } = await import('./lib/jira-field-formatter/index.js');
  
  const issueType = formatValue('Bug', FieldTypes.ISSUE_TYPE);
  console.log(issueType); // { name: 'Bug' }
}

// Or at the top level in Node.js (if supported)
const { formatValue, FieldTypes } = await import('./lib/jira-field-formatter/index.js');
```

## Updating the Submodule

```bash
# Update to latest version
cd lib/jira-field-formatter
git pull origin master
cd ../..
git add lib/jira-field-formatter
git commit -m "Update jira-field-formatter submodule"
```

## Cloning Projects with Submodules

When someone clones your project, they need to initialize submodules:

```bash
# Clone with submodules
git clone --recursive https://github.com/your-username/your-project.git

# Or clone first, then initialize submodules
git clone https://github.com/your-username/your-project.git
cd your-project
git submodule update --init --recursive
```

## Development Setup

If you want to contribute to the submodule:

```bash
# Navigate to submodule
cd lib/jira-field-formatter

# Install development dependencies
npm install

# Run tests
npm test

# Make changes and test
npm run example
```

## File Structure in Your Project

```
your-project/
├── lib/
│   └── jira-field-formatter/          # Submodule
│       ├── src/
│       ├── index.js
│       ├── README.md
│       └── ...
├── src/
│   └── your-code.js                   # Your project files
├── .gitmodules                        # Git submodule config
└── package.json
```

## Benefits of Using as Submodule

1. **No npm dependency** - Direct source code integration
2. **Version control** - Pin to specific commits/tags
3. **Easy updates** - Pull latest changes when needed
4. **Offline development** - No registry dependencies
5. **Custom modifications** - Can fork and modify if needed
6. **Zero installation overhead** - Just git operations
