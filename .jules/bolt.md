## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Database Polling Bottleneck]
**Learning:** `GET /api/leaderboard` queries the database every time it's polled by a client. This creates a bottleneck as traffic scales (O(Clients) database reads).
**Action:** Use in-memory caching for the endpoint and invalidate it on write (`POST /api/global/vitals`) to convert O(Clients) reads into O(Updates).
