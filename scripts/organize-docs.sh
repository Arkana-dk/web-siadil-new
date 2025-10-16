#!/bin/bash

# Script to organize documentation files
# Moves all .md files (except README.md) to docs/archive folder

echo "🧹 Starting documentation cleanup..."

# Create docs directories if they don't exist
mkdir -p docs/archive
mkdir -p docs/api
mkdir -p docs/features
mkdir -p docs/fixes

# Count files
TOTAL_FILES=$(find . -maxdepth 1 -name "*.md" -not -name "README.md" -type f | wc -l)
echo "📊 Found $TOTAL_FILES markdown files to organize"

# Keep these important docs in root
KEEP_IN_ROOT=(
  "README.md"
)

# Move API-related docs
echo "📦 Moving API documentation..."
mv -f *API*.md docs/api/ 2>/dev/null || true
mv -f *ENDPOINT*.md docs/api/ 2>/dev/null || true
mv -f *DEMPLON*.md docs/api/ 2>/dev/null || true
mv -f *CORS*.md docs/api/ 2>/dev/null || true

# Move feature docs
echo "📦 Moving feature documentation..."
mv -f *DARK_MODE*.md docs/features/ 2>/dev/null || true
mv -f *PAGINATION*.md docs/features/ 2>/dev/null || true
mv -f *REMINDER*.md docs/features/ 2>/dev/null || true
mv -f *QUICK_ACCESS*.md docs/features/ 2>/dev/null || true
mv -f *WELCOME*.md docs/features/ 2>/dev/null || true
mv -f *SCROLL*.md docs/features/ 2>/dev/null || true
mv -f *ANIMATION*.md docs/features/ 2>/dev/null || true

# Move fix/troubleshooting docs
echo "📦 Moving fix documentation..."
mv -f FIX_*.md docs/fixes/ 2>/dev/null || true
mv -f *TROUBLESHOOTING*.md docs/fixes/ 2>/dev/null || true
mv -f *DEBUG*.md docs/fixes/ 2>/dev/null || true
mv -f *ERROR*.md docs/fixes/ 2>/dev/null || true
mv -f *SOLUTION*.md docs/fixes/ 2>/dev/null || true

# Move setup/guide docs
echo "📦 Moving setup and guide documentation..."
mv -f *GUIDE*.md docs/archive/ 2>/dev/null || true
mv -f *SETUP*.md docs/archive/ 2>/dev/null || true
mv -f *IMPLEMENTATION*.md docs/archive/ 2>/dev/null || true
mv -f *INSTRUCTIONS*.md docs/archive/ 2>/dev/null || true

# Move all remaining .md files to archive (except README.md)
echo "📦 Moving remaining documentation to archive..."
find . -maxdepth 1 -name "*.md" -not -name "README.md" -type f -exec mv -f {} docs/archive/ \; 2>/dev/null || true

# Move example files
echo "📦 Moving example files..."
mv -f EXAMPLE_*.tsx docs/archive/ 2>/dev/null || true
mv -f *.backup docs/archive/ 2>/dev/null || true

# Remove temp files
echo "🗑️  Removing temporary files..."
rm -f temp_file.txt 2>/dev/null || true
rm -f *.log 2>/dev/null || true

# Create a master index
echo "📝 Creating documentation index..."
cat > docs/README.md << 'EOF'
# 📚 Documentation Index

## 📁 Folder Structure

- **`/api`** - API integration documentation
- **`/features`** - Feature implementation guides
- **`/fixes`** - Bug fixes and troubleshooting
- **`/archive`** - Archived and legacy documentation

## 🔍 Quick Links

### API Documentation
- API Integration Guide → `api/`
- Demplon API docs → `api/`
- Endpoint references → `api/`

### Features
- Dark Mode → `features/`
- Pagination → `features/`
- Reminders → `features/`
- Quick Access → `features/`

### Troubleshooting
- All fixes → `fixes/`
- Debug guides → `fixes/`
- Error solutions → `fixes/`

### Archive
- Legacy documentation → `archive/`
- Old implementation guides → `archive/`
- Backup files → `archive/`

## 📖 Main Documentation

See root `../README.md` for main project documentation.
EOF

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  - API docs moved to: docs/api/"
echo "  - Feature docs moved to: docs/features/"
echo "  - Fix docs moved to: docs/fixes/"
echo "  - Other docs moved to: docs/archive/"
echo ""
echo "✨ Your workspace is now cleaner!"
