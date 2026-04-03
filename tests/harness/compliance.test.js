import test from 'node:test';
import assert from 'node:assert';
import { Kernel } from '../../src/kernel/kernel.js';
import { AgentClient } from '../../src/sdk/client.js';

test('Identity Compliance - agent identity is kernel-compliant', () => {
    const kernel = new Kernel({});
    const client = new AgentClient(kernel);
    const agent = client.createAgent('product');
    assert.strictEqual(agent.identity, 'kernel-compliant');
});

test('Object Model Compliance - rejects missing context', () => {
    const kernel = new Kernel({});
    const client = new AgentClient(kernel);
    const agent = client.createAgent('product');

    assert.throws(() => {
        kernel.route('start', 'product', agent, null);
    }, /Object model violation/);
});

test('Routing Compliance - rejects routing without intent', () => {
    const kernel = new Kernel({});
    const client = new AgentClient(kernel);
    const agent = client.createAgent('product');

    assert.throws(() => {
        kernel.route(null, 'product', agent, {});
    }, /Routing violation/);
});

test('State Machine tests - state transitions are deterministic', () => {
    const kernel = new Kernel({});
    const client = new AgentClient(kernel);
    const agent = client.createAgent('product');
    const ctx = { user: 'test' };

    const s1 = kernel.route("advance", "product", agent, ctx);
    const s2 = kernel.route("advance", "product", agent, ctx);

    assert.deepStrictEqual(s1, s2);
});
