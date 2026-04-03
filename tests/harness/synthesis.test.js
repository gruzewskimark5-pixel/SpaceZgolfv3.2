import test from 'node:test';
import assert from 'node:assert';
import { ZenithIntelligenceEngine } from '../../src/kernel/synthesis.js';
import { ExecutionSandbox } from '../../src/kernel/runtime/sandbox.js';
import { AgentClient } from '../../src/sdk/client.js';

test('Sovereign Runtime - Sandbox isolates context mutations', () => {
    const context = { value: 1 };

    // Malicious action tries to mutate external state
    const action = (ctx) => {
        ctx.value = 2;
        return ctx;
    };

    const result = ExecutionSandbox.evaluate(action, context);

    assert.strictEqual(result.value, 2, "Sandbox returns mutated clone");
    assert.strictEqual(context.value, 1, "Original context remains untouched");
});

test('Final Synthesis - End-to-end execution flow', async () => {
    const engine = new ZenithIntelligenceEngine({});

    // Setup Federation
    engine.federation.registerSurface('product', {
        allowedIntents: ['start_lesson']
    });

    const client = new AgentClient(engine.kernel);
    const agent = client.createAgent('product');

    const context = { user: 'test_user' };

    // Execute through the Zenith Engine
    const output = await engine.execute('start_lesson', 'product', agent, context);

    assert.ok(output.state);
    assert.strictEqual(output.next_action, 'default_action');

    // Verify Ledger tracked the transition
    const auditTrail = engine.ledger.getAuditTrail();
    assert.strictEqual(auditTrail.length, 1);
    assert.strictEqual(auditTrail[0].intent, 'start_lesson');
});
