# Agent Deployment Guide

This guide is written for an AI coding agent that is helping a user install Khala Task Marker after cloning this repository.

## Goal

Build the Obsidian plugin and install it into the user's Obsidian vault so it can be enabled from Obsidian's Community plugins settings.

## Required Inputs

Ask the user for their Obsidian vault path if it is not already known.

Examples:

```text
Windows: D:\Drive-Work\Obsidian Vault
macOS: /Users/name/Documents/Obsidian Vault
Linux: /home/name/Documents/Obsidian Vault
```

## Repository Setup

From the repository root:

```bash
npm install
npm test
npm run build
```

Expected result:

```text
Tests pass.
main.js is generated in the repository root.
```

## Install Into Vault

Create this directory inside the user's vault:

```text
<vault>/.obsidian/plugins/khala-task-marker/
```

Copy these files from the repository root into that directory:

```text
manifest.json
main.js
styles.css
```

Do not copy `node_modules`.

## Optional: Enable Plugin In Vault Config

If the user wants the agent to enable the plugin automatically, update:

```text
<vault>/.obsidian/community-plugins.json
```

Make sure the JSON array contains:

```json
"khala-task-marker"
```

If the file does not exist, create it with:

```json
[
  "khala-task-marker"
]
```

Preserve any existing plugin ids in the array.

## Windows PowerShell Example

Use this when the repository path and vault path are known:

```powershell
$repo = "D:\GitHub\obsidian\khala-task-marker"
$vault = "D:\Drive-Work\Obsidian Vault"
$pluginDir = Join-Path $vault ".obsidian\plugins\khala-task-marker"

Set-Location $repo
npm install
npm test
npm run build

New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
Copy-Item -Force -LiteralPath `
  (Join-Path $repo "manifest.json"), `
  (Join-Path $repo "main.js"), `
  (Join-Path $repo "styles.css") `
  -Destination $pluginDir
```

To enable the plugin from PowerShell:

```powershell
$communityPluginsPath = Join-Path $vault ".obsidian\community-plugins.json"

if (Test-Path -LiteralPath $communityPluginsPath) {
  $plugins = Get-Content -LiteralPath $communityPluginsPath -Raw | ConvertFrom-Json
  if ($null -eq $plugins) {
    $plugins = @()
  }
  $plugins = @($plugins)
} else {
  $plugins = @()
}

if ($plugins -notcontains "khala-task-marker") {
  $plugins += "khala-task-marker"
}

$plugins | ConvertTo-Json | Set-Content -LiteralPath $communityPluginsPath -Encoding UTF8
```

## macOS / Linux Example

Use this when the repository path and vault path are known:

```bash
repo="/path/to/khala-task-marker"
vault="/path/to/Obsidian Vault"
plugin_dir="$vault/.obsidian/plugins/khala-task-marker"

cd "$repo"
npm install
npm test
npm run build

mkdir -p "$plugin_dir"
cp manifest.json main.js styles.css "$plugin_dir/"
```

To enable the plugin with Node.js:

```bash
node - <<'NODE'
const fs = require("fs");
const path = require("path");

const vault = process.env.OBSIDIAN_VAULT;
if (!vault) {
  throw new Error("Set OBSIDIAN_VAULT to the vault path before running this script.");
}

const file = path.join(vault, ".obsidian", "community-plugins.json");
let plugins = [];

if (fs.existsSync(file)) {
  plugins = JSON.parse(fs.readFileSync(file, "utf8"));
}

if (!plugins.includes("khala-task-marker")) {
  plugins.push("khala-task-marker");
}

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(plugins, null, 2));
NODE
```

## Verification

Ask the user to reload Obsidian or toggle the plugin off and on.

Then verify in Obsidian:

1. Open Command Palette.
2. Search `Khala`.
3. Confirm these commands exist:

```text
Khala Task Marker: Cycle task state
Khala Task Marker: Toggle important
Khala Task Marker: Toggle star
```

Manual test sample:

```md
普通段落
⭐ 星标段落
重要段落 %%kt-important%%
⭐ 重要星标段落 %%kt-important%%

- [ ] 普通任务
- [x] 已完成任务
- [ ] ⭐ 星标任务
- [ ] 重要任务 %%kt-important%%
- [x] ⭐ 已完成重要星标任务 %%kt-important%%
```

Expected behavior:

- Cycle task state changes plain -> unchecked -> checked -> plain.
- Toggle important adds or removes `%%kt-important%%`.
- Toggle star adds or removes `⭐`.
- Important text is highlighted from the content area, not from the checkbox.
- The `%%kt-important%%` marker is hidden in edit mode.
- Cursor position should stay attached to the same body text area after each command.

## Troubleshooting

If commands do not appear:

1. Confirm the plugin folder contains `manifest.json`, `main.js`, and `styles.css`.
2. Confirm `manifest.json` has `"id": "khala-task-marker"`.
3. Confirm `.obsidian/community-plugins.json` contains `"khala-task-marker"`.
4. Reload Obsidian.
5. Open Obsidian Developer Tools and check for plugin load errors.

If highlighting does not appear but commands work:

1. Confirm `styles.css` was copied.
2. Reload Obsidian.
3. Check Developer Tools for CodeMirror extension errors.

