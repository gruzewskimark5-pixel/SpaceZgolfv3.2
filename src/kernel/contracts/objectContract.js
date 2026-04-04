export const ObjectContract = {
    validate(context) {
        if (!context) {
            throw new Error("Object model violation");
        }
    }
};
