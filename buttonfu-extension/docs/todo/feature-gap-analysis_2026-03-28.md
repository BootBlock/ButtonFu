# ButtonFu Feature Gap Analysis - 2026-03-28

## Executive Summary

ButtonFu already covers the core launcher workflow well. It can run terminal commands, VS Code commands, tasks, and Copilot prompts; supports global and workspace scopes; has categories, icons, colours, keyboard shortcuts, user/system tokens, warn-before-run, and multi-terminal execution.

The main product gap is that ButtonFu still behaves like a strong personal launcher, not yet like a reusable automation layer for an individual power user or a team. The current implementation makes it easy to create and run a button, but much harder to:

- share button sets across machines or repositories
- manage a large library of buttons efficiently
- compose multi-step workflows
- collect richer runtime input
- understand what happened after a button ran

If the goal is to add features that provide genuine user value rather than surface novelty, the highest-leverage areas are:

1. portable and shareable button packs
2. search, quick-run, favourites, and large-library navigation
3. multi-step workflow buttons
4. richer input types and secret handling
5. execution visibility, status, and history

## Scope and Evidence Base

This analysis is grounded in the current extension code and shipped documentation.

Reviewed areas:

- `buttonfu-extension/package.json`
- `buttonfu-extension/README.md`
- `CHANGELOG.md`
- `buttonfu-extension/src/extension.ts`
- `buttonfu-extension/src/types.ts`
- `buttonfu-extension/src/buttonStore.ts`
- `buttonfu-extension/src/buttonExecutor.ts`
- `buttonfu-extension/src/buttonPanelProvider.ts`
- `buttonfu-extension/src/editorPanel.ts`
- `buttonfu-extension/src/tokenInputPanel.ts`
- `buttonfu-extension/resources/editor.js`

Current evidence that shapes the gap analysis:

- `src/types.ts` supports only four executable button types: `TerminalCommand`, `PaletteAction`, `TaskExecution`, and `CopilotCommand`.
- `src/buttonStore.ts` stores global buttons in the `buttonfu.globalButtons` setting and local buttons in `workspaceState`, with no repo-backed storage, import/export format, or pack abstraction.
- `src/extension.ts` exposes only the core lifecycle commands: open editor, execute, add, edit, delete, refresh, plus dynamic per-button run commands.
- `src/buttonPanelProvider.ts` groups buttons only by locality and category; there is no search, favourite, recent, filter, or visibility system.
- `resources/editor.js` supports CRUD, duplicate, reorder, token editing, and option toggles, but not bulk edit, import/export, templates, or pack management.
- `src/types.ts` limits user token input types to `String`, `MultiLineString`, `Integer`, and `Boolean`.
- `src/buttonExecutor.ts` executes actions but does not persist structured execution history or expose a first-class output/result view.
- `src/buttonExecutor.ts` attaches Copilot files from an explicit list only; there is no pattern-based or context-derived attachment model.
- Multiple host paths still assume the first workspace folder, which limits multi-root value.

## What ButtonFu Already Does Well

ButtonFu is already strong in these areas:

- One-click execution of the four most useful VS Code automation targets: shell, command palette, tasks, and Copilot.
- Lightweight personal customization: icon, colour, category, locality, confirmation, shortcut.
- Token-driven parameterization with a reasonably mature questionnaire flow.
- Multi-terminal orchestration for shell commands.
- A full-screen editor that is good enough for day-to-day authoring.

That matters because the next features should extend those strengths rather than pull the product into unrelated territory.

## Where The Current Product Tops Out

The current design starts to strain in five situations:

### 1. When a user wants to reuse or share buttons

Workspace buttons are stored in `workspaceState`, which makes them easy to keep local but hard to review, version, back up, or share with a team.

### 2. When a user has more than a small button library

The sidebar currently scales through categories and columns only. That is fine for a dozen buttons, but much weaker once the library becomes broad enough that search, favourites, or contextual filtering would matter.

### 3. When a workflow spans more than one action

Each button maps to one primary action type. Multi-terminal support helps only within terminal execution. Real workflows often combine save, task, terminal, prompt, and follow-up actions.

### 4. When a button needs richer runtime input

Primitive input types are present, but many practical workflows need choices, file picks, folder picks, secret values, remembered defaults, or data pulled from the selected files.

### 5. When the user needs confidence in outcomes

ButtonFu triggers actions well, but it provides little durable insight into whether a run succeeded, failed, produced useful output, or should be repeated.

## Prioritized Opportunity List

