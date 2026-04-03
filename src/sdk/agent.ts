export class Agent {
  kernel: any;
  domain: string;
  identity: string;

  constructor(kernel: any, domain: string) {
    this.kernel = kernel;
    this.domain = domain;
    this.identity = "kernel-compliant";
  }

  async act(intent: string, context: any) {
    return this.kernel.route(intent, this.domain, this, context);
  }
}
