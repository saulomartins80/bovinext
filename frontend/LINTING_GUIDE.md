# Linting Workflow Guide

This guide provides comprehensive instructions for running consistent linting across the project, both per-file and project-wide, along with IDE/editor integration for real-time error visibility.

## Overview

Our project uses multiple linting tools to ensure code quality and consistency:

- **ESLint**: JavaScript/TypeScript code linting with strict TypeScript rules
- **Prettier**: Code formatting for consistent style
- **Stylelint**: CSS/SCSS linting with Tailwind CSS support

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Per-File Linting](#per-file-linting)
3. [Project-Wide Linting](#project-wide-linting)
4. [IDE/Editor Integration](#ideeditor-integration)
5. [Pre-commit Setup](#pre-commit-setup)
6. [Configuration Files](#configuration-files)
7. [Troubleshooting](#troubleshooting)

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on entire project |
| `npm run lint:fix` | Run ESLint with automatic fixes |
| `npx eslint <file>` | Lint specific file |
| `npx prettier --check <file>` | Check file formatting |
| `npx prettier --write <file>` | Format specific file |
| `npx stylelint "**/*.css"` | Lint all CSS files |

## Per-File Linting

### ESLint (JavaScript/TypeScript)

#### Check a specific file:
```bash
npx eslint src/components/Button.tsx
```

#### Fix a specific file:
```bash
npx eslint src/components/Button.tsx --fix
```

#### Check with specific configuration:
```bash
npx eslint src/components/Button.tsx --config .eslintrc.json
```

### Prettier (Code Formatting)

#### Check if a file is formatted:
```bash
npx prettier --check src/components/Button.tsx
```

#### Format a specific file:
```bash
npx prettier --write src/components/Button.tsx
```

#### Check multiple files with pattern:
```bash
npx prettier --check "src/**/*.{ts,tsx,js,jsx}"
```

### Stylelint (CSS/SCSS)

#### Lint a specific CSS file:
```bash
npx stylelint src/styles/globals.css
```

#### Fix CSS issues:
```bash
npx stylelint src/styles/globals.css --fix
```

#### Check Tailwind CSS classes:
```bash
npx stylelint "**/*.css" --config .stylelintrc.json
```

## Project-Wide Linting

### Full Project Lint Check

#### Run all linting tools in sequence:
```bash
# ESLint check
npm run lint

# Prettier check
npx prettier --check .

# Stylelint check
npx stylelint "**/*.css"
```

#### Comprehensive lint script (create this in package.json):
```json
{
  "scripts": {
    "lint:all": "npm run lint && npx prettier --check . && npx stylelint \"**/*.css\"",
    "lint:fix:all": "npm run lint:fix && npx prettier --write . && npx stylelint \"**/*.css\" --fix"
  }
}
```

### Build-Time Linting

The project includes build-time linting that will fail the build if linting errors are found:

```bash
# Build with linting (default)
npm run build

# Build without linting (emergency use only)
npm run build:no-lint
```

### Continuous Integration Setup

For CI/CD pipelines, use this comprehensive check:

```bash
#!/bin/bash
set -e

echo "Running ESLint..."
npm run lint

echo "Checking Prettier formatting..."
npx prettier --check .

echo "Running Stylelint..."
npx stylelint "**/*.css"

echo "✅ All linting checks passed!"
```

## IDE/Editor Integration

### Visual Studio Code

#### Required Extensions:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### VS Code Settings (.vscode/settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": ["css", "scss", "postcss"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Workspace Configuration (.vscode/extensions.json):
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### JetBrains IDEs (WebStorm, IntelliJ)

1. **Enable ESLint:**
   - Go to `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
   - Check "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

2. **Configure Prettier:**
   - Go to `Settings > Languages & Frameworks > JavaScript > Prettier`
   - Set Prettier package path to `node_modules/prettier`
   - Check "On 'Reformat Code' action" and "On save"

3. **Setup Stylelint:**
   - Go to `Settings > Languages & Frameworks > Style Sheets > Stylelint`
   - Enable Stylelint and set package path
   - Check "Run stylelint --fix on save"

### Vim/Neovim

#### With CoC (Conquer of Completion):
```json
{
  "eslint.autoFixOnSave": true,
  "prettier.onlyUseLocalVersion": true,
  "coc.preferences.formatOnSaveFiletypes": [
    "javascript",
    "typescript",
    "typescriptreact",
    "json",
    "css"
  ]
}
```

#### With ALE (Asynchronous Lint Engine):
```vim
let g:ale_fixers = {
\   'javascript': ['eslint', 'prettier'],
\   'typescript': ['eslint', 'prettier'],
\   'css': ['stylelint', 'prettier']
\}
let g:ale_fix_on_save = 1
let g:ale_linters_explicit = 1
```

### Sublime Text

Install packages via Package Control:
- ESLint
- Prettier
- SublimeLinter-stylelint

Configuration in `Preferences > Settings`:
```json
{
  "rulers": [100],
  "prettier": {
    "auto_format_on_save": true,
    "allow_inline_formatting": false
  }
}
```

## Pre-commit Setup

### Using Husky + lint-staged

#### Install dependencies:
```bash
npm install --save-dev husky lint-staged
```

#### Add to package.json:
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

#### Setup pre-commit hook:
```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Manual Pre-commit Script

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
set -e

echo "Running pre-commit linting..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Filter for relevant file types
TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)
CSS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(css|scss)$' || true)

# Run ESLint on staged TypeScript/JavaScript files
if [ -n "$TS_FILES" ]; then
  echo "Linting TypeScript/JavaScript files..."
  npx eslint $TS_FILES
fi

# Run Stylelint on staged CSS files  
if [ -n "$CSS_FILES" ]; then
  echo "Linting CSS files..."
  npx stylelint $CSS_FILES
fi

# Run Prettier check on all staged files
if [ -n "$STAGED_FILES" ]; then
  echo "Checking Prettier formatting..."
  npx prettier --check $STAGED_FILES
fi

echo "✅ Pre-commit checks passed!"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Configuration Files

### Current ESLint Configuration (.eslintrc.json)

Our ESLint configuration includes:

- **Strict TypeScript rules**: No explicit `any`, unsafe operations warnings
- **Type safety**: Strict boolean expressions, nullish coalescing preferences
- **Function requirements**: Explicit return types and module boundary types
- **Error prevention**: No floating promises, proper async/await usage
- **React-specific rules**: Hook dependency checking
- **File-specific overrides**: Relaxed rules for config files, API routes, and type declarations

### Current Prettier Configuration (.prettierrc)

- Semi-colons enabled
- Single quotes preferred
- 2-space tab width
- Trailing commas (ES5 compatible)
- 100 character print width

### Current Stylelint Configuration (.stylelintrc.json)

- Standard CSS rules
- Tailwind CSS compatibility
- Custom at-rule support for Tailwind directives

## Troubleshooting

### Common Issues and Solutions

#### ESLint Issues

**Problem**: `Parsing error: Cannot read file 'tsconfig.json'`
```bash
# Solution: Ensure tsconfig.json exists and is valid
npx tsc --noEmit --project tsconfig.json
```

**Problem**: `Plugin '@typescript-eslint/recommended' not found`
```bash
# Solution: Reinstall ESLint dependencies
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

#### Prettier Issues

**Problem**: Prettier and ESLint conflicts
```bash
# Solution: Install eslint-config-prettier (already included)
npm install --save-dev eslint-config-prettier
```

**Problem**: Files not formatting on save
- Check IDE/editor Prettier extension is installed and enabled
- Verify `.prettierrc` file is in project root
- Check editor settings for "format on save"

#### Stylelint Issues

**Problem**: `Unknown at-rule "@tailwind"`
```bash
# Solution: Install Tailwind CSS Stylelint config (already included)
npm install --save-dev stylelint-config-tailwindcss
```

**Problem**: Stylelint not finding CSS files
```bash
# Solution: Use explicit glob patterns
npx stylelint "**/*.css" "**/*.scss"
```

### Performance Optimization

#### For Large Projects

1. **Use ESLint cache:**
```bash
npx eslint . --cache
```

2. **Limit file scope:**
```bash
npx eslint src/ --ext .ts,.tsx
```

3. **Parallel processing:**
```bash
# Install npm-run-all for parallel execution
npm install --save-dev npm-run-all

# Add to package.json
"lint:parallel": "npm-run-all --parallel lint:eslint lint:prettier lint:stylelint"
```

### Integration with Build Tools

#### Next.js Integration (Current Setup)

ESLint is integrated into the Next.js build process:

```javascript
// next.config.js
module.exports = {
  eslint: {
    // Run ESLint during build
    ignoreDuringBuilds: false,
  },
}
```

#### Webpack Integration

For custom webpack setups:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
}
```

## Best Practices

### Development Workflow

1. **Enable real-time linting** in your editor for immediate feedback
2. **Run lint checks** before committing code
3. **Use automatic fixes** when possible, but review changes
4. **Address linting errors** before code reviews
5. **Keep configurations up to date** with project requirements

### Team Collaboration

1. **Ensure all team members** use the same IDE extensions
2. **Document any custom rules** and their rationale
3. **Use shared editor configurations** (.vscode/settings.json)
4. **Regular reviews** of linting rules and their effectiveness
5. **Update linting rules** gradually to avoid overwhelming developers

### Configuration Management

1. **Version control all configuration files**
2. **Test configuration changes** thoroughly before deployment
3. **Document rule exceptions** and their business justification
4. **Regularly update dependencies** for security and feature improvements
5. **Maintain consistency** across different environments (dev, staging, production)

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the official documentation:
   - [ESLint Docs](https://eslint.org/docs/)
   - [Prettier Docs](https://prettier.io/docs/)
   - [Stylelint Docs](https://stylelint.io/)

2. Review project-specific configurations in:
   - `.eslintrc.json`
   - `.prettierrc`
   - `.stylelintrc.json`

3. Test your setup with the commands in the [Quick Reference](#quick-reference) section

This guide ensures consistent code quality across the entire development team and provides multiple pathways for maintaining clean, readable, and error-free code.
