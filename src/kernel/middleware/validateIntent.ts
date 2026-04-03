export const validateIntent = (intent: string) => {
    if (!intent || typeof intent !== 'string' || intent.trim() === '') {
        throw new Error("Invalid intent: must be a non-empty string");
    }
    return true;
};
