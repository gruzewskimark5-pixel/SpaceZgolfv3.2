export const ZexzAdapter = {
    toKernel(intent, userState) {
        return {
            intent,
            surface: "product",
            context: userState,
        };
    },
    fromKernel(kernelOutput) {
        return {
            next: kernelOutput.next_action,
            state: kernelOutput.state,
        };
    }
};
