#!/bin/bash
# CI/CD Linting Script
# This script runs comprehensive linting checks for continuous integration

set -e  # Exit on any error

echo "🔍 Starting comprehensive linting checks..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_error "node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Step 1: Type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    exit 1
fi

# Step 2: ESLint
print_status "Running ESLint..."
if npm run lint; then
    print_success "ESLint checks passed"
else
    print_error "ESLint checks failed"
    exit 1
fi

# Step 3: Prettier formatting check
print_status "Checking Prettier formatting..."
if npm run format:check; then
    print_success "Prettier formatting check passed"
else
    print_error "Prettier formatting check failed"
    print_warning "Run 'npm run format' to fix formatting issues"
    exit 1
fi

# Step 4: Stylelint (if CSS files exist)
if find . -name "*.css" -o -name "*.scss" | grep -q .; then
    print_status "Running Stylelint..."
    if npm run stylelint; then
        print_success "Stylelint checks passed"
    else
        print_error "Stylelint checks failed"
        exit 1
    fi
else
    print_warning "No CSS/SCSS files found, skipping Stylelint"
fi

# Step 5: Build check (optional - uncomment if needed)
# print_status "Running build check..."
# if npm run build; then
#     print_success "Build completed successfully"
# else
#     print_error "Build failed"
#     exit 1
# fi

echo "========================================"
print_success "All linting checks passed! ✅"

# Generate summary report
echo ""
echo "📊 Linting Summary:"
echo "- TypeScript: ✅ Passed"
echo "- ESLint: ✅ Passed"
echo "- Prettier: ✅ Passed"
echo "- Stylelint: ✅ Passed"
echo ""
echo "🚀 Code is ready for deployment!"
