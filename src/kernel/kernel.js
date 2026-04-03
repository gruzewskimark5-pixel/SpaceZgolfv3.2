import { IdentityContract } from "./contracts/identityContract.js";
import { RoutingContract } from "./contracts/routingContract.js";
import { ObjectContract } from "./contracts/objectContract.js";
import { StateMachine } from "./state/stateMachine.js";
export class Kernel {
    identity;
    objects;
    stateMachine;
    contracts;
    constructor(config) {
        this.identity = config.identity;
        this.objects = config.objects;
        this.stateMachine = config.stateMachine || StateMachine;
        this.contracts = config.contracts || {
            identity: IdentityContract,
            routing: RoutingContract,
            object: ObjectContract
        };
    }
    route(intent, surface, agent, context) {
        this.contracts.identity.validate(agent);
        this.contracts.routing.validate(intent, surface);
        this.contracts.object.validate(context);
        const nextState = this.stateMachine.transition(context, intent);
        return {
            state: nextState,
            next_action: this.stateMachine.nextAction(nextState),
        };
    }
}
