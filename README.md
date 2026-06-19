# Khala Task Marker

Khala Task Marker is an Obsidian plugin for stable line-level task markers. It keeps task state, importance, and star markers as independent Markdown dimensions, so repeated shortcuts do not pollute your notes with broken inline formatting.

## Text protocol

```md
Plain paragraph
⭐ Starred paragraph
Important paragraph %%kt-important%%
⭐ Important starred paragraph %%kt-important%%

- [ ] Normal task
- [x] Completed task
- [ ] ⭐ Starred task
- [ ] Important task %%kt-important%%
- [x] ⭐ Completed important starred task %%kt-important%%
```

## Commands

| Command | Default hotkey | Behavior |
|---|---|---|
| Khala Task Marker: Cycle task state | `Mod + Alt + T` | Plain line -> unchecked task -> checked task -> plain line |
| Khala Task Marker: Toggle important | `Mod + Alt + H` | Adds or removes the trailing `%%kt-important%%` marker |
| Khala Task Marker: Toggle star | `Mod + Alt + S` | Adds or removes `⭐` at the start of the line body |

All commands work on the current line or the selected full-line range. Empty lines are skipped.

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

## Installation

1. Run `npm install`.
2. Run `npm run build`.
3. Copy `manifest.json`, `main.js`, and `styles.css` to your vault folder:

```text
.obsidian/plugins/khala-task-marker/
```

4. Enable community plugins in Obsidian.
5. Enable `Khala Task Marker`.
6. Search for the three commands in Settings -> Hotkeys and adjust shortcuts if needed.

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
- The `%%kt-important%%` marker remains visible in edit mode for now.
- Reading view rendering is planned for a later phase.

## Future ideas

- Reading view highlighting that hides the marker.
- Custom marker symbols and highlight colors.
- More task lifecycle states.
- Sidebar queries for important lines, starred lines, and open tasks.
