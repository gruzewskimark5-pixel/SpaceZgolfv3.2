import { Agent } from "./agent.js";

export class AgentClient {
  kernel: any;

  constructor(kernel: any) {
    this.kernel = kernel;
  }

  createAgent(domain: string) {
    return new Agent(this.kernel, domain);
  }
}
