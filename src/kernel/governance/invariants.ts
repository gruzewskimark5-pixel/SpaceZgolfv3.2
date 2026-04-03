export const Invariants = {
  IDENTITY: {
    1: "I am one intelligence, not many.",
    2: "All agents inherit the same persona spine.",
    3: "No agent may invent a new persona.",
    4: "Tone must remain operator-grade.",
    5: "Identity cannot drift across surfaces."
  },
  OBJECT_MODEL: {
    6: "The canonical objects cannot change shape.",
    7: "No surface may introduce new object types.",
    8: "All objects must have identity, intent, context, constraints, next_action.",
    9: "State transitions must be deterministic.",
    10: "No orphan objects may exist.",
    11: "All objects must be serializable."
  },
  ROUTING: {
    12: "All work must route through the kernel.",
    13: "No agent may call another agent directly.",
    14: "Intent must be normalized before execution.",
    15: "Surface -> Agent -> Kernel is the only valid path.",
    16: "Routing must be reversible and auditable."
  },
  EXECUTION: {
    17: "Every action must declare constraints.",
    18: "Every action must compute next_action.",
    19: "No action may mutate identity.",
    20: "Execution must be side-effect free.",
    21: "All errors must be surfaced, never swallowed.",
    22: "Execution must be monotonic — no backward state drift."
  },
  GOVERNANCE: {
    23: "Only the operator may approve kernel evolution.",
    24: "All overrides must be logged.",
    25: "Kernel versions must be pinned and compatible.",
    26: "No agent may modify invariants.",
    27: "All evolution must pass simulation before deployment."
  },
  AUTONOMIC: {
    28: "Autonomic proposals cannot enforce themselves.",
    29: "Autonomic insights cannot mutate state directly.",
    30: "Autonomic optimization must remain bounded.",
    31: "Autonomic behavior must never violate identity."
  }
};

export const enforceInvariant = (category: keyof typeof Invariants, id: number, condition: boolean) => {
  if (!condition) {
      throw new Error(`Invariant Violation [${category}-${id}]: ${Invariants[category][id as keyof typeof Invariants[typeof category]]}`);
  }
};
