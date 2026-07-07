## 2026-03-02 - [Database N+1 Anti-Pattern]
**Learning:** Found an N+1 query loop on the backend for saving vitals. Because the POST endpoint processes batched payload, iterating through the array sequentially and invoking a DB upsert creates an O(N) database operations bottleneck.
**Action:** Use batch upsert natively offered by the Supabase client to convert O(N) trips into O(1).

## 2024-05-24 - [Missing Caching on Polled API]
**Learning:** The `GET /api/leaderboard` endpoint recalculates dominance index and fetches from DB on every request. With frontend clients polling every 60s, this scales poorly O(C) where C is clients.
**Action:** Added an in-memory API cache that only invalidates when new vitals are posted (`POST /api/global/vitals`), reducing database reads and computation overhead from O(C) to O(1) between updates.
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

## 2024-05-31 - Array.from GC Overhead on Iterables
**Learning:** Using `Array.from(memStore.values())` creates an unnecessary intermediate array allocation before the loop even begins to map over it. This O(N) allocation triggers additional garbage collection overhead.
**Action:** When mapping over Map or Set iterables, avoid `Array.from()`. Instead, pre-allocate the target array using `.size` and populate it directly using a `for...of` loop over `.values()` to reduce garbage collection overhead and gain measurable speedups.

## 2024-06-01 - Avoid Redundant Map Lookups
**Learning:** Checking `Map.has(key)` followed by `Map.get(key)` inside the hot path causes a double lookup on the internal hash structure. By directly calling `Map.get(key)` and checking for undefined/truthiness, we can eliminate one of the lookups and execute the check faster.
**Action:** When validating and retrieving values from a `Map`, prefer `const val = map.get(key); if (!val) return;` instead of `if (!map.has(key)) return; const val = map.get(key);` to halve the lookup overhead.
## 2024-06-01 - Redundant Map Lookups in Hot Paths
**Learning:** Checking for existence in a `Map` using `.has()` and then immediately retrieving the value using `.get()` performs two internal hash map lookups. In high-iteration loops or hot paths like `EventBus.emit()`, this doubles the lookup overhead unnecessarily.
**Action:** When checking for existence and retrieving a value from a `Map` on a hot path, avoid doing `Map.has()` followed by `Map.get()`. Instead, perform a single `Map.get()` and check its truthiness (e.g., `let val = map.get(key); if (!val) { ... }`) to halve the internal hash map lookup overhead.

## 2024-06-02 - Redundant Object Allocation and Map Updates
**Learning:** When retrieving and updating objects from a Map using patterns like `const obj = map.get(key) || { default: true }`, a new object is allocated in memory on every request, even if the key exists in the Map. Furthermore, unconditionally calling `map.set(key, obj)` after mutating the object is redundant because modifying the object reference directly updates the value in the Map.
**Action:** To reduce GC overhead and unnecessary Map write operations, use an `if (!obj)` block to assign defaults and call `map.set()` only when a new key is added. Mutate the object reference directly for subsequent updates.

## 2024-06-03 - DOM element.innerHTML Serialization Overhead
**Learning:** Reading `element.innerHTML` from the DOM is an expensive operation because it forces the browser to synchronously serialize the current DOM tree into an HTML string, causing significant overhead in render loops.
**Action:** When updating the DOM via `innerHTML`, avoid checking against the current DOM state (`element.innerHTML !== newHtml`). Instead, maintain a local javascript variable (e.g., `let lastHtml = '';`) to cache the string and compare against it (`lastHtml !== newHtml`), completely avoiding the expensive synchronous DOM read.
## 2024-06-03 - Avoiding innerHTML Reads in Hot Paths
**Learning:** Reading `element.innerHTML` forces the browser to synchronously serialize the current DOM state into an HTML string, which creates an expensive operations overhead. When checking if an update is needed in a fast polling UI, reading `innerHTML` causes unnecessary lag.
**Action:** To optimize UI updates that compare HTML strings, maintain a state variable (e.g., `lastHtml`) in JavaScript memory to cache the string. Compare the new HTML against this variable instead of reading from the DOM to avoid the expensive synchronous serialization operation.

## 2024-06-04 - Set vs Array Iteration Performance in Hot Paths
**Learning:** While `Set` provides O(1) addition and deletion, iterating over a `Set` (via `for...of` or `.forEach()`) incurs significant garbage collection and iteration overhead in V8/Node.js compared to a standard `Array` with a `for` loop. In hot paths that are read-heavy but write-light (like `EventBus.emit()` which iterates over many listeners), this overhead is compounding.
**Action:** When managing collections that are iterated far more often than they are modified (like event listener lists), prefer using an `Array` over a `Set`. Use `.includes(fn)` before `.push(fn)` to prevent duplicates, and `.splice()` for removals, but optimize the hot iteration path with a standard `for` loop over the array.

## 2026-05-07 - Inline closures in hot loops
**Learning:** Extracting logic into a closure (like `mapRow`) inside a hot loop (like processing large arrays in `/api/leaderboard`) introduces measurable function call and closure allocation overhead.
**Action:** Inlining the `mapRow` logic directly within the `for` loops in `api/server.js` provides a ~15-20% speedup for large array processing. Avoid creating closures inside high-iteration loops when possible.