The table below ranks gaps by likely user value, fit with ButtonFu's current architecture, and practical implementation leverage.

| Rank | Feature Area | User Value | Build Cost | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Portable button packs and import/export | Very high | Medium | Build next |
| 2 | Searchable quick-run, sidebar filtering, favourites, recents | Very high | Medium | Build next |
| 3 | Workflow buttons for multi-step automation | Very high | High | Build soon |
| 4 | Rich token input types and secret storage | High | Medium | Build soon |
| 5 | Execution status, history, and result visibility | High | Medium-high | Build soon |
| 6 | Visibility and enablement rules | High | Medium | Build soon |
| 7 | Terminal execution context controls | High | Medium | Build soon |
| 8 | Copilot attachment patterns and response destinations | High | Medium-high | Build after core workflow features |
| 9 | Templates, starter packs, and reusable presets | Medium-high | Medium | Build after pack support |
| 10 | Multi-root workspace awareness | Medium-high | Medium-high | Build progressively |
| 11 | Extra launch surfaces beyond the sidebar | Medium | Medium | Useful follow-on |
| 12 | Bulk management and archive flows | Medium | Medium | Important after adoption scales |

## Detailed Gap Analysis

## 1. Portable Button Packs And Import/Export

### Why this is a genuine gap

ButtonFu is already useful for personal automation, but its current storage model blocks one of the highest-value outcomes: reusable button libraries.

Today:

- global buttons live in user settings
- workspace buttons live in `workspaceState`
- neither model is a clean team-sharing story

That means users cannot easily:

- commit project-specific buttons to source control
- review button changes in pull requests
- move a curated library between machines
- publish starter packs for a language or workflow

### Recommended feature shape

Add a formal pack model with three capabilities:

- import/export JSON
- repo-backed pack files such as `.buttonfu/buttons.json` or `.vscode/buttonfu.json`
- merge modes: add only, update matching IDs, replace existing set

For team safety, loading repo-backed buttons should include a trust prompt because shell and Copilot buttons can execute meaningful actions.

### Why it should rank first

This is the clearest leap from "nice launcher" to "automation asset". It improves onboarding, backup, collaboration, migration, and long-term retention.

### Primary code touchpoints

- `src/buttonStore.ts`
- `src/extension.ts`
- `src/editorPanel.ts`
- `resources/editor.js`
- `package.json` command contributions

## 2. Searchable Quick-Run, Sidebar Filtering, Favourites, And Recents

### Why this is a genuine gap

The current sidebar renders buttons by locality and category only. That is simple, but it does not scale gracefully.

Users with larger libraries will want to:

- find a button by name instantly
- pin a small favourite set
- rerun recent buttons quickly
- use ButtonFu without opening the sidebar first

### Recommended feature shape

Start with a single discovery layer rather than multiple disconnected features:

- `ButtonFu: Run Button...` command powered by `QuickPick`
- sidebar search/filter box
- optional `Favourites` and `Recent` sections

This is likely more valuable than nested menu structures as a first scale feature. Search and quick-run reduce friction for both mouse-first and keyboard-first users.

### Why it should rank second

It directly improves everyday usability without requiring major data model changes.

### Primary code touchpoints

- `src/extension.ts`
- `src/buttonPanelProvider.ts`
- `src/editorPanel.ts`
- `resources/editor.js`

## 3. Workflow Buttons For Multi-Step Automation

### Why this is a genuine gap

Real developer workflows are rarely one action long. Common examples:

- save all files, run tests, then open a Copilot prompt with the failing output
- run a task, open a URL, then copy a deployment link
- run one terminal command, then execute a VS Code command

Current ButtonFu only supports one primary action type per button. Multi-terminal execution is useful but limited to shell commands.

### Recommended feature shape

Add a new workflow model made of ordered steps. Reuse the existing action handlers instead of inventing a separate runtime.

Good first version:

- linear sequence only
- stop on failure toggle
- per-step type: terminal, command, task, Copilot, open URL/file, notification
- optional per-step name for readability

Good second version:

- success/failure branches
- captured outputs as tokens for later steps

### Why it should rank this high

This turns ButtonFu from a launcher into a small automation orchestrator while still staying inside its natural product boundary.

### Primary code touchpoints

- `src/types.ts`
- `src/buttonExecutor.ts`
- `src/tokenInputPanel.ts`
- `resources/editor.js`

## 4. Rich Token Input Types And Secret Storage

### Why this is a genuine gap

The existing token system is good, but many practical workflows need inputs beyond free text, integers, booleans, and multiline text.

