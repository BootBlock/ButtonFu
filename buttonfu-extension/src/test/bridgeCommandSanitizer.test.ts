import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeBridgeCommandParam } from '../bridgeCommandSanitizer';

test('sanitizeBridgeCommandParam removes UI side-effect flags from object params', () => {
    const input = {
        name: 'Smoke Button',
        locality: 'Global',
        openEditor: true,
        openEditors: true,
        category: 'SecurityTest'
    };

    const result = sanitizeBridgeCommandParam(input) as Record<string, unknown>;

    assert.equal(result.openEditor, undefined);
    assert.equal(result.openEditors, undefined);
    assert.equal(result.name, 'Smoke Button');
    assert.equal(result.category, 'SecurityTest');
    assert.equal((input as Record<string, unknown>).openEditor, true);
    assert.equal((input as Record<string, unknown>).openEditors, true);
});

test('sanitizeBridgeCommandParam leaves arrays and primitives unchanged', () => {
    const primitive = 'button-id';
    const array = [{ openEditor: true }];

    assert.equal(sanitizeBridgeCommandParam(primitive), primitive);
    assert.equal(sanitizeBridgeCommandParam(array), array);
});