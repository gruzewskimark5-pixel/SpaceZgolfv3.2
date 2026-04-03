export const validateOutput = (output: any) => {
    if (!output || !output.state || !output.next_action) {
        throw new Error("Invalid output: must contain 'state' and 'next_action'");
    }
    return true;
};
