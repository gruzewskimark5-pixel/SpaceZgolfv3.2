export const validateOutput = (output) => {
    if (!output || !output.state || !output.next_action) {
        throw new Error("Invalid output: must contain 'state' and 'next_action'");
    }
    return true;
};
