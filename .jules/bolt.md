## 2024-05-24 - String building performance vs Template literals
**Learning:** While manual string concatenation using `+` or a `for` loop with a pre-allocated array may be technically faster than `.map(...).join('')` for inline HTML generation, doing so sacrifices readability of modern template literals. V8 garbage collection overhead can be avoided by pre-allocating an array (`new Array(len)`) and joining it instead of chaining `.map()`, which preserves the readability of template literals inside the loop while still gaining a measurable performance benefit (preventing intermediate array creation by `.map`).
**Action:** When optimizing array string joins for HTML generation, use a `for` loop with a pre-allocated array (`new Array(len)`) and keep the inner generation logic as a template literal to balance performance (saving GC overhead) with clean, readable code.

## 2024-05-25 - Frontend Map Optimization
**Learning:** In frontend polling loops that construct large payloads (such as API fetch results processing in `src/cron/pulse.js`), using `.map()` creates an overhead similar to the backend. Re-evaluating `Date.now()` inside a `.map` fallback generates an additional system call per iteration. By replacing `.map()` with a pre-allocated array (`new Array(len)`) and a `for` loop, and hoisting `Date.now()` outside the loop, we can reduce intermediate allocations and garbage collection overhead by ~60% in high-iteration benchmarks.
**Action:** Always pre-allocate arrays and hoist redundant function calls (like `Date.now()`) outside of mapping loops for frontend background jobs to avoid unnecessary garbage collection spikes and system call overhead.
## 2024-05-26 - Frontend Redundant Re-computation of Backend API Data
**Learning:** Sometimes the backend serves already optimized, pre-computed, and pre-sorted data (like the JSON payload from `/api/leaderboard`). Fetching this data on the frontend and mapping it back into a raw format to run it redundantly through a computation and sort pipeline again is a significant waste of CPU cycles and memory.
**Action:** Always inspect the payload format and sorting of API responses. If the backend already returns fully processed data, pass it straight into the frontend state store bypassing any local compute pipelines.

## 2024-05-27 - Frontend String Concatenation vs Array Join
**Learning:** In V8/Node.js environments, iterating through a collection and sequentially appending to a string using the `+=` operator with template literals is significantly faster (over 2.5x) than pre-allocating an array, mapping strings to indices, and calling `.join('')`.
**Action:** When refactoring inline HTML generation for readability, prefer direct string concatenation (`+=`) over arrays with `.join('')` or multi-line template literals. String concatenation is significantly faster in V8 Node.js environments and avoids introducing unintended whitespace/newlines that disrupt CSS layouts.

## 2024-05-28 - Premature Optimization on Cold Paths
**Learning:** Replacing `Array.prototype.forEach()` with a standard `for` loop to iterate over an array is a classic micro-optimization. In modern JavaScript engines like V8, the performance difference is negligible in a server request context. Applying it to cold paths like fallback error blocks is a premature optimization that violates guidelines against unreadable micro-optimizations.
**Action:** Avoid micro-optimizations on cold paths. Focus on operations with measurable impact, like database query bounding or caching.

## 2024-05-29 - Database Query Bounding on Unaggregated Data
**Learning:** While bounding database queries with `.limit()` is a valid performance optimization for endpoints returning raw lists, applying it to a query that fetches raw data intended for in-memory aggregation (like calculating top scores for a leaderboard) will completely break the functionality. The leaderboard will no longer reflect the actual highest scores across all users, just the scores among those arbitrary records.
**Action:** Do not use `.limit()` on database queries if the fetched data must be aggregated in-memory to determine the final results. To optimize this correctly, the aggregation and sorting would need to be moved to the database level (e.g., via a SQL view or RPC).

## 2024-05-30 - Redundant Type Conversion in Loops
**Learning:** Repeatedly casting the same value inside high-iteration loops (e.g., calling `Number()` on a string multiple times per row) creates measurable overhead. When passing data to helper functions that also perform type casting, the overhead compounds.
**Action:** Hoist and cache type conversions (like `Number(val)`) into local variables before passing them to helper functions or reusing them in object construction to halve the parsing overhead in large array loops.
