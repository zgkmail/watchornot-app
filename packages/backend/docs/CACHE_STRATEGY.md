# Backend Cache Strategy Plan

## Executive Summary

This document outlines a comprehensive caching strategy for the WatchOrNot backend to reduce external API calls, improve response times, and optimize API quota usage for TMDB, OMDb, and Claude Vision APIs.

**Current State:**
- Cache infrastructure exists (`utils/cache.js`) but is NOT integrated into routes
- No caching currently active despite having `tmdbCache` and `omdbCache` instances
- Rate limiting configured (30 requests/15min for external APIs)

**Goals:**
1. Reduce external API calls by 70-90%
2. Improve response times from ~500ms to <50ms for cached data
3. Respect API rate limits and daily quotas
4. Minimize memory footprint with intelligent TTL strategies

---

## Cache Architecture

### 1. Multi-Layer Cache Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LAYER 1: In-Memory Cache                    │
│  (Fast, volatile, 15min-7day TTL depending on data)     │
└────────────────────┬────────────────────────────────────┘
                     │ Cache Miss
                     ▼
┌─────────────────────────────────────────────────────────┐
│         LAYER 2: SQLite Persistent Cache                 │
│    (Slower, persistent, 30-90day TTL, indexed)          │
└────────────────────┬────────────────────────────────────┘
                     │ Cache Miss
                     ▼
┌─────────────────────────────────────────────────────────┐
│            LAYER 3: External API Call                    │
│     (Slowest, rate-limited, quota-constrained)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              Update Both Caches
```

---

## API-Specific Cache Strategies

### 🎬 TMDB (The Movie Database)

#### A. Search Results Cache
**Endpoint:** `GET /api/tmdb/search?query=&media_type=`

**Characteristics:**
- Highly cacheable (search results don't change frequently)
- Same query from multiple users
- Popular searches (e.g., "Inception", "Breaking Bad") hit frequently

**Cache Strategy:**
- **TTL:** 24 hours (86400000ms)
- **Key Format:** `tmdb:search:{query}:{mediaType}`
- **Example:** `tmdb:search:inception:movie`
- **Storage:** In-memory only (search results are large)
- **Invalidation:** Time-based only (no manual invalidation needed)

**Expected Impact:**
- Popular movies searched multiple times → 80-90% cache hit rate
- Reduces TMDB API calls for popular titles significantly

**Implementation:**
```javascript
// Cache key generation
const cacheKey = `tmdb:search:${query.toLowerCase()}:${mediaType || 'multi'}`;

// Before API call
const cached = tmdbCache.get(cacheKey);
if (cached) return res.json(cached);

// After API call
tmdbCache.set(cacheKey, apiResponse, 24 * 60 * 60 * 1000); // 24 hours
```

---

#### B. Movie/TV Details Cache
**Endpoint:** `GET /api/tmdb/:mediaType/:id`

**Characteristics:**
- Most stable data (movie info rarely changes after release)
- Same movie details requested by multiple users
- Heavy payload with credits, videos, external_ids

**Cache Strategy:**
- **TTL:** 7 days (604800000ms) for released content
- **TTL:** 24 hours for upcoming releases (check if release_date > today)
- **Key Format:** `tmdb:details:{mediaType}:{id}`
- **Example:** `tmdb:details:movie:550` (Fight Club)
- **Storage:**
  - Layer 1: In-memory cache (7-day TTL)
  - Layer 2: SQLite persistent cache (90-day TTL)
- **Invalidation:** Time-based

**Expected Impact:**
- Released movies: 95%+ cache hit rate after first request
- Reduces redundant credit/video data fetches

**Implementation:**
```javascript
// Cache key
const cacheKey = `tmdb:details:${mediaType}:${id}`;

// Check in-memory cache first
let cached = tmdbCache.get(cacheKey);
if (cached) return res.json(cached);

// Check SQLite persistent cache
cached = await persistentCache.get(cacheKey);
if (cached) {
  tmdbCache.set(cacheKey, cached, 7 * 24 * 60 * 60 * 1000); // Promote to memory
  return res.json(cached);
}

