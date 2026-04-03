# LIV Virginia Deployment Spec (Target: May 2026)

## 1. MVP Feature Set (Locked for LIV Virginia)
The goal for LIV Virginia is to deploy a live, stress-tested system that anchors real-time swing metrics to the blockchain, visualizes the Dominance Index (DI), and provides a minimal but robust broadcast overlay package. This is the "Minimum Viable Proof" for investors.

*   **USIH Swing Capture + Blockchain Anchor:**
    *   Capture 10-frame high-speed swing sequences.
    *   Process via the `/api/analyze-swing` endpoint using Grok Vision.
    *   Anchor the resulting archetype and swing metrics to the Solana mainnet.
*   **DI Engine Live Calculation:**
    *   Live ingestion of telemetry from selected showcase holes (target: Holes 1, 9, 18).
    *   Real-time processing of Efficiency Coefficients and Z-Scores via the `zScoreBoard` pipeline.
    *   Background processing via the `pulse.js` cron.
*   **Identity Hash & Rivalry Heat:**
    *   *Identity Hash:* Display basic archetypes (e.g., "The Technician", "The Brawler"). Full vector displays will be deferred to post-MVP.
    *   *Rivalry Heat:* Background tracking only. We will collect the data but not expose the visualization on the broadcast to minimize risk.
*   **Broadcast Overlays:**
    *   `neon-scorecard` components will go live for the selected showcase holes.
    *   Data will be driven directly by the `StateStore` fed from the `/api/leaderboard` endpoint.

## 2. Technical Stack Validation
The 7-week window requires hardening the existing architecture rather than introducing new paradigms.

*   **USIH Anchor Migration:**
    *   Complete devnet testing.
    *   Migrate to Solana mainnet 2 weeks prior to the event.
    *   Ensure wallet funding and transaction fee management is automated.
*   **Frontend Performance:**
    *   The Vanilla JS / DOM-caching architecture (`neon-scorecard.js`) must be profiled under simulated live event network latency.
    *   Ensure `pulse.js` gracefully handles dropped API requests without crashing the UI loop.
*   **Backend Resilience (Express/Node.js):**
    *   Load test `/api/global/vitals` and `/api/leaderboard`.
    *   Ensure the inline memory cache (`leaderboardCache`) in `server.js` functions correctly under concurrent read/write pressure.
    *   Validate rate limiting on `/api/analyze-swing` to prevent API key exhaustion.
*   **Data Persistence:**
    *   Supabase connection must be hardened. Ensure fallback to the in-memory (`memStore`) gracefully recovers when Supabase reconnects.

## 3. Risk Mitigation
*   **Blockchain Failure (Solana Congestion/Outage):**
    *   *Fallback:* Local caching of signed payloads. Retry queues established for delayed anchoring post-event. Broadcast visuals switch to "Processing" state rather than error states.
*   **AI API Degradation (X.AI Rate Limits/Timeouts):**
    *   *Fallback:* Hardcoded fallback archetypes based on raw telemetry data rather than visual analysis.
*   **Database Outage (Supabase):**
    *   *Fallback:* The Express backend's `memStore` handles full operational load. Data is written to local disk logs periodically to prevent loss on server crash.

## 4. Success Metrics
*   **Technical Success:** 99.9% uptime of the broadcast overlay during the telecast. 100% of captured swings anchored to the blockchain (even if delayed).
*   **Investor Proof:** 3+ minutes of high-quality live event footage showing the DI scorecard and swing analysis live on screen.
*   **Data Collection:** Complete data sets for the targeted showcase holes to feed post-event modeling.