High-value missing token/input types:

- single-select choice
- multi-select choice
- file picker
- folder picker
- workspace folder picker
- secret or password
- remembered last value

Examples where this matters:

- pick environment: `dev`, `qa`, `prod`
- choose which service to deploy
- select a file or folder target without typing a path
- enter an API key without storing it in plain text

### Recommended feature shape

Extend `TokenDataType` and use `ExtensionContext.secrets` for secret-backed values rather than storing them in button config.

### Why it should rank above templates

It removes friction from workflows users already want to run today. It is a stronger value multiplier than adding more ways to duplicate configurations.

### Primary code touchpoints

- `src/types.ts`
- `src/tokenInputPanel.ts`
- `src/extension.ts`
- `resources/editor.js`

## 5. Execution Status, History, And Result Visibility

### Why this is a genuine gap

Today ButtonFu triggers actions but does not become the place where the user understands what happened.

Practical missing capabilities:

- visible running state for long operations
- last-run success/failure marker
- duration and timestamp
- per-button history
- easy jump to terminal/output/result location

Without this, ButtonFu is good at starting actions but weak at building trust.

### Recommended feature shape

Stage 1:

- ephemeral running indicator in the sidebar/editor
- last result metadata per button
- lightweight run history list in the editor

Stage 2:

- optional output capture for supported execution modes
- output panel or dedicated result viewer

### Caveat

Streaming full terminal output is more complex than logging metadata because terminal execution currently uses the integrated terminal rather than a process owned entirely by the extension. That should not block Stage 1.

### Primary code touchpoints

- `src/buttonExecutor.ts`
- `src/buttonPanelProvider.ts`
- `src/buttonStore.ts` or a dedicated history store
- `src/editorPanel.ts`
- `resources/editor.js`

## 6. Visibility And Enablement Rules

### Why this is a genuine gap

Every button currently appears whenever its locality is active. That creates clutter and increases the chance of running the wrong thing.

High-value rule examples:

- show only for certain file extensions or languages
- show only when text is selected
- show only in a matching workspace or folder
- disable when Copilot Chat is unavailable
- show only on a given git branch pattern

### Recommended feature shape

Use simple, safe rules rather than a full scripting language. The product value is contextual relevance, not user-authored logic engines.

Support two modes:

- hidden when rule fails
- visible but disabled with a reason tooltip

### Why it should rank highly

This is one of the cleanest ways to keep the UI useful as the library grows.

### Primary code touchpoints

- `src/types.ts`
- `src/buttonPanelProvider.ts`
- `src/extension.ts`
- `src/buttonExecutor.ts`

## 7. Terminal Execution Context Controls

### Why this is a genuine gap

Terminal buttons are powerful, but the runtime model is still minimal. Users frequently need explicit execution context rather than embedding boilerplate into every command.

Valuable missing controls:

- working directory
- terminal profile or shell selection
- environment variables
- terminal reuse versus always create new
- focus or preserve-focus behaviour

These settings reduce repeated `cd` and environment setup commands, make buttons more portable, and better align ButtonFu with how tasks are usually configured.

### Recommended feature shape

Add execution context fields at the button level, with per-tab overrides only if necessary later.

### Why it should be prioritized

This is a practical productivity feature that improves existing workflows without changing the core mental model.

### Primary code touchpoints

- `src/types.ts`
- `src/buttonExecutor.ts`
- `resources/editor.js`

## 8. Copilot Attachment Patterns And Response Destinations

### Why this is a genuine gap

Copilot buttons are already one of ButtonFu's differentiators, but the current shape is static:

- explicit file paths only
- always starts with a fresh chat flow
- no first-class response destination

Users will want more reusable prompt automation, for example:

- attach all changed files
- attach all tests in a folder
- attach files matching a glob
- send result to a new markdown note or scratch file
- choose whether to reuse current chat or start fresh

### Recommended feature shape

Best near-term additions:

- glob-based attachment patterns
- attach active selection set where the invocation surface supports it
- output destination choices: chat only, clipboard, new untitled file
- new chat versus current chat mode

### Caveat

This area is constrained by VS Code and Copilot APIs. The extension should avoid over-investing in fragile UI automation if a stable API is unavailable.

### Primary code touchpoints

- `src/types.ts`
- `src/buttonExecutor.ts`
- `resources/editor.js`

## 9. Templates, Starter Packs, And Reusable Presets

### Why this is a genuine gap

The editor supports duplication, which is useful, but duplication is not the same as reuse.

