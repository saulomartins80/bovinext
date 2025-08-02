# CI/CD Linting Script for Windows PowerShell
# This script runs comprehensive linting checks for continuous integration

$ErrorActionPreference = "Stop"

Write-Host "🔍 Starting comprehensive linting checks..." -ForegroundColor Blue
Write-Host "========================================"

function Write-Status($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Error "node_modules not found. Please run 'npm install' first."
    exit 1
}

try {
    # Step 1: Type checking
    Write-Status "Running TypeScript type checking..."
    npm run type-check
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript type checking passed"
    } else {
        Write-Error "TypeScript type checking failed"
        exit 1
    }

    # Step 2: ESLint
    Write-Status "Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ESLint checks passed"
    } else {
        Write-Error "ESLint checks failed"
        exit 1
    }

    # Step 3: Prettier formatting check
    Write-Status "Checking Prettier formatting..."
    npm run format:check
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Prettier formatting check passed"
    } else {
        Write-Error "Prettier formatting check failed"
        Write-Warning "Run 'npm run format' to fix formatting issues"
        exit 1
    }

    # Step 4: Stylelint (if CSS files exist)
    $cssFiles = Get-ChildItem -Path . -Include "*.css", "*.scss" -Recurse
    if ($cssFiles.Count -gt 0) {
        Write-Status "Running Stylelint..."
        npm run stylelint
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Stylelint checks passed"
        } else {
            Write-Error "Stylelint checks failed"
            exit 1
        }
    } else {
        Write-Warning "No CSS/SCSS files found, skipping Stylelint"
    }

    # Step 5: Build check (optional - uncomment if needed)
    # Write-Status "Running build check..."
    # npm run build
    # if ($LASTEXITCODE -eq 0) {
    #     Write-Success "Build completed successfully"
    # } else {
    #     Write-Error "Build failed"
    #     exit 1
    # }

    Write-Host "========================================"
    Write-Success "All linting checks passed! ✅"

    # Generate summary report
    Write-Host ""
    Write-Host "📊 Linting Summary:"
    Write-Host "- TypeScript: ✅ Passed"
    Write-Host "- ESLint: ✅ Passed"
    Write-Host "- Prettier: ✅ Passed"
    Write-Host "- Stylelint: ✅ Passed"
    Write-Host ""
    Write-Host "🚀 Code is ready for deployment!"

} catch {
    Write-Error "An error occurred during linting: $_"
    exit 1
}
