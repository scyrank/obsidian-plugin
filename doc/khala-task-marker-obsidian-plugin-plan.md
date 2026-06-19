# Khala Task Marker：Obsidian 强化任务标记插件计划

## 1. 背景与目标

Obsidian 原生任务标记主要支持两种状态：

```md
- [ ] 未完成任务
- [x] 已完成任务
```

它适合基本 todo，但不适合以下需求：

1. 普通段落、未完成任务、已完成任务之间无法用一个快捷键稳定循环。
2. 文本高亮如果使用 `==高亮==`，容易被符号、选区边界、嵌套格式打断。
3. 取消高亮失败时，容易继续添加错误的格式字符，污染正文。
4. 星标、重要程度、任务完成状态混在一起后，后续难以查询和维护。

本插件目标是提供一套 **强化任务标记系统**，让 Obsidian 具备类似 OneNote 的稳定整行/整段标注能力，同时保留 Markdown 可读性。

插件名称建议：

```text
Khala Task Marker
```

插件 id：

```text
khala-task-marker
```

---

## 2. 核心设计原则

本插件将一行文本拆成三个互相独立的维度：

| 维度 | 含义 | 存储方式 | 是否独立 |
|---|---|---|---|
| 任务状态 | 普通段落 / 未完成 / 已完成 | 行首 `- [ ]` / `- [x]` / 无 | 是 |
| 重要程度 | 普通 / 重要 | 行尾 `%%kt-important%%` | 是 |
| 星标 | 无星标 / 星标 | 正文前 `⭐` | 是 |

不要把重要程度塞进 checkbox，例如不要用：

```md
- [!] 重要任务
```

原因是 `[!]` 会占用 checkbox 状态位，导致“重要程度”和“完成状态”互斥，无法表达：

```md
- [ ] 重要的未完成任务
- [x] 重要的已完成任务
```

推荐格式是：

```md
- [ ] 重要的未完成任务 %%kt-important%%
- [x] 重要的已完成任务 %%kt-important%%
```

---

## 3. 最终 Markdown 文本协议

插件应使用以下格式作为最终存储协议：

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

### 3.1 任务状态

普通段落：

```md
处理 Obsidian 高亮问题
```

未完成任务：

```md
- [ ] 处理 Obsidian 高亮问题
```

已完成任务：

```md
- [x] 处理 Obsidian 高亮问题
```

### 3.2 重要标记

普通重要段落：

```md
这个想法很关键 %%kt-important%%
```

重要任务：

```md
- [ ] 这个任务很关键 %%kt-important%%
```

### 3.3 星标

普通星标段落：

```md
⭐ 这个想法需要优先关注
```

星标任务：

```md
- [ ] ⭐ 这个任务需要优先关注
```

### 3.4 组合状态

```md
- [x] ⭐ 已完成的重要星标任务 %%kt-important%%
```

含义：

| 维度 | 状态 |
|---|---|
| 任务状态 | 已完成 |
| 重要程度 | 重要 |
| 星标 | 有星标 |

---

## 4. 插件命令设计

插件需要实现 3 个 Obsidian command。

---

### 4.1 Cycle task state

命令名称：

```text
Khala Task Marker: Cycle task state
```

命令 id：

```text
cycle-task-state
```

推荐快捷键：

```text
Mod + Alt + T
```

其中 `Mod` 在 Windows/Linux 上是 `Ctrl`，在 macOS 上是 `Cmd`。

#### 行为

对当前行或选中多行执行任务状态循环：

```text
普通段落 → 未完成任务 → 已完成任务 → 普通段落
```

#### 示例

初始：

```md
处理 Obsidian 高亮问题
```

按一次：

```md
- [ ] 处理 Obsidian 高亮问题
```

再按一次：

```md
- [x] 处理 Obsidian 高亮问题
```

再按一次：

```md
处理 Obsidian 高亮问题
```

#### 必须保留其他标记

初始：

