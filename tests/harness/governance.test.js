import test from 'node:test';
import assert from 'node:assert';
import { Invariants, enforceInvariant } from '../../src/kernel/governance/invariants.js';
import { ConstitutionalEnforcement } from '../../src/kernel/zenith/constitutionalEnforcement.js';
import { YieldOptimizationLoop } from '../../src/kernel/autonomic/optimizationLoop.js';

test('Governance - enforceInvariant throws on violation', () => {
    assert.throws(() => {
        enforceInvariant('IDENTITY', 1, false);
    }, /Invariant Violation \[IDENTITY-1\]: I am one intelligence, not many\./);
});

test('Governance - enforceInvariant passes on truthy condition', () => {
    assert.doesNotThrow(() => {
        enforceInvariant('IDENTITY', 1, true);
    });
});

test('Zenith - Evolution requires operator approval (Invariant 23)', () => {
    assert.throws(() => {
        ConstitutionalEnforcement.approveEvolution(false, true);
    }, /Invariant Violation \[GOVERNANCE-23\]/);
});

test('Zenith - Evolution requires passing simulation (Invariant 27)', () => {
    assert.throws(() => {
        ConstitutionalEnforcement.approveEvolution(true, false);
    }, /Invariant Violation \[GOVERNANCE-27\]/);
});

test('Autonomic - Optimization must remain bounded (Invariant 30)', () => {
    const loop = new YieldOptimizationLoop();

    // Simulate high drift
    assert.throws(() => {
        loop.optimize({ logic: 'test' }, { metrics: { drift: 10 } });
    }, /Invariant Violation \[AUTONOMIC-30\]/);

    // Simulate zero drift
    assert.doesNotThrow(() => {
        loop.optimize({ logic: 'test' }, { metrics: { drift: 0 } });
    });
});
