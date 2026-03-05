## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2024-05-24 - [Missing Caching on Polled API]
**Learning:** The `GET /api/leaderboard` endpoint recalculates dominance index and fetches from DB on every request. With frontend clients polling every 60s, this scales poorly O(C) where C is clients.
**Action:** Added an in-memory API cache that only invalidates when new vitals are posted (`POST /api/global/vitals`), reducing database reads and computation overhead from O(C) to O(1) between updates.