```md
⭐ 处理 Obsidian 高亮问题 %%kt-important%%
```

按一次：

```md
- [ ] ⭐ 处理 Obsidian 高亮问题 %%kt-important%%
```

再按一次：

```md
- [x] ⭐ 处理 Obsidian 高亮问题 %%kt-important%%
```

再按一次：

```md
⭐ 处理 Obsidian 高亮问题 %%kt-important%%
```

---

### 4.2 Toggle important

命令名称：

```text
Khala Task Marker: Toggle important
```

命令 id：

```text
toggle-important
```

推荐快捷键：

```text
Mod + Alt + H
```

#### 行为

对当前行或选中多行循环切换重要状态：

```text
普通 → 重要 → 普通
```

#### 示例

初始：

```md
这个想法很关键
```

按一次：

```md
这个想法很关键 %%kt-important%%
```

再按一次：

```md
这个想法很关键
```

任务行同理：

```md
- [ ] 处理 Obsidian 高亮问题
```

变成：

```md
- [ ] 处理 Obsidian 高亮问题 %%kt-important%%
```

再变回：

```md
- [ ] 处理 Obsidian 高亮问题
```

#### 要求

1. 不允许重复添加多个 `%%kt-important%%`。
2. 删除时只删除行尾的 `%%kt-important%%`。
3. 不要修改正文中的其他内容。
4. 支持任务行和普通段落。
5. 支持多行选区。

---

### 4.3 Toggle star

命令名称：

```text
Khala Task Marker: Toggle star
```

命令 id：

```text
toggle-star
```

推荐快捷键：

```text
Mod + Alt + S
```

#### 行为

对当前行或选中多行循环切换星标：

```text
无星标 → 有星标 → 无星标
```

#### 普通段落示例

初始：

```md
这个想法需要优先关注
```

按一次：

```md
⭐ 这个想法需要优先关注
```

再按一次：

```md
这个想法需要优先关注
```

#### 任务行示例

初始：

```md
- [ ] 这个任务需要优先关注
```

按一次：

```md
- [ ] ⭐ 这个任务需要优先关注
```

再按一次：

```md
- [ ] 这个任务需要优先关注
```

#### 要求

1. 任务行中，星标必须放在 checkbox 后面。
2. 普通段落中，星标放在缩进之后、正文之前。
3. 不允许重复添加多个 `⭐`。
4. 必须保留 `%%kt-important%%`。
5. 支持多行选区。

---

## 5. 选区行为

所有命令都应支持：

1. 无选区：处理光标所在行。
2. 有选区：扩展到完整行，逐行处理。
3. 多光标：第一版可以不支持，后续再扩展。
4. 空行：第一版统一跳过。
5. 保留缩进。
6. 第一版只要求支持 `-` 列表符号，不要求支持 `*` 或 `+`。

示例：

```md
第一行
第二行
- [ ] 第三行
- [x] 第四行
```

选中多行后执行 `Toggle important`：

```md
第一行 %%kt-important%%
第二行 %%kt-important%%
- [ ] 第三行 %%kt-important%%
- [x] 第四行 %%kt-important%%
```

---

## 6. 解析规则

### 6.1 任务行正则

```ts
/^(\s*)- \[([ xX])\]\s+(.*)$/
```

分组含义：

| 分组 | 含义 |
|---|---|
| `$1` | 缩进 |
| `$2` | checkbox 状态：空格 / `x` / `X` |
| `$3` | 正文 |

### 6.2 普通行正则

```ts
/^(\s*)(.*)$/
```

分组含义：

| 分组 | 含义 |
|---|---|
| `$1` | 缩进 |
| `$2` | 正文 |

### 6.3 重要标记正则

```ts
/\s*%%kt-important%%\s*$/
```

只匹配行尾重要标记。

### 6.4 星标规则

任务行：

```md
- [ ] ⭐ 内容
```

普通行：

```md
⭐ 内容
```

判断方式：

