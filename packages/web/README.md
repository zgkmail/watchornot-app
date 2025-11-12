# WatchOrNot Web App (Legacy/Reference)

> ⚠️ **Status: Maintenance Mode**
> This web app is in **legacy/reference mode**. All new development is focused on the iOS app.

## Purpose

This web app serves as:
- 🔍 **Reference implementation** for iOS development
- 🧪 **Quick testing platform** for backend changes
- 📚 **Design/UX reference** for iOS app
- 🌐 **Functional backup** (still deployed and working)

## Development

### Quick Start
```bash
# From packages/web directory
npm install
npm run dev
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Maintenance Policy

**DO:**
- ✅ Keep it running (deployed)
- ✅ Fix critical bugs if reported
- ✅ Maintain backend compatibility
- ✅ Reference for iOS implementation

**DON'T:**
- ❌ Add new features
- ❌ Spend time on improvements
- ❌ Update dependencies (unless security)
- ❌ Redesign UI

## Migration to iOS

See [iOS Development Guide](../../docs/05-ios-specific/) for:
- Converting React components to SwiftUI
- Porting business logic
- API integration patterns

## Tech Stack

- **Framework:** React 18.2 + Vite 5.0
- **Styling:** Tailwind CSS 3.4
- **Testing:** Vitest
- **Backend:** Shared with iOS (see `packages/backend`)

## Questions?

See the [main README](../../README.md) for the overall project structure.
