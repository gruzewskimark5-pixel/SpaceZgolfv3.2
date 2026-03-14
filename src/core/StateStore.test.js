import { test, describe } from 'node:test';
import assert from 'node:assert';
import { StateStore } from './StateStore.js';
import { EventBus } from './EventBus.js';

describe('StateStore', () => {
  test('should have initial state', () => {
    const state = StateStore.get();
    assert.strictEqual(typeof state, 'object');
    assert.ok(Array.isArray(state.leaderboard));
    assert.strictEqual(state.status, 'initializing');
  });

  test('should update state with set()', () => {
    StateStore.set({ status: 'ready' });
    assert.strictEqual(StateStore.get().status, 'ready');
  });

  test('should emit state:updated event when state is set', () => {
    return new Promise((resolve) => {
      const listener = (data) => {
        if (data.status === 'event-test') {
          assert.strictEqual(data.status, 'event-test');
          EventBus.off('state:updated', listener);
          resolve();
        }
      };
      EventBus.on('state:updated', listener);
      StateStore.set({ status: 'event-test' });
    });
  });

  test('state should be frozen', () => {
    const state = StateStore.get();
    assert.ok(Object.isFrozen(state));
    assert.throws(() => {
      state.status = 'modified';
    }, TypeError);
  });

  test('should merge patches instead of replacing state', () => {
    StateStore.set({ lastPulse: '2023-01-01' });
    StateStore.set({ status: 'active' });
    const state = StateStore.get();
    assert.strictEqual(state.lastPulse, '2023-01-01');
    assert.strictEqual(state.status, 'active');
  });
});