Valuable additions:

- user-defined templates
- built-in starter packs for common stacks
- "new from template" flow
- preset execution profiles for common button shapes

### Why this is not ranked higher

Templates become much more valuable once import/export or repo-backed packs exist. Without that foundation, template value is narrower and mostly local.

### Primary code touchpoints

- `src/types.ts`
- `src/buttonStore.ts`
- `resources/editor.js`

## 10. Multi-Root Workspace Awareness

### Why this is a genuine gap

The current code often uses the first workspace folder. That is workable for a single-folder project, but it weakens the extension in monorepos and multi-root workspaces.

High-value improvements:

- choose target workspace folder per button
- workspace-folder token input type
- folder-aware relative file attachment
- folder-scoped visibility rules

### Why this matters

ButtonFu is unusually well-suited to polyrepo or monorepo developer workflows. Supporting multi-root well would strengthen that positioning.

### Primary code touchpoints

- `src/buttonExecutor.ts`
- `src/buttonPanelProvider.ts`
- `src/editorPanel.ts`
- `src/types.ts`

## 11. Extra Launch Surfaces Beyond The Sidebar

### Why this is a genuine gap

The sidebar is ButtonFu's main home, but some workflows benefit from invoking buttons in-place.

High-value surfaces:

- Explorer context menu: run a button against selected files
- editor title or editor context menu for file-centric actions
- status bar area for pinned buttons
- command palette quick-run, if not already delivered as part of item 2

### Recommendation

Do not expand into every possible VS Code surface. Choose surfaces that naturally provide context to the button run.

### Primary code touchpoints

- `package.json`
- `src/extension.ts`
- `src/buttonExecutor.ts`

## 12. Bulk Management And Archive Flows

### Why this is a genuine gap

Once button libraries get larger, single-item editing becomes slow.

Practical missing flows:

- multi-select delete or move
- bulk recategorize
- bulk locality change
- archive instead of delete
- export selected subset

### Why this is lower priority

This matters mostly after adoption scale has already been achieved. It should follow search, packs, and visibility features.

### Primary code touchpoints

- `resources/editor.js`
- `src/editorPanel.ts`
- `src/buttonStore.ts`

## Suggested Roadmap

## Phase 1: Improve Everyday Value

Build these first:

1. portable button packs plus import/export
2. quick-run plus search/filter/favourites
3. rich token input types plus secret storage
4. visibility and enablement rules
5. terminal execution context controls

Why this phase first:

- it improves daily usage immediately
- it strengthens ButtonFu's core launcher identity
- it avoids large runtime complexity too early

## Phase 2: Move From Launcher To Workflow Tool

Build these next:

1. workflow buttons with ordered steps
2. run status and history
3. Copilot attachment patterns and response destinations
4. basic output/result surfaces where the API allows it

Why this phase second:

- it compounds the value of the existing action types
- it makes ButtonFu more differentiated without turning it into a general scripting platform

## Phase 3: Scale, Polish, And Broaden Reach

Build these after the foundations are in place:

1. templates and starter packs
2. multi-root awareness
3. extra invocation surfaces
4. bulk management and archive flows

## Features To Explicitly Defer

These ideas may sound attractive, but they are not the best next investments for genuine user value.

### 1. Full scripting language or complex flow DSL

Basic sequencing and rules are valuable. A full mini-language is likely to add complexity faster than value.

### 2. Cron-style scheduling or background automation

This pushes ButtonFu toward task runner territory and creates platform, lifecycle, and trust complexity. It is not the strongest fit for a sidebar-first extension.

### 3. Cloud account sync or hosted button marketplace

There is not enough evidence yet that ButtonFu needs a service model. Repo-backed packs and import/export should come first.

### 4. Deeply nested sidebar trees as the first scaling feature

Search, quick-run, favourites, and visibility rules should come before a heavy hierarchy system. Hierarchy may still be useful later, but it is not the best first answer to scale.

## Final Recommendation

If ButtonFu wants the next set of features to provide real user value, the extension should prioritize becoming:

- portable
- searchable
- composable
- context-aware
- trustworthy after execution

In practical terms, the best next move is not to add more action types immediately. It is to make the existing action types reusable, discoverable, and workflow-capable.

The most defensible near-term sequence is:

1. repo-backed packs plus import/export
2. quick-run plus search and favourites
3. rich token inputs and visibility rules
4. workflow buttons
5. execution status and history

That path keeps ButtonFu focused on its strongest identity: fast, user-authored developer automation inside VS Code.