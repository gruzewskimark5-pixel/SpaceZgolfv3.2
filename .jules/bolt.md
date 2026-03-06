## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2026-03-02 - [Client-Side Recalculation Anti-Pattern]
**Learning:** Found redundant recalculation on the frontend. The backend `/api/leaderboard` pre-computes dominance indices and sorts the payload. However, the frontend `fetchAPI` was reverse-mapping the pre-computed data back into raw DB row format just to reuse the local `zScoreBoard` recalculation function, creating unnecessary mapping and CPU overhead.
**Action:** When the backend provides pre-computed and pre-sorted data, use it directly. Avoid reverse-mapping just to reuse a local processing function.
