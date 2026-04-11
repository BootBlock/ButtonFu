import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import type { ApiResult, NoteConfig } from '../types';
import { createDefaultNote } from '../types';
import { createFakeVscodeHarness, loadWithPatchedVscode } from './helpers/fakeVscode';

function createFixtures() {
    const harness = createFakeVscodeHarness();

    const storePath = path.resolve(__dirname, '..', 'noteStore.js');
    const storeModule = loadWithPatchedVscode<{ NoteStore: new (context: any) => any }>(storePath, harness.vscode);
    const context = harness.createExtensionContext();
    const store = new storeModule.NoteStore(context);

    const apiPath = path.resolve(__dirname, '..', 'noteApiService.js');
    const api = loadWithPatchedVscode<typeof import('../noteApiService')>(apiPath, harness.vscode);

    return { harness, store, api };
}

// ---------------------------------------------------------------------------
// createNote
// ---------------------------------------------------------------------------

test('createNote succeeds with minimal required fields', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, { name: 'Shopping List', locality: 'Global' }) as ApiResult<NoteConfig>;

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'Shopping List');
    assert.equal(result.data?.locality, 'Global');
    assert.equal(result.data?.createdBy, 'Agent');
    assert.equal(result.data?.lastModifiedBy, 'Agent');
    assert.equal(result.data?.source, 'Agent');
    assert.ok(result.data?.id);
    assert.equal(store.getNode(result.data!.id)?.name, 'Shopping List');
});

test('createNote merges optional fields with defaults', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, {
        name: 'Release Notes',
        locality: 'Local',
        content: '## v2.0.0\n\nBig changes here.',
        format: 'Markdown',
        defaultAction: 'copy',
        category: 'Documentation'
    }) as ApiResult<NoteConfig>;

    assert.equal(result.success, true);
    assert.equal(result.data?.format, 'Markdown');
    assert.equal(result.data?.defaultAction, 'copy');
    assert.equal(result.data?.category, 'Documentation');
    assert.ok(result.data?.content.includes('Big changes'));
});

test('createNote rejects missing name', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, { locality: 'Global', content: 'hello' }) as ApiResult<NoteConfig>;

    assert.equal(result.success, false);
    assert.ok(result.errors?.some((e: string) => e.includes('name')));
});

test('createNote rejects invalid locality', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, { name: 'Test', locality: 'Mars' }) as ApiResult<NoteConfig>;

    assert.equal(result.success, false);
    assert.ok(result.errors?.some((e: string) => e.includes('locality')));
});

test('createNote rejects invalid format', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, { name: 'Test', locality: 'Global', format: 'LaTeX' }) as ApiResult<NoteConfig>;

    assert.equal(result.success, false);
    assert.ok(result.errors?.some((e: string) => e.includes('format')));
});

test('createNote rejects invalid defaultAction', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, { name: 'Test', locality: 'Global', defaultAction: 'yeet' }) as ApiResult<NoteConfig>;

    assert.equal(result.success, false);
    assert.ok(result.errors?.some((e: string) => e.includes('defaultAction')));
});

test('createNote rejects null input', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, null) as ApiResult<NoteConfig>;

    assert.equal(result.success, false);
});

test('createNote batch creates multiple notes', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, [
        { name: 'Note Alpha', locality: 'Global', content: 'aaa' },
        { name: 'Note Bravo', locality: 'Local', content: 'bbb' }
    ]);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 2);
    assert.equal(result[0].success, true);
    assert.equal(result[1].success, true);
    assert.equal(store.getAllNodes().length, 2);
});

test('createNote batch returns per-item errors', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, [
        { name: 'Good', locality: 'Global' },
        { locality: 'Global' } // missing name
    ]);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].success, true);
    assert.equal(result[1].success, false);
    assert.equal(store.getAllNodes().length, 1);
});

test('createNote strips openEditor from persisted data', async () => {
    const { store, api } = createFixtures();

    const result = await api.createNote(store, {
        name: 'Fancy',
        locality: 'Global',
        openEditor: true
    }) as ApiResult<NoteConfig>;

    assert.equal(result.success, true);
    const saved = store.getNode(result.data!.id);
    assert.equal((saved as any).openEditor, undefined);
});

// ---------------------------------------------------------------------------
// getNote
// ---------------------------------------------------------------------------

test('getNote returns existing note', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Found It', locality: 'Global' }) as ApiResult<NoteConfig>;
    assert.equal(created.success, true);

    const result = api.getNote(store, created.data!.id);

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'Found It');
});

test('getNote accepts object with id field', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Obj', locality: 'Global' }) as ApiResult<NoteConfig>;

    const result = api.getNote(store, { id: created.data!.id });

    assert.equal(result.success, true);
});

test('getNote returns error for missing id', () => {
    const { store, api } = createFixtures();

    const result = api.getNote(store, undefined);

    assert.equal(result.success, false);
});

