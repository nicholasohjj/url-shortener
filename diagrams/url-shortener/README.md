# URL Shortener System Diagrams

This directory contains PlantUML diagrams documenting the URL shortener system architecture and flows.

## Diagrams

### 1. `system-overview.puml`
**System Overview & Architecture Diagram**
- High-level view of all system components
- Shows the complete architecture from UI to database
- Includes component relationships and data flow
- Best for understanding the overall system structure

### 2. `component-diagram.puml`
**Component Diagram**
- Detailed component breakdown
- Shows layers: Client, Application, Business Logic, Data Access
- Database schema documentation
- Best for understanding system layers and dependencies

### 3. `create-url-sequence.puml`
**Create Short URL Sequence Diagram**
- Step-by-step flow for creating a short URL
- Shows all interactions between components
- Includes error handling scenarios
- Best for understanding the URL creation process

### 4. `redirect-sequence.puml`
**Redirect & Click Tracking Sequence Diagram**
- Flow for accessing a short URL
- Shows click tracking and redirect logic
- Database update operations
- Best for understanding the redirect and tracking mechanism

### 5. `data-flow.puml`
**Data Flow Diagram**
- Simplified flow of data through the system
- Decision points and branching logic
- Best for understanding business logic flow

## How to View

### Option 1: VS Code Extension
Install the "PlantUML" extension by jebbs, then open any `.puml` file and use the preview.

### Option 2: Online Viewer
1. Copy the contents of any `.puml` file
2. Go to http://www.plantuml.com/plantuml/uml/
3. Paste the content to view the diagram

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# Then generate PNG:
plantuml diagrams/url-shortener/*.puml
```

## System Features Documented

- ✅ URL validation
- ✅ Slug generation (random or custom)
- ✅ Unique slug enforcement
- ✅ Click counting
- ✅ Last accessed timestamp tracking
- ✅ HTTP redirect mechanism
- ✅ Error handling

## Performance Analysis: 1000 Concurrent Requests to Same Slug

### What Happens

When 1000 users simultaneously hit the same slug (`GET /[slug]`), the current implementation performs:

1. **1000 SELECT queries** - Each request queries the database to find the short URL by slug
2. **1000 UPDATE queries** - Each request updates the same database row to increment `clicks` and update `lastAccessedAt`

### Bottlenecks Identified

#### 🔴 **Critical: Database Row Lock Contention** (Primary Bottleneck)
- **Problem**: PostgreSQL uses row-level locking. When 1000 concurrent UPDATE queries target the same row, they serialize:
  - Request 1 acquires lock → updates → releases lock
  - Request 2 waits → acquires lock → updates → releases lock
  - ... and so on for all 1000 requests
- **Impact**: Requests queue up, causing significant latency (potentially seconds per request)
- **Location**: `app/[slug]/route.ts` lines 24-32

#### 🟡 **High: No Caching Layer**
- **Problem**: Every request hits the database for the lookup, even though `slug → targetUrl` mappings rarely change
- **Impact**: Unnecessary database load and latency
- **Location**: `app/[slug]/route.ts` lines 12-14

#### 🟡 **High: Connection Pool Exhaustion**
- **Problem**: Prisma's default connection pool (typically 10-20 connections) is much smaller than 1000 concurrent requests
- **Impact**: Most requests wait for an available database connection
- **Location**: `lib/prisma.ts` (no explicit pool configuration)

#### 🟠 **Medium: Synchronous Click Tracking**
- **Problem**: The redirect waits for the click count update to complete before redirecting
- **Impact**: Adds unnecessary latency to user experience (redirect should be instant)
- **Location**: `app/[slug]/route.ts` lines 24-32 (blocking the redirect)

#### 🟠 **Medium: Two Separate Database Queries**
- **Problem**: `findUnique` and `update` are separate queries that could be optimized
- **Impact**: Extra round-trip to database
- **Location**: `app/[slug]/route.ts` lines 12-14 and 24-32

### Performance Impact Estimate

With 1000 concurrent requests:
- **Without optimization**: ~10-30 seconds for all requests to complete
- **Database lock contention**: ~5-15 seconds of queuing
- **Connection pool wait**: ~2-5 seconds per request
- **User experience**: Users see 5-30 second delays before redirect

### Recommended Solutions

1. **Add Redis/Memcached caching** for slug lookups (eliminates 1000 SELECT queries)
2. **Make click tracking asynchronous** (fire-and-forget, don't block redirect)
3. **Use database-level atomic increment** (optimize the UPDATE query)
4. **Increase connection pool size** (or use connection pooling service)
5. **Consider eventual consistency** for click counts (update in background queue)
6. **Use CDN/Edge caching** for popular slugs (cache the redirect response itself)

### Current Code Flow

```
Request 1: SELECT → [wait for lock] → UPDATE → Redirect
Request 2: SELECT → [wait for lock] → UPDATE → Redirect
...
Request 1000: SELECT → [wait for lock] → UPDATE → Redirect
```

All requests serialize on the UPDATE operation, creating a bottleneck.