// After API call
tmdbCache.set(cacheKey, apiResponse, 7 * 24 * 60 * 60 * 1000);
await persistentCache.set(cacheKey, apiResponse, 90 * 24 * 60 * 60 * 1000);
```

**Optimization:**
- Conditionally append credits/videos only if not in cache
- Store "slim" version without videos for faster retrieval

---

### 🎖️ OMDb API (Ratings)

#### Ratings Cache
**Endpoint:** `GET /api/omdb/ratings/:imdbId`

**Characteristics:**
- Most stable data (ratings change slowly after initial reviews)
- IMDb/RT/Metacritic scores settle within weeks of release
- Limited daily quota (1,000 calls/day for free tier)

**Cache Strategy:**
- **TTL:** 7 days (604800000ms)
- **Key Format:** `omdb:ratings:{imdbId}`
- **Example:** `omdb:ratings:tt0137523`
- **Storage:**
  - Layer 1: In-memory cache (7-day TTL)
  - Layer 2: SQLite persistent cache (30-day TTL)
- **Invalidation:** Time-based
- **Priority:** HIGH (due to strict daily quota)

**Expected Impact:**
- 90%+ cache hit rate for popular movies
- Protects against hitting 1,000 call/day limit
- Critical for free tier sustainability

**Implementation:**
```javascript
const cacheKey = `omdb:ratings:${imdbId}`;

// Check in-memory cache
let cached = omdbCache.get(cacheKey);
if (cached) return res.json(cached);

// Check SQLite persistent cache
cached = await persistentCache.get(cacheKey);
if (cached) {
  omdbCache.set(cacheKey, cached, 7 * 24 * 60 * 60 * 1000);
  return res.json(cached);
}

// After API call
omdbCache.set(cacheKey, apiResponse, 7 * 24 * 60 * 60 * 1000);
await persistentCache.set(cacheKey, apiResponse, 30 * 24 * 60 * 60 * 1000);
```

**Special Handling:**
- If OMDb returns 429 (rate limit), serve stale cache if available
- Log when approaching daily quota (monitor request counts)

---

### 🤖 Claude Vision API

#### Image Identification Cache
**Endpoint:** `POST /api/claude/identify`

**Characteristics:**
- Expensive API calls (~$0.002/request)
- Image-specific (same image → same result)
- Low cache hit rate (different users = different screenshots)

**Cache Strategy:**
- **TTL:** 1 hour (3600000ms)
- **Key Format:** `claude:image:{hash}` (SHA-256 of image data)
- **Storage:** In-memory only (short-lived, session-based)
- **Invalidation:** Time-based
- **Priority:** LOW (image uniqueness means low hit rate)

**Expected Impact:**
- 10-20% cache hit rate (only if user retries same photo)
- Prevents accidental duplicate submissions
- More useful for debugging/testing than production

**Implementation:**
```javascript
const crypto = require('crypto');
const imageHash = crypto.createHash('sha256').update(imageData).digest('hex');
const cacheKey = `claude:image:${imageHash}`;

// Check cache
const cached = claudeCache.get(cacheKey);
if (cached) return res.json(cached);

