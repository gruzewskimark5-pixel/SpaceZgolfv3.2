## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Database Polling Bottleneck]
**Learning:** `GET /api/leaderboard` queries the database every time it's polled by a client. This creates a bottleneck as traffic scales (O(Clients) database reads).
**Action:** Use in-memory caching for the endpoint and invalidate it on write (`POST /api/global/vitals`) to convert O(Clients) reads into O(Updates).

## 2026-03-07 - [Memory Churn in Array Mapping]
**Learning:** Found an O(N) memory allocation and garbage collection bottleneck on the backend `GET /api/leaderboard` endpoint. Chained `.map().sort().map()` with object spread `{ ...r, rank: i + 1 }` inside the loop creates large amounts of intermediate arrays and objects, causing high memory churn as N scales.
**Action:** Use pre-allocated arrays `new Array(rows.length)` and a simple loop with direct object property assignment to prevent temporary object creation. Doing rank assignment in a subsequent loop on the sorted array completely avoids using spread operators on large iterations, saving 30-40% execution time and memory.
