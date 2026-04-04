import { Agent } from "./agent.js";
export class AgentClient {
    kernel;
    constructor(kernel) {
        this.kernel = kernel;
    }
    createAgent(domain) {
        return new Agent(this.kernel, domain);
    }
}
