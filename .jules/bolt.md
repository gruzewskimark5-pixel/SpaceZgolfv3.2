## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Database Polling Bottleneck]
**Learning:** `GET /api/leaderboard` queries the database every time it's polled by a client. This creates a bottleneck as traffic scales (O(Clients) database reads).
**Action:** Use in-memory caching for the endpoint and invalidate it on write (`POST /api/global/vitals`) to convert O(Clients) reads into O(Updates).

## 2026-03-12 - Memory Churn in Large Array Iterations (Revised)
**Learning:** Mutating incoming objects in array processing is a severe anti-pattern that can break application state and references. A safe performance boost comes from avoiding the function invocation overhead of `.map()`, and instead using a traditional `for` loop to build a new pre-allocated array while creating fresh objects for safety.
**Action:** Use `new Array(len)` and a traditional `for` loop instead of `.map()` when processing very large arrays, making sure to avoid mutating the original source objects to preserve application stability.

## 2026-03-24 - [EventBus Emission Optimization]
**Learning:** Iterating over a `Set` using `for...of` is significantly faster than using the spread operator `[...]` which creates an unnecessary intermediate array allocation, or `Set.prototype.forEach` which has callback overhead. In high-frequency event emitters, this can yield a ~26% performance improvement.
**Action:** Use `for...of` for iterating over Sets or Maps in performance-critical paths to avoid allocations and callback overhead, while being mindful that direct iteration reflects concurrent modifications unlike snapshotting.

## 2026-03-30 - [JSON Endpoint Serialization Bottleneck]
**Learning:** Polling-heavy endpoints like `GET /api/leaderboard` that serve cached JavaScript objects using `res.json()` suffer from an O(Clients) scaling issue. For every request, `JSON.stringify()` is executed synchronously, which blocks the Node.js event loop when concurrent connections surge.
**Action:** When caching read-heavy polled JSON endpoints, serialize the object once during the cache update (`leaderboardCache = JSON.stringify(data)`). Then, serve the string directly using `res.setHeader('Content-Type', 'application/json')` and `res.send()`. This converts serialization overhead from O(Clients) to O(1).