## 2024-06-05 - Avoid Template Literals and Inline Functions in Hot Render Loops
**Learning:** While template literals (`` `...` ``) provide improved readability over standard string concatenation, using them inside high-iteration loops causes measurable overhead in V8 (approximately 25% to 30% slower). This overhead is exacerbated when inline function calls (like `.toUpperCase()` or helper function lookups for classes) are evaluated on every iteration.
**Action:** When optimizing hot render paths that construct large HTML strings (e.g. `src/ui/neon-scorecard.js`), eliminate template literals in favor of explicit direct string concatenation (`+`). Pre-calculate inner string logic (such as CSS classes and uppercase mapping) using fast explicit `if/else` checks rather than repeatedly calling functions on string literals to significantly boost string construction performance.

## 2024-06-06 - Unbounded Map Memory Leaks in Node.js
**Learning:** Storing transient data (like IP-based rate limiting records) in an in-memory `Map` without a cleanup mechanism causes unbounded memory growth over time. As new, unique IP addresses make requests to the server, the `Map` accumulates stale entries indefinitely. This is a subtle but critical backend memory leak that eventually degrades performance and leads to OOM crashes on long-running processes.
**Action:** When implementing in-memory caching or rate limiting using `Map`, always ensure a `setInterval` or TTL cleanup mechanism exists to periodically sweep and delete expired entries, reclaiming memory.
## 2024-06-06 - V8 indexOf vs includes optimization
**Learning:** In high-iteration memory mapping loops in V8 (like mapping thousands of rows into the in-memory leaderboard view), using explicit string index check `str && str.indexOf('val') !== -1` is around ~10-15% faster than using optional chaining combined with includes `str?.includes('val')`.
**Action:** When performing string lookup operations on potentially nullable object properties inside high iteration loops, prefer explicitly assigning the property and checking `indexOf !== -1` to reduce V8 string matching and optional chaining execution overhead.

## 2024-06-07 - V8 Optional Chaining Micro-optimizations
**Learning:** Replacing optional chaining (`?.`) with standard truthiness checks (`obj && obj.prop`) on simple property lookups provides negligible performance benefits in V8 and degrades code readability, violating rules against unmeasurable micro-optimizations.
**Action:** Avoid replacing optional chaining for simple object property access unless it's bundled inside a complex evaluation chain (like a string matching lookup) where the compounding operations show measurable overhead.

## 2024-06-08 - Safety of Removing Number() Coercion
**Learning:** Removing `Number()` type casting from mathematical calculations (like `z + 3`) when the input may be received as a string from an API payload will cause critical regressions by switching mathematical addition to string concatenation.
**Action:** Never remove explicit type casting in mathematical operations unless you can absolutely guarantee the upstream caller is already strictly typed or explicitly coercing the variables.

## 2024-05-24 - Express ETag Synchronous Hashing Overhead
**Learning:** Express.js's default `res.send()` synchronously computes an MD5 hash to generate ETags for string payloads. For cached strings like API responses, this repetitive synchronous hashing blocks the main thread and introduces unnecessary overhead on every request.
**Action:** Precompute the ETag when generating and caching the string payload. Manually set it via `res.setHeader('ETag', precomputedETag)` before calling `res.send()`. Express will automatically skip hashing and handle the 304 Not Modified response natively based on the client's `If-None-Match` header.

## 2026-06-06 - Express res.send() Synchronous Overhead
**Learning:** Express.js's default `res.send()` synchronously calculates `Content-Length` by allocating a new `Buffer.from(string)` for large payloads before evaluating `req.fresh` status, causing unnecessary main-thread blocking.
**Action:** Precompute the ETag, manually check the `if-none-match` header using `.includes()`, and execute an early return (`return res.status(304).end();`) to completely bypass this internal Express payload handling overhead.

## 2026-06-06 - Express res.send() vs res.end()
**Learning:** For Express.js routes returning pre-serialized string caches where `ETag` and `Content-Type` are already manually managed, using `res.send(string)` invokes unnecessary internal Express payload processing (like calculating `Content-Length` via `Buffer` allocation and redundant ETag generation).
**Action:** When manually managing `ETag` and `Content-Type` headers for pre-serialized string caches, prefer `res.end(string)` instead of `res.send(string)` to skip this redundant processing.
## 2024-06-21 - Frontend Polling ETag Short-Circuit
**Learning:** When polling an API constantly using `setInterval`, standard caching alone isn't enough if the client still parses the response, maps the data, and checks for DOM updates. Processing identical payloads repeatedly causes significant CPU spikes, memory allocations, and V8 garbage collection overhead on the client.
**Action:** Optimize frontend polling loops by explicitly storing the `ETag` from the server's initial response and sending it via the `If-None-Match` header on subsequent requests. Short-circuit the entire processing pipeline early when the server responds with a `304 Not Modified`, skipping parsing (`r.json()`), object manipulation, and event emissions completely.
## 2024-07-01 - Express Static Middleware I/O Overhead
**Learning:** Placing `express.static` before API routes forces the server to execute a filesystem `stat` call for every API request, checking if a static file matches the API path. This introduces unnecessary I/O overhead on high-throughput backend endpoints.
**Action:** Optimize Express.js route order by placing `express.static` below all API route definitions, directly above the catch-all fallback route, to prevent this unnecessary I/O blocking.
