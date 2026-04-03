export class StateLedger {
  history: any[] = [];

  record(intent: string, previousState: any, nextState: any) {
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
