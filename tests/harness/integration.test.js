import test from 'node:test';
import assert from 'node:assert';
import { Kernel } from '../../src/kernel/kernel.js';
import { AgentClient } from '../../src/sdk/client.js';
import { ZexzAdapter } from '../../src/integration/zexzAdapter.js';
import { validateIntent } from '../../src/kernel/middleware/validateIntent.js';

test('Surface Integration - zexz routes through kernel to output', async () => {
    const kernel = new Kernel({});
    const client = new AgentClient(kernel);
    const agent = client.createAgent('product');

    const userState = { progress: 50 };
    const rawIntent = "start_lesson";

    // 1. Adapter normalizes input
    const kernelInput = ZexzAdapter.toKernel(rawIntent, userState);
    assert.strictEqual(kernelInput.surface, "product");

    // 2. Middleware validates
    validateIntent(kernelInput.intent);

    // 3. Kernel routes
    const output = kernel.route(kernelInput.intent, kernelInput.surface, agent, kernelInput.context);

    // 4. Adapter normalizes output
    const finalOutput = ZexzAdapter.fromKernel(output);
    assert.ok(finalOutput.state);
    assert.strictEqual(finalOutput.next, "default_action");
});
