export const ZexzAdapter = {
  toKernel(intent: string, userState: any) {
    return {
      intent,
      surface: "product",
      context: userState,
    };
  },

  fromKernel(kernelOutput: any) {
    return {
      next: kernelOutput.next_action,
      state: kernelOutput.state,
    };
  }
};
