export const IdentityContract = {
    validate(agent) {
        if (!agent.identity || agent.identity !== "kernel-compliant") {
            throw new Error("Agent identity violation");
        }
    }
};
