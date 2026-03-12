## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Database Polling Bottleneck]
**Learning:** `GET /api/leaderboard` queries the database every time it's polled by a client. This creates a bottleneck as traffic scales (O(Clients) database reads).
**Action:** Use in-memory caching for the endpoint and invalidate it on write (`POST /api/global/vitals`) to convert O(Clients) reads into O(Updates).

## 2026-03-12 - Memory Churn in Large Array Iterations (Revised)
**Learning:** Mutating incoming objects in array processing is a severe anti-pattern that can break application state and references. A safe performance boost comes from avoiding the function invocation overhead of `.map()`, and instead using a traditional `for` loop to build a new pre-allocated array while creating fresh objects for safety.
**Action:** Use `new Array(len)` and a traditional `for` loop instead of `.map()` when processing very large arrays, making sure to avoid mutating the original source objects to preserve application stability.
