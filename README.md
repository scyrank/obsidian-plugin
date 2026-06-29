# Khala Task Marker

Khala Task Marker is an Obsidian plugin for stable line-level task markers. It keeps task state, importance, star, and delegated markers as independent Markdown dimensions, so repeated shortcuts do not pollute your notes with broken inline formatting.

## Text protocol

```md
Plain paragraph
⭐ Starred paragraph
📤 Delegated paragraph
Important paragraph %%kt-important%%
⭐ 📤 Important starred delegated paragraph %%kt-important%%

- [ ] Normal task
- [x] Completed task
- [ ] ⭐ Starred task
- [ ] 📤 Delegated task
- [ ] Important task %%kt-important%%
- [x] ⭐ 📤 Completed important starred delegated task %%kt-important%%
```

## Commands

| Command | Default hotkey 1 | Default hotkey 2 | Behavior |
|---|---|---|---|
| Khala Task Marker: Cycle task state | `Alt + 1` | `Mod + Alt + T` | Plain line -> unchecked task -> checked task -> plain line |
| Khala Task Marker: Toggle important | `Alt + 2` | `Mod + Alt + H` | Adds or removes the trailing `%%kt-important%%` marker |
| Khala Task Marker: Toggle star | `Alt + 3` | `Mod + Alt + S` | Adds or removes `⭐` at the start of the line body |
| Khala Task Marker: Toggle delegated | `Alt + 4` | `Mod + Alt + D` | Adds or removes `📤` at the start of the line body, after `⭐` when both exist |

All commands work on the current line or the selected full-line range. Empty lines are skipped. `Mod` maps to `Ctrl` on Windows and Linux, and `Cmd` on macOS.

## Examples

Task state cycling:

```md
Handle Obsidian highlight issue
- [ ] Handle Obsidian highlight issue
- [x] Handle Obsidian highlight issue
Handle Obsidian highlight issue
```

Important marker:

```md
This is important
This is important %%kt-important%%
This is important
```

Star marker:

```md
- [ ] Follow up with this task
- [ ] ⭐ Follow up with this task
- [ ] Follow up with this task
```

Delegated marker:

```md
- [ ] Ask teammate to confirm this task
- [ ] 📤 Ask teammate to confirm this task
- [ ] Ask teammate to confirm this task
```

## Installation

1. Run `npm install`.
2. Run `npm run build`.
3. Copy `manifest.json`, `main.js`, and `styles.css` to your vault folder:

```text
.obsidian/plugins/khala-task-marker/
```

4. Enable community plugins in Obsidian.
5. Enable `Khala Task Marker`.
6. Search for the four commands in Settings -> Hotkeys and adjust shortcuts if needed.

For AI-agent-assisted setup on another computer, see [AGENT_DEPLOYMENT.md](AGENT_DEPLOYMENT.md).

## Development

```bash
npm install
npm test
npm run build
```

## Known limitations

- Only `- [ ]` and `- [x]` task states are supported.
- Only `-` task list markers are supported. `*` and `+` are not handled yet.
- Multiple cursors are not supported in the first version.
- The `📤` delegated marker is plain Markdown text and is not hidden or atomized.
- Reading view rendering is planned for a later phase.

## Future ideas

- Reading view highlighting that hides the marker.
- Custom marker symbols and highlight colors.
- More task lifecycle states.
- Sidebar queries for important lines, starred lines, and open tasks.
