export class StateLedger {
    history = [];
    record(intent, previousState, nextState) {
        this.history.push({
            timestamp: Date.now(),
            intent,
            previousState: structuredClone(previousState),
            nextState: structuredClone(nextState)
        });
    }
    getAuditTrail() {
        return this.history;
    }
}