1. 对任务行，解析出正文后，如果正文以 `⭐ ` 开头，视为已有星标。
2. 对普通行，保留缩进后，如果正文以 `⭐ ` 开头，视为已有星标。

---

## 7. TypeScript 核心函数

建议把核心文本变换写成纯函数，方便单元测试。

文件：

```text
src/lineTransform.ts
```

导出函数：

```ts
export function cycleTaskState(line: string): string
export function toggleImportant(line: string): string
export function toggleStar(line: string): string
```

### 7.1 cycleTaskState

期望结果：

```ts
cycleTaskState("hello") === "- [ ] hello"
cycleTaskState("- [ ] hello") === "- [x] hello"
cycleTaskState("- [x] hello") === "hello"

cycleTaskState("⭐ hello %%kt-important%%") === "- [ ] ⭐ hello %%kt-important%%"
cycleTaskState("- [ ] ⭐ hello %%kt-important%%") === "- [x] ⭐ hello %%kt-important%%"
cycleTaskState("- [x] ⭐ hello %%kt-important%%") === "⭐ hello %%kt-important%%"
```

### 7.2 toggleImportant

期望结果：

```ts
toggleImportant("hello") === "hello %%kt-important%%"
toggleImportant("hello %%kt-important%%") === "hello"
toggleImportant("- [ ] hello") === "- [ ] hello %%kt-important%%"
toggleImportant("- [ ] hello %%kt-important%%") === "- [ ] hello"
```

### 7.3 toggleStar

期望结果：

```ts
toggleStar("hello") === "⭐ hello"
toggleStar("⭐ hello") === "hello"

toggleStar("- [ ] hello") === "- [ ] ⭐ hello"
toggleStar("- [ ] ⭐ hello") === "- [ ] hello"

toggleStar("- [x] hello %%kt-important%%") === "- [x] ⭐ hello %%kt-important%%"
toggleStar("- [x] ⭐ hello %%kt-important%%") === "- [x] hello %%kt-important%%"
```

---

## 8. 插件目录结构

建议基于 Obsidian official sample plugin / TypeScript 项目结构实现：

```text
khala-task-marker/
  manifest.json
  package.json
  tsconfig.json
  esbuild.config.mjs
  src/
    main.ts
    lineTransform.ts
    editorCommands.ts
    decorations.ts
  styles.css
  README.md
```

---

## 9. manifest.json

```json
{
  "id": "khala-task-marker",
  "name": "Khala Task Marker",
  "version": "0.1.0",
  "minAppVersion": "1.5.0",
  "description": "Enhanced task marker system with cyclic task states, important line highlight, and star marker.",
  "author": "hao zhang",
  "isDesktopOnly": false
}
```

---

## 10. 命令注册要求

在 `src/main.ts` 中注册 3 个 command。

示意：

```ts
this.addCommand({
  id: "cycle-task-state",
  name: "Cycle task state",
  hotkeys: [{ modifiers: ["Mod", "Alt"], key: "T" }],
  editorCallback: (editor) => {
    applyToSelectedLines(editor, cycleTaskState);
  },
});

this.addCommand({
  id: "toggle-important",
  name: "Toggle important",
  hotkeys: [{ modifiers: ["Mod", "Alt"], key: "H" }],
  editorCallback: (editor) => {
    applyToSelectedLines(editor, toggleImportant);
  },
});

this.addCommand({
  id: "toggle-star",
  name: "Toggle star",
  hotkeys: [{ modifiers: ["Mod", "Alt"], key: "S" }],
  editorCallback: (editor) => {
    applyToSelectedLines(editor, toggleStar);
  },
});
```

如果当前 Obsidian API 的 hotkey 类型定义发生变化，以项目内 `obsidian.d.ts` 为准。

---

## 11. 编辑器操作工具函数

建议文件：

```text
src/editorCommands.ts
```

实现：

```ts
export function applyToSelectedLines(
  editor: Editor,
  transform: (line: string) => string
): void
```

行为：

