## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Database Polling Bottleneck]
**Learning:** `GET /api/leaderboard` queries the database every time it's polled by a client. This creates a bottleneck as traffic scales (O(Clients) database reads).
**Action:** Use in-memory caching for the endpoint and invalidate it on write (`POST /api/global/vitals`) to convert O(Clients) reads into O(Updates).

## 2024-05-28 - Array Processing Anti-pattern
**Learning:** This codebase frequently processes large arrays for leaderboards and rankings. Chaining `.map()` calls with object spread operators (`{...r, prop: val}`) causes unnecessary memory churn and garbage collection overhead.
**Action:** Always optimize performance by using in-place sorting and direct object property assignment in a `for` loop instead of chaining `.map()` and using object spreads to minimize memory usage.
