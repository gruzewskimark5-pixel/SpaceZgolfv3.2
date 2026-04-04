export const RoutingContract = {
  validate(intent: string, surface: string) {
    if (!intent || !surface) {
        throw new Error("Routing violation");
    }
  }
};