// After API call
claudeCache.set(cacheKey, apiResponse, 60 * 60 * 1000); // 1 hour
```

**Note:** Consider skipping cache for Claude Vision due to low ROI vs. complexity.

---

## Implementation Plan

### Phase 1: In-Memory Cache Integration (Week 1)

**Priority: HIGH**

1. **Integrate TMDB Search Cache** (`routes/tmdb.js`)
   - Add cache check before search API call
   - Store results with 24-hour TTL
   - Log cache hit/miss for monitoring

2. **Integrate TMDB Details Cache** (`routes/tmdb.js`)
   - Add cache check before details API call
   - Store results with 7-day TTL
   - Implement dynamic TTL based on release date

3. **Integrate OMDb Ratings Cache** (`routes/omdb.js`)
   - Add cache check before ratings API call
   - Store results with 7-day TTL
   - Implement stale cache fallback for rate limit errors

**Estimated Impact:**
- 70% reduction in TMDB API calls
- 85% reduction in OMDb API calls
- Sub-50ms response times for cached data

---

### Phase 2: Persistent Cache Layer (Week 2)

**Priority: MEDIUM**

1. **Create SQLite Cache Table**
```sql
CREATE TABLE api_cache (
  cache_key TEXT PRIMARY KEY,
  cache_value TEXT NOT NULL,  -- JSON stringified
  expires_at INTEGER NOT NULL, -- Unix timestamp
  created_at INTEGER NOT NULL,
  api_source TEXT NOT NULL    -- 'tmdb', 'omdb', 'claude'
);

CREATE INDEX idx_expires_at ON api_cache(expires_at);
CREATE INDEX idx_api_source ON api_cache(api_source);
```

2. **Implement Persistent Cache Module** (`utils/persistentCache.js`)
   - Methods: `get()`, `set()`, `delete()`, `cleanup()`
   - Automatic cleanup of expired entries (daily job)
   - Query optimization with indexes

3. **Integrate Two-Layer Cache**
   - Check in-memory → check SQLite → call API
   - Promote SQLite hits to in-memory cache
   - Write-through strategy (update both layers)

**Estimated Impact:**
- 90%+ cache hit rate for popular content
- Survives server restarts (persistent cache)
- Reduces API calls even after deployment

---

### Phase 3: Cache Monitoring & Optimization (Week 3)

**Priority: MEDIUM**

1. **Add Cache Metrics** (`utils/cacheMetrics.js`)
   - Track hit/miss rates per API
   - Monitor cache size and memory usage
   - Log expensive cache misses (frequent searches)

2. **Create Cache Dashboard Endpoint**
   - `GET /api/admin/cache/stats` (admin-only)
   - Returns: hit rates, cache size, top cached items
   - Useful for monitoring and optimization

3. **Implement Cache Warming**
   - Pre-populate cache with popular movies on server start
   - Use top 100 movies from TMDB (one-time fetch)
   - Reduces cold start cache misses

**Example Metrics:**
```json
{
  "tmdb": {
    "search": { "hits": 450, "misses": 50, "hitRate": 0.90 },
    "details": { "hits": 380, "misses": 20, "hitRate": 0.95 }
  },
  "omdb": {
    "ratings": { "hits": 420, "misses": 30, "hitRate": 0.93 }
  },
  "memory": {
    "cacheSize": 1248,
    "memoryUsageMB": 45
  }
}
```

---

### Phase 4: Advanced Features (Future)

**Priority: LOW**

1. **Redis Integration** (if scaling to multiple servers)
   - Replace in-memory cache with Redis
   - Shared cache across server instances
   - Required only if horizontal scaling

2. **Conditional Request Caching**
   - Use ETags for TMDB API requests
   - Send `If-None-Match` header with cached ETag
   - 304 Not Modified responses don't count toward quota

3. **Predictive Cache Pre-loading**
   - Analyze user behavior patterns
   - Pre-fetch related movies (e.g., sequels, similar genres)
   - Background jobs during low-traffic periods

4. **Cache Versioning**
   - Add version to cache keys: `v1:tmdb:search:{query}`
   - Allows cache invalidation by bumping version
   - Useful for API schema changes

---

## Cache Management

### Memory Management

**Target Memory Budget:** 100 MB for in-memory cache

**Eviction Strategy:**
- Use LRU (Least Recently Used) eviction if memory exceeds budget
- Prioritize: OMDb > TMDB details > TMDB search
- Current Map-based cache doesn't have LRU → upgrade to `lru-cache` npm package

**Recommended Package:**
```bash
npm install lru-cache
```

**Updated Cache Implementation:**
```javascript
const LRU = require('lru-cache');