1. 获取 selection 起止位置。
2. 如果无选区，处理当前光标所在行。
3. 如果有选区，扩展到完整行。
4. 对范围内每一行执行 transform。
5. 使用一次 replaceRange 替换整段文本，减少 undo 栈污染。
6. 尽量保持光标或选区位置合理。

伪代码：

```ts
const from = editor.getCursor("from");
const to = editor.getCursor("to");

const startLine = Math.min(from.line, to.line);
let endLine = Math.max(from.line, to.line);

if (to.ch === 0 && endLine > startLine) {
  endLine -= 1;
}

const lines: string[] = [];
for (let i = startLine; i <= endLine; i++) {
  lines.push(editor.getLine(i));
}

const transformed = lines
  .map((line) => line.trim().length === 0 ? line : transform(line))
  .join("\n");

editor.replaceRange(
  transformed,
  { line: startLine, ch: 0 },
  { line: endLine, ch: editor.getLine(endLine).length }
);
```

---

## 12. 编辑模式高亮渲染

目标：

含有 `%%kt-important%%` 的行，在 Live Preview / Source 编辑器中显示整行淡黄色底色。

CSS class：

```css
.kh-task-important-line {
  background-color: rgba(255, 230, 120, 0.35);
  border-radius: 4px;
}
```

建议文件：

```text
src/decorations.ts
```

使用 CodeMirror line decorations。

第一版要求：

1. 只要当前行文本包含 `%%kt-important%%`，就给整行加 `.kh-task-important-line`。
2. 如果隐藏 marker 实现复杂，第一版可以暂时不隐藏。
3. 第二阶段再弱化或隐藏 `%%kt-important%%` marker。

---

## 13. styles.css

```css
.kh-task-important-line {
  background-color: rgba(255, 230, 120, 0.35);
  border-radius: 4px;
}

/* 第二阶段可选：弱化重要标记文本 */
.kh-task-important-marker {
  opacity: 0.35;
  font-size: 0.85em;
}
```

---

## 14. README.md 内容要求

README 需要包含：

1. 插件解决的问题。
2. 文本协议。
3. 三个命令说明。
4. 推荐快捷键。
5. 安装方式。
6. 使用示例。
7. 已知限制。
8. 后续可扩展方向。

---

## 15. 推荐开发阶段

### P1：文本操作与命令

目标：

1. 完成插件基本结构。
2. 注册 3 个 command。
3. 实现 3 个纯函数：
   - `cycleTaskState`
   - `toggleImportant`
   - `toggleStar`
4. 实现当前行/多行选区处理。
5. README 写清楚使用方式。

验收：

1. Command Palette 中能看到 3 个命令。
2. Hotkeys 中能搜索到 3 个命令。
3. 普通段落、未完成任务、已完成任务可以稳定循环。
4. 重要标记不会重复添加。
5. 星标不会重复添加。
6. 多行选区处理正确。

### P2：编辑模式高亮渲染

目标：

1. 添加 CodeMirror extension。
2. 含 `%%kt-important%%` 的行显示整行淡黄色底色。
3. 不影响普通编辑操作。

验收：

1. 编辑模式中重要行有底色。
2. 删除 `%%kt-important%%` 后底色消失。
3. 多个重要行都能正确显示。

### P3：阅读模式增强

目标：

1. 阅读模式中也能显示重要行底色。
2. 不显示 `%%kt-important%%` marker。
3. 列表项、普通段落都能支持。

验收：

1. Reading View 中重要段落有高亮底色。
2. Reading View 中重要任务有高亮底色。
3. 不影响普通 Markdown 渲染。

### P4：设置页与扩展能力

目标：

1. 支持自定义 important marker。
2. 支持自定义星标符号。
3. 支持自定义高亮颜色。
4. 支持更多重要程度：
   - 普通
   - 重要
   - 非常重要
5. 支持更多 task state：
   - 未完成
   - 已完成
   - 取消
   - 待确认
   - 阻塞

