import { initScorecard } from './ui/neon-scorecard.js';
import { startPulse } from './cron/pulse.js';
initScorecard();
startPulse(60000);
console.log('[SystemZ] SpaceZgolf Neural v3.2 — ONLINE');
