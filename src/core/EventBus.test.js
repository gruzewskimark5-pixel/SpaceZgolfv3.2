import { test, describe } from 'node:test';
import assert from 'node:assert';
import { EventBus } from './EventBus.js';

describe('EventBus', () => {
  test('should register and trigger listeners', () => {
    let received = null;
    EventBus.on('test-event', (data) => {
      received = data;
    });
    EventBus.emit('test-event', { foo: 'bar' });
    assert.deepStrictEqual(received, { foo: 'bar' });
  });

  test('should unregister listeners with off()', () => {
    let count = 0;
    const listener = () => count++;
    EventBus.on('inc', listener);
    EventBus.emit('inc');
    EventBus.off('inc', listener);
    EventBus.emit('inc');
    assert.strictEqual(count, 1);
  });

  test('should unregister listeners with returned unsubscribe function', () => {
    let count = 0;
    const unsubscribe = EventBus.on('inc-unsub', () => count++);
    EventBus.emit('inc-unsub');
    unsubscribe();
    EventBus.emit('inc-unsub');
    assert.strictEqual(count, 1);
  });

  test('should handle multiple listeners', () => {
    let count = 0;
    EventBus.on('multi', () => count++);
    EventBus.on('multi', () => count++);
    EventBus.emit('multi');
    assert.strictEqual(count, 2);
  });

  test('should handle errors in listeners gracefully', () => {
    let successCount = 0;
    EventBus.on('error-test', () => { throw new Error('Boom'); });
    EventBus.on('error-test', () => successCount++);

    // Should not throw
    EventBus.emit('error-test');
    assert.strictEqual(successCount, 1);
  });
});