const tmdbCache = new LRU({
  max: 500,              // Max 500 entries
  maxSize: 50 * 1024 * 1024, // 50 MB
  sizeCalculation: (value) => JSON.stringify(value).length,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  updateAgeOnGet: true   // LRU behavior
});
```

---

### Cache Invalidation Strategies

#### Time-Based (Primary)
- Most data: 7-day TTL
- Search results: 24-hour TTL
- Claude Vision: 1-hour TTL

#### Manual Invalidation (Future)
- Admin endpoint: `DELETE /api/admin/cache/:cacheKey`
- Bulk invalidation: `DELETE /api/admin/cache?api=tmdb`
- Use cases: API schema changes, data corrections

#### Event-Based (Future)
- Invalidate on user rating submission (if caching aggregated data)
- Invalidate on TMDB update webhooks (if TMDB offers them)

---

## Monitoring & Alerts

### Key Metrics to Track

1. **Cache Hit Rate**
   - Target: >80% for TMDB, >85% for OMDb
   - Alert if hit rate drops below 70%

2. **API Call Volume**
   - Track daily API calls per service
   - Alert if approaching quota limits:
     - OMDb: 800 calls/day (80% of 1,000 limit)
     - TMDB: No hard limit but track for cost estimation

3. **Cache Memory Usage**
   - Track total memory consumption
   - Alert if exceeds 100 MB

4. **Response Times**
   - Cache hit: <50ms
   - Cache miss: <500ms (external API)
   - Alert if p95 > 1 second

### Logging Strategy

**Cache Hit:**
```javascript
logger.info('Cache hit', {
  cacheKey,
  api: 'tmdb',
  responseTime: 12
});
```

**Cache Miss:**
```javascript
logger.info('Cache miss', {
  cacheKey,
  api: 'tmdb',
  responseTime: 487,
  externalApiTime: 456
});
```

**Rate Limit:**
```javascript
logger.warn('API rate limit', {
  api: 'omdb',
  imdbId,
  servedStaleCache: true
});
```

---

## Configuration

### Environment Variables

Add to `.env`:
```bash
# Cache Configuration
CACHE_ENABLED=true
CACHE_TTL_TMDB_SEARCH=86400000    # 24 hours
CACHE_TTL_TMDB_DETAILS=604800000  # 7 days
CACHE_TTL_OMDB_RATINGS=604800000  # 7 days
CACHE_TTL_CLAUDE_IMAGE=3600000    # 1 hour

# Persistent Cache
PERSISTENT_CACHE_ENABLED=true
PERSISTENT_CACHE_TTL_MULTIPLIER=4 # Persistent cache lives 4x longer

