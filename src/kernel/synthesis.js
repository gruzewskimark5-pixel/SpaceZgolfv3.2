import { Kernel } from './kernel.js';
import { InsightHarvestingEngine } from './autonomic/insightEngine.js';
import { SurfaceRegistry } from './federation/surfaceRegistry.js';
import { StateLedger } from './runtime/ledger.js';
export class ZenithIntelligenceEngine {
    kernel;
    autonomic;
    federation;
    ledger;
    constructor(config) {
        this.kernel = new Kernel(config);
        this.autonomic = new InsightHarvestingEngine();
        this.federation = new SurfaceRegistry();
        this.ledger = new StateLedger();
    }
    // The Final Synthesis: Perceive -> Route -> Act -> Ledger
    async execute(intent, surfaceDomain, agent, context) {
        // 1. Federation check
        this.federation.validateSurface(surfaceDomain, intent);
        // 2. Kernel Route & Execution
        const output = this.kernel.route(intent, surfaceDomain, agent, context);
        // 3. Ledger Recording
        this.ledger.record(intent, context, output.state);
        // 4. Autonomic Harvesting (Async/Background)
        this.autonomic.harvest({ intent, surfaceDomain, output });
        return output;
    }
}
