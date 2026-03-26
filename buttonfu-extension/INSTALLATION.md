# ButtonFu — Installation Guide

## Prerequisites

- **Visual Studio Code** 1.85.0 or later
- **Node.js** 18+ and npm (for development builds)

## Installation Methods

### Method 1: VSIX Package

1. Obtain the `buttonfu-{version}.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
4. Select the `.vsix` file
5. Reload VS Code when prompted

### Method 2: Development Install

```bash
git clone <repository-url>
cd ButtonFu/buttonfu-extension
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host with ButtonFu loaded.

## Getting Started

1. After installation, you'll see the **ButtonFu** icon in the Activity Bar
2. Click it to open the Buttons sidebar
3. Click the **gear** (⚙) icon to open the Button Editor
4. Create your first button:
   - Give it a name
   - Choose a type (Terminal Command, PowerShell, etc.)
   - Enter the command to execute
   - Pick an icon and colour
   - Save

## Button Types

| Type | Description | Example |
|------|-------------|---------|
| Terminal Command | Runs in the default terminal | `npm run build` |
| PowerShell Command | Runs in a PowerShell terminal | `Get-Process \| Sort-Object CPU` |
| Command Palette Action | Executes a VS Code command | `workbench.action.toggleSidebarVisibility` |
| Task Execution | Runs a task from tasks.json | `build` |
| Copilot Command | Sends a prompt to Copilot Chat | `Explain this code` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ButtonFu icon not visible | Check Extensions view → ensure ButtonFu is enabled |
| Buttons not appearing | Click the refresh icon in the sidebar title |
| Copilot commands fail | Ensure GitHub Copilot Chat extension is installed and active |
| Task not found | Verify the task name matches exactly what's in `tasks.json` |
