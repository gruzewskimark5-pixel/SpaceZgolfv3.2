export const RoutingContract = {
    validate(intent, surface) {
        if (!intent || !surface) {
            throw new Error("Routing violation");
        }
    }
};