第一版不做 P4，避免复杂化。

---

## 16. 测试样例

请使用以下内容作为手工测试样例：

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

### 16.1 Cycle task state 测试

对每一行连续执行 3 次，应该回到原始状态。

不允许出现：

```md
- [ ] - [ ] 普通段落
- [x] - [ ] 普通段落
```

### 16.2 Toggle important 测试

连续执行 2 次，应该回到原始状态。

不允许出现：

```md
普通段落 %%kt-important%% %%kt-important%%
```

### 16.3 Toggle star 测试

连续执行 2 次，应该回到原始状态。

不允许出现：

```md
⭐⭐ 普通段落
- [ ] ⭐ ⭐ 普通任务
```

---

## 17. Codex 执行提示

请 Codex 按以下顺序执行：

1. 创建 Obsidian 插件项目结构。
2. 实现 `lineTransform.ts`。
3. 为 `lineTransform.ts` 添加基础测试或至少手工测试脚本。
4. 实现 `editorCommands.ts`。
5. 实现 `main.ts` 并注册命令。
6. 添加 `manifest.json`、`styles.css`、`README.md`。
7. 本地构建，确保生成 `main.js`。
8. 将插件复制到 Obsidian vault 的：

```text
.obsidian/plugins/khala-task-marker/
```

9. 在 Obsidian 设置中启用社区插件和该插件。
10. 在 Hotkeys 中绑定或确认快捷键。
11. 使用测试样例进行验收。

---

## 18. 已知限制

第一版可以接受以下限制：

1. 只支持 `- [ ]` 和 `- [x]`。
2. 只支持 `-` 列表符号，不支持 `*` 或 `+`。
3. 空行默认跳过。
4. 多光标暂不支持。
5. 阅读模式高亮可以放到第二阶段。
6. `%%kt-important%%` 在编辑模式中可能仍然可见，后续再弱化或隐藏。

---

## 19. 后续扩展方向

后续可以扩展为更完整的 Khala 笔记标记系统：

### 19.1 多级重要程度

```md
普通内容
重要内容 %%kt-important%%
非常重要内容 %%kt-critical%%
```

### 19.2 更多任务状态

```md
- [ ] 未完成
- [x] 已完成
- [-] 取消
- [?] 待确认
- [!] 高风险
```

但注意：这些状态是任务生命周期状态，不应该替代重要程度。

### 19.3 支持查询

未来可以支持：

1. 查询所有星标任务。
2. 查询所有重要段落。
3. 查询所有重要且未完成任务。
4. 查询所有已完成但仍然星标的任务。

### 19.4 支持侧边栏面板

显示：

1. 当前文件的重要行。
2. 当前文件的星标行。
3. 当前文件未完成任务。
4. 当前 vault 的重要任务汇总。

---

## 20. 最终验收标准

插件完成后，必须满足：

1. 安装插件后，在 Command Palette 中能看到：
   - `Khala Task Marker: Cycle task state`
   - `Khala Task Marker: Toggle important`
   - `Khala Task Marker: Toggle star`
2. 在 Settings → Hotkeys 中能搜索到 3 个命令。
3. 可以给 3 个命令绑定快捷键。
4. 当前行无选区时，命令作用于当前行。
5. 有多行选区时，命令作用于所有选中行。
6. 普通段落、未完成任务、已完成任务可以稳定循环。
7. 重要标记可以稳定 toggle。
8. 星标可以稳定 toggle。
9. 三个维度互相独立，不互相覆盖。
10. 执行多次快捷键不会污染 Markdown 内容。
11. 含 `%%kt-important%%` 的行在编辑模式中显示淡黄色整行底色。
12. README 清楚说明使用方式和已知限制。

---

## 21. 项目一句话描述

Khala Task Marker 是一个 Obsidian 本地插件，用于把普通段落、任务状态、重要高亮和星标拆成独立维度，并通过快捷键稳定切换，避免 Markdown 内联高亮反复操作导致正文格式污染。
