## 2026-03-01 - Batching Supabase Upserts to Fix N+1 Query Bottleneck
**Learning:** In `api/server.js`, the `/api/global/vitals` endpoint processes arrays of metrics, performing a separate `supabase.from('vitals').upsert` for every item in the loop. This causes an N+1 scaling issue directly tied to backend performance.
**Action:** When handling arrays of updates in a database, map the objects into a single array and perform a single batched operation instead of looping over single upserts.
