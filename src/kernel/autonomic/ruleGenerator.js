import { enforceInvariant } from '../governance/invariants.js';
export class AutocatalyticRuleGenerator {
    proposals = [];
    generate(insight) {
        const proposal = { source: 'autonomic', logic: `Optimize based on ${insight.type}` };
        // Invariant 28: Autonomic proposals cannot enforce themselves.
        enforceInvariant('AUTONOMIC', 28, true);
        this.proposals.push(proposal);
        return proposal;
    }
}