test('getNote returns error for unknown id', () => {
    const { store, api } = createFixtures();

    const result = api.getNote(store, 'nonexistent-uuid');

    assert.equal(result.success, false);
});

// ---------------------------------------------------------------------------
// listNotes
// ---------------------------------------------------------------------------

test('listNotes returns all notes', async () => {
    const { store, api } = createFixtures();
    await api.createNote(store, { name: 'G1', locality: 'Global' }) as ApiResult<NoteConfig>;
    await api.createNote(store, { name: 'L1', locality: 'Local' }) as ApiResult<NoteConfig>;

    const result = api.listNotes(store);

    assert.equal(result.success, true);
    assert.equal(result.data?.length, 2);
});

test('listNotes filters by locality', async () => {
    const { store, api } = createFixtures();
    await api.createNote(store, { name: 'G1', locality: 'Global' }) as ApiResult<NoteConfig>;
    await api.createNote(store, { name: 'L1', locality: 'Local' }) as ApiResult<NoteConfig>;

    const globalOnly = api.listNotes(store, { locality: 'Global' });
    assert.equal(globalOnly.data?.length, 1);
    assert.equal(globalOnly.data?.[0].locality, 'Global');

    const localOnly = api.listNotes(store, { locality: 'Local' });
    assert.equal(localOnly.data?.length, 1);
    assert.equal(localOnly.data?.[0].locality, 'Local');
});

// ---------------------------------------------------------------------------
// updateNote
// ---------------------------------------------------------------------------

test('updateNote patches existing note', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Original', locality: 'Global', content: 'old' }) as ApiResult<NoteConfig>;

    const result = await api.updateNote(store, { id: created.data!.id, name: 'Renamed', content: 'new' });

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'Renamed');
    assert.equal(result.data?.content, 'new');
    assert.equal(result.data?.locality, 'Global');
    assert.equal(result.data?.createdBy, 'Agent');
    assert.equal(result.data?.lastModifiedBy, 'Agent');
    assert.equal(result.data?.source, 'Agent');
});

test('updateNote rejects missing id', async () => {
    const { store, api } = createFixtures();

    const result = await api.updateNote(store, { name: 'Orphan' });

    assert.equal(result.success, false);
});

test('updateNote rejects nonexistent note', async () => {
    const { store, api } = createFixtures();

    const result = await api.updateNote(store, { id: 'ghost-uuid', name: 'Phantom' });

    assert.equal(result.success, false);
});

test('updateNote rejects invalid format', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Formatted', locality: 'Global' }) as ApiResult<NoteConfig>;

    const result = await api.updateNote(store, { id: created.data!.id, format: 'RTF' });

    assert.equal(result.success, false);
});

test('updateNote upgrades a user-created note to AgentAndUser', async () => {
    const { store, api } = createFixtures();
    const note = createDefaultNote('Global');
    note.name = 'User-authored note';
    note.content = 'Created by the user flow';
    const created = await store.saveNode(note);

    const result = await api.updateNote(store, { id: created.id, content: 'Updated by the agent API' });

    assert.equal(result.success, true);
    assert.equal(result.data?.createdBy, 'User');
    assert.equal(result.data?.lastModifiedBy, 'Agent');
    assert.equal(result.data?.source, 'AgentAndUser');
});

// ---------------------------------------------------------------------------
// deleteNote
// ---------------------------------------------------------------------------

test('deleteNote removes existing note', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Doomed', locality: 'Global' }) as ApiResult<NoteConfig>;

    const result = await api.deleteNote(store, created.data!.id) as ApiResult<{ id: string }>;

    assert.equal(result.success, true);
    assert.equal(store.getNode(created.data!.id), undefined);
});

test('deleteNote accepts object with id', async () => {
    const { store, api } = createFixtures();
    const created = await api.createNote(store, { name: 'Also Doomed', locality: 'Local' }) as ApiResult<NoteConfig>;

    const result = await api.deleteNote(store, { id: created.data!.id }) as ApiResult<{ id: string }>;

    assert.equal(result.success, true);
});

test('deleteNote batch removes multiple', async () => {
    const { store, api } = createFixtures();
    const a = await api.createNote(store, { name: 'A', locality: 'Global' }) as ApiResult<NoteConfig>;
    const b = await api.createNote(store, { name: 'B', locality: 'Global' }) as ApiResult<NoteConfig>;

    const result = await api.deleteNote(store, [a.data!.id, b.data!.id]);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 2);
    assert.equal(result[0].success, true);
    assert.equal(result[1].success, true);
    assert.equal(store.getAllNodes().length, 0);
});

test('deleteNote returns error for unknown id', async () => {
    const { store, api } = createFixtures();

    const result = await api.deleteNote(store, 'phantom-id') as ApiResult<{ id: string }>;

    assert.equal(result.success, false);
});
