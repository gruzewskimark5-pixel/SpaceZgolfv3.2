export const IdentityContract = {
  validate(agent: any) {
    if (!agent.identity || agent.identity !== "kernel-compliant") {
      throw new Error("Agent identity violation");
    }
  }
};
