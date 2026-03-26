# ButtonFu — Copilot Instructions

## Project Overview

ButtonFu is a Visual Studio Code extension that provides customizable, clickable buttons in the VS Code sidebar. Users can create buttons that execute terminal commands, PowerShell scripts, VS Code command palette actions, project tasks, and GitHub Copilot prompts — all with a single click.

## Repository Structure

```
ButtonFu/
├── ButtonFu.sln                    # Solution file for Visual Studio
├── copilot-instructions.md         # This file
├── .vscode/
│   ├── launch.json                 # F5 debug configurations (Extension Host)
│   └── tasks.json                  # Build tasks (compile, watch, package)
├── buttonfu-extension/             # VS Code extension source
│   ├── package.json                # Extension manifest, commands, contributes
│   ├── tsconfig.json               # TypeScript configuration
│   ├── esbuild.js                  # Build script with version injection
│   ├── buttonfu-extension.esproj   # Visual Studio JS project
│   ├── resources/
│   │   └── icon.svg                # Activity bar icon
│   └── src/
│       ├── extension.ts            # Extension entry point, command registration
│       ├── types.ts                # Shared types: ButtonConfig, ButtonType, icon list
│       ├── buttonStore.ts          # Persistence: global settings + workspace state
│       ├── buttonExecutor.ts       # Execution logic for all 5 button types
│       ├── buttonTreeProvider.ts   # Sidebar tree view provider with categories
│       ├── editorPanel.ts          # Webview-based button editor UI
│       └── buildInfo.ts            # Build metadata injected by esbuild
└── Installer/
    ├── Build-Installer.ps1         # PowerShell build/package script
    ├── ButtonFu.iss                # Inno Setup installer script
    ├── ButtonFu.Installer.proj      # MSBuild project for Solution Explorer
    ├── License.rtf                 # MIT license for installer wizard
    ├── Deployment.md               # Build & deployment guide
    ├── Version.Base.txt            # Major.Minor version
    ├── Version.Build.txt           # Auto-incremented build number
    └── Version.Moniker.txt         # Pre-release suffix (empty for release)
```

## Architecture

### Data Model

Each button has these properties:
- **id** — unique identifier (generated)
- **name** — display name
- **locality** — `Global` (user settings) or `Local` (workspace state)
- **description** — tooltip text
- **type** — one of: `TerminalCommand`, `PowerShellCommand`, `PaletteAction`, `TaskExecution`, `CopilotCommand`
- **executionText** — the command/script/prompt to execute
- **category** — grouping label for the sidebar tree
- **icon** — codicon name (e.g. `play`, `terminal`, `rocket`)
- **colour** — hex colour string
- **copilotModel** — for CopilotCommand: model ID (e.g. `claude-opus-4.6`)
- **copilotMode** — for CopilotCommand: `agent`, `ask`, `edit`, or `plan`
- **copilotAttachFiles** — for CopilotCommand: array of file paths to attach

### Storage

- **Global buttons** are stored in VS Code user settings under `buttonfu.globalButtons` (available in all workspaces)
- **Local buttons** are stored in workspace state via `context.workspaceState` (specific to the current workspace/project)

### Key Components

| File | Responsibility |
|------|----------------|
| `extension.ts` | Activation, command registration, wiring up store/executor/tree |
| `types.ts` | TypeScript interfaces, enums, icon catalogue, default factories |
| `buttonStore.ts` | CRUD operations for buttons, dual storage (settings + workspace state) |
| `buttonExecutor.ts` | Executes buttons by type — terminal, PowerShell, commands, tasks, Copilot |
| `buttonTreeProvider.ts` | TreeDataProvider for the sidebar, groups buttons by category |
| `editorPanel.ts` | Webview panel for the button editor with icon picker, autocomplete, colour picker |

### Copilot Integration

The `CopilotCommand` button type follows proven patterns for Copilot Chat integration:
1. Focus the Copilot Chat panel
2. Start a new chat session
3. Set the mode (agent/ask/edit/plan) via `workbench.action.chat.setMode.*` commands
4. Set the model via `workbench.action.chat.changeModel` with vendor/id/family from `vscode.lm.selectChatModels()`
5. Attach files via `workbench.action.chat.attachFile`
6. Paste the prompt text and submit via `workbench.action.chat.submit`

Multiple fallback command variants are tried for each step to ensure compatibility across VS Code versions.

## Build & Debug

- **F5** launches the Extension Development Host with the extension loaded
- `npm run compile` — one-shot build
- `npm run watch` — watch mode for development
- `npm run vsce-package` — create VSIX for distribution
- `Installer\Build-Installer.ps1` — full installer build (compile + package + Inno Setup)

## Coding Conventions

- TypeScript strict mode enabled
- esbuild for bundling (CJS format, external: vscode)
- VS Code Webview API for the editor UI (CSP with nonce)
- Codicons for all iconography
- VS Code theme CSS variables for consistent styling
- No external runtime dependencies — the extension is self-contained

## Note to Copilot and AI changes

ALWAYS:
- Whenever you are finished fixing code or creating new features, always update the CHANGELOG.md and README.md files with a clear, concise summary of the changes and new features, following the existing format and style.
- Always put new changes in the most recent version section at the top of CHANGELOG, assume that the top section will be the next release version, and update the date to the current date if it is not already set.