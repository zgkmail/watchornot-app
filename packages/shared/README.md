# WatchOrNot Shared API Contracts

This package contains TypeScript type definitions for all API contracts used across the WatchOrNot platform.

## Purpose

- 📝 **Single source of truth** for API contracts
- 🔄 **Cross-platform consistency** between web and iOS
- 🛠️ **Code generation** for Swift models
- 📚 **Documentation** for API structure

## Structure

```typescript
api-contracts.ts
├── Common Types      // ApiResponse, etc.
├── Movie Types       // Movie, MovieDetails
├── Claude Vision     // Image analysis
├── Onboarding        // Movie voting flow
├── Recommendations   // Personalized results
├── User Profile      // Stats, tiers
├── History           // Vote history
├── TMDB/OMDb         // External API types
└── Session           // Authentication
```

## Usage

### For Web (React/TypeScript)
```typescript
import { Movie, RecommendationsResponse } from '@watchornot/shared';

const fetchRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetch('/api/recommendations');
  return response.json();
};
```

### For iOS (Swift Generation)
```bash
# Generate Swift models from TypeScript
npm run codegen:swift

# Output: packages/ios/WatchOrNot/Models/Generated/
```

### For Backend (JavaScript Reference)
```javascript
// Use as JSDoc reference
/**
 * @typedef {import('@watchornot/shared').Movie} Movie
 * @typedef {import('@watchornot/shared').VoteRequest} VoteRequest
 */
```

## Generating Swift Models

**Automated by Claude Code:**
```bash
# Claude can generate Swift equivalents
claude codegen swift-models --from packages/shared/api-contracts.ts --out packages/ios/WatchOrNot/Models/
```

**Example Output:**
```typescript
// TypeScript
export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
}
```

```swift
// Generated Swift
struct Movie: Codable, Identifiable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
}
```

## Keeping in Sync

**When backend API changes:**
1. Update `api-contracts.ts` first
2. Run Swift model generation
3. Backend automatically inherits types (JSDoc)
4. Web uses TypeScript types directly

**Validation:**
```bash
# Type-check all packages
npm run typecheck
```

## API Version Compatibility

All types support **backward compatibility**. When adding new fields:
- ✅ Add optional fields: `newField?: string`
- ✅ Add new types for new endpoints
- ❌ Don't remove existing fields
- ❌ Don't change field types

This ensures iOS and web clients continue working during updates.

## Documentation

See [API Reference](../../docs/04-api-reference/) for detailed endpoint documentation.