# Memory Limits
CACHE_MAX_MEMORY_MB=100
CACHE_MAX_ENTRIES=1000
```

### Feature Flags

```javascript
const cacheConfig = {
  tmdb: {
    search: { enabled: true, ttl: process.env.CACHE_TTL_TMDB_SEARCH },
    details: { enabled: true, ttl: process.env.CACHE_TTL_TMDB_DETAILS }
  },
  omdb: {
    ratings: { enabled: true, ttl: process.env.CACHE_TTL_OMDB_RATINGS }
  },
  claude: {
    image: { enabled: false, ttl: process.env.CACHE_TTL_CLAUDE_IMAGE }
  }
};
```

---

## Testing Strategy

### Unit Tests

1. **Cache Module Tests** (`tests/cache.test.js`)
   - Test TTL expiration
   - Test cache hit/miss
   - Test memory limits
   - Test cleanup job

2. **Persistent Cache Tests** (`tests/persistentCache.test.js`)
   - Test SQLite read/write
   - Test expiration cleanup
   - Test concurrent access

### Integration Tests

1. **Route-Level Cache Tests** (`tests/routes/tmdb.test.js`)
   - First request: cache miss → API call
   - Second request: cache hit → no API call
   - After TTL: cache miss → new API call

2. **Two-Layer Cache Tests**
   - In-memory hit
   - In-memory miss → SQLite hit
   - Both miss → API call

### Performance Tests

1. **Load Testing**
   - 100 concurrent requests for same movie
   - Measure: cache hit rate, response time, API calls

2. **Memory Leak Testing**
   - Run for 24 hours with varying load
   - Monitor memory growth
   - Ensure cleanup job runs correctly

---

## Rollout Plan

### Development Environment
1. Enable cache with logging
2. Monitor hit/miss rates
3. Optimize TTL values based on data

### Production Rollout
1. **Week 1:** Deploy Phase 1 (in-memory cache)
   - Feature flag: 10% of traffic
   - Monitor errors and performance
   - Gradually increase to 100%

2. **Week 2:** Deploy Phase 2 (persistent cache)
   - Enable for TMDB first
   - Add OMDb after 48 hours
   - Monitor database size growth

3. **Week 3:** Deploy Phase 3 (monitoring)
   - Enable cache metrics dashboard
   - Set up alerts
   - Optimize based on real usage patterns

### Rollback Plan
- Feature flag: `CACHE_ENABLED=false` instantly disables cache
- No breaking changes (cache is transparent to clients)
- Falls back to direct API calls if cache fails

---

## Cost-Benefit Analysis

### Current State (No Cache)
- TMDB API calls: ~500/day (free tier)
- OMDb API calls: ~300/day (30% of daily quota)
- Claude Vision: ~50/day (~$0.10/day)
- Average response time: 400-600ms

### With Cache (Projected)
- TMDB API calls: ~75/day (85% reduction)
- OMDb API calls: ~30/day (90% reduction)
- Claude Vision: ~45/day (minimal impact)
- Average response time: <100ms (80% cache hit rate)

### Benefits
1. **Performance:** 5-10x faster response times for cached data
2. **Reliability:** Less dependent on external API availability
3. **Cost:** Protects against hitting API quotas (avoids upgrade costs)
4. **Scalability:** Supports more users without increasing API calls

### Costs
1. **Development Time:** ~3 weeks of engineering effort
2. **Memory:** ~50-100 MB additional server memory
3. **Storage:** ~500 MB SQLite database (persistent cache)
4. **Maintenance:** Monitoring and optimization ongoing

**ROI:** High - Essential for production scalability

---

## Security Considerations

1. **Cache Poisoning Prevention**
   - Validate API responses before caching
   - Use secure hash for cache keys (prevent injection)
   - Sanitize user input in cache keys

2. **Sensitive Data**
   - Never cache user-specific data (ratings, sessions)
   - Only cache public API responses
   - Ensure cache keys don't contain PII

3. **Admin Endpoints**
   - Cache management endpoints require authentication
   - Rate limit admin endpoints
   - Log all cache invalidation actions

---

## Success Metrics

### Phase 1 Success Criteria
- Cache hit rate >70% for TMDB
- Cache hit rate >80% for OMDb
- No increase in error rates
- Response time <100ms for cache hits

### Phase 2 Success Criteria
- Cache survives server restarts
- Combined hit rate >85%
- Database size <1 GB after 30 days

### Phase 3 Success Criteria
- Cache metrics dashboard operational
- Alerts configured and tested
- Documentation complete

---

## Appendix

### Useful Commands

**Clear All Caches:**
```bash
curl -X DELETE http://localhost:3001/api/admin/cache/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**View Cache Stats:**
```bash
curl http://localhost:3001/api/admin/cache/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Warm Cache (Popular Movies):**
```bash
node scripts/warmCache.js
```

### References

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [OMDb API Documentation](https://www.omdbapi.com/)
- [HTTP Caching Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Redis Cache Patterns](https://redis.io/docs/manual/patterns/cache/)
- [SQLite Performance Tuning](https://www.sqlite.org/optoverview.html)

---

## Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-24 | 1.0 | Claude | Initial cache strategy document |

---

**Document Status:** DRAFT - Ready for review and implementation

**Next Steps:**
1. Review with engineering team
2. Prioritize phases based on current pain points
3. Create implementation tickets
4. Begin Phase 1 development
