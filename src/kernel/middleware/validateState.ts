export const validateStateTransition = (currentState: any, nextState: any) => {
    if (!nextState) {
        throw new Error("Invalid state transition: nextState is null or undefined");
    }
    // Basic validation to ensure state doesn't drift into unknown structures
    if (typeof nextState !== 'object') {
        throw new Error("Invalid state transition: nextState must be an object");
    }
    return true;
};
