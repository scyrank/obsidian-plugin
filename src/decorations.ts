import { Prec, RangeSet, RangeSetBuilder, type ChangeSpec } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import {
  findTaskMarkerRangeInLine,
  isTaskMarkerSelected,
  type TaskMarkerState,
} from "./taskMarker";

const IMPORTANT_MARKER = "%%kt-important%%";
const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;
const TASK_PREFIX_RE = /^(\s*)- \[[ xX]\]\s+/;
const INDENT_RE = /^\s*/;
const STAR_PREFIX_RE = /^⭐\s+/;

type AbsoluteTaskMarkerRange = {
  from: number;
  to: number;
  state: TaskMarkerState;
};

type BuiltDecorations = {
  decorations: DecorationSet;
  atomicRanges: RangeSet<Decoration>;
};

function getImportantMarkerStart(text: string): number | null {
  const match = text.match(IMPORTANT_MARKER_RE);

  if (!match || match.index === undefined) {
    return null;
  }

  return match.index;
}

function getHighlightStart(text: string): number {
  const taskMatch = text.match(TASK_PREFIX_RE);
  let start = taskMatch ? taskMatch[0].length : text.match(INDENT_RE)?.[0].length ?? 0;
  const starMatch = text.slice(start).match(STAR_PREFIX_RE);

  if (starMatch) {
    start += starMatch[0].length;
  }

  return start;
}

function getTaskMarkerRange(line: { from: number; text: string }): AbsoluteTaskMarkerRange | null {
  const marker = findTaskMarkerRangeInLine(line.text);

  if (!marker) {
    return null;
  }

  return {
    from: line.from + marker.fromCh,
    to: line.from + marker.toCh,
    state: marker.state,
  };
}

function rangesOverlap(leftFrom: number, leftTo: number, rightFrom: number, rightTo: number): boolean {
  return leftFrom < rightTo && rightFrom < leftTo;
}

class TaskMarkerWidget extends WidgetType {
  constructor(
    private readonly state: TaskMarkerState,
    private readonly from: number,
    private readonly selected: boolean
  ) {
    super();
  }

  override eq(widget: WidgetType): boolean {
    return (
      widget instanceof TaskMarkerWidget &&
      widget.state === this.state &&
      widget.from === this.from &&
      widget.selected === this.selected
    );
  }

  override toDOM(view: EditorView): HTMLElement {
    const checked = this.state !== " ";
    const wrapper = document.createElement("span");
    const checkbox = document.createElement("input");

    wrapper.className = this.selected
      ? "kh-task-marker-widget kh-task-marker-widget-selected"
      : "kh-task-marker-widget";

    checkbox.type = "checkbox";
    checkbox.className = "task-list-item-checkbox kh-task-marker-checkbox";
    checkbox.checked = checked;
    checkbox.tabIndex = -1;
    checkbox.setAttribute("aria-checked", checked ? "true" : "false");
    checkbox.title = checked ? "Mark as incomplete" : "Mark as complete";

    wrapper.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    wrapper.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      checkbox.checked = checked;
      view.dispatch({
        changes: {
          from: this.from + 3,
          to: this.from + 4,
          insert: checked ? " " : "x",
        },
      });
    });

    wrapper.appendChild(checkbox);
    return wrapper;
  }

  override ignoreEvent(event: Event): boolean {
    return event.type !== "click" && event.type !== "mousedown";
  }
}

function buildEditorDecorations(view: EditorView): BuiltDecorations {
  const decorationRanges: ReturnType<Decoration["range"]>[] = [];
  const atomicRangeBuilder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    let position = from;

    while (position <= to) {
      const line = view.state.doc.lineAt(position);
      const taskMarker = getTaskMarkerRange(line);

      if (taskMarker) {
        const selected = view.state.selection.ranges.some((range) =>
          isTaskMarkerSelected(taskMarker.from, taskMarker.to, range.from, range.to)
        );
        const taskDecoration = Decoration.replace({
          widget: new TaskMarkerWidget(taskMarker.state, taskMarker.from, selected),
        });

        decorationRanges.push(taskDecoration.range(taskMarker.from, taskMarker.to));
        atomicRangeBuilder.add(taskMarker.from, taskMarker.to, taskDecoration);
      }

      if (line.text.includes(IMPORTANT_MARKER)) {
        const markerStart = getImportantMarkerStart(line.text);

        if (markerStart !== null) {
          const highlightStart = getHighlightStart(line.text);

          if (highlightStart < markerStart) {
            decorationRanges.push(
              Decoration.mark({ class: "kh-task-important-text" }).range(
                line.from + highlightStart,
                line.from + markerStart
              )
            );
          }

          decorationRanges.push(
            Decoration.mark({ class: "kh-task-important-marker" }).range(
              line.from + markerStart,
              line.to
            )
          );
        }
      }

      position = line.to + 1;
    }
  }

  return {
    decorations: Decoration.set(decorationRanges, true),
    atomicRanges: atomicRangeBuilder.finish(),
  };
}

function getCollapsedTaskMarkerDeleteRange(
  view: EditorView,
  position: number,
  direction: "backward" | "forward"
): { from: number; to: number } | null {
  const line = view.state.doc.lineAt(position);
  const taskMarker = getTaskMarkerRange(line);

  if (!taskMarker) {
    return null;
  }

  if (direction === "backward" && position > taskMarker.from && position <= taskMarker.to) {
    return { from: taskMarker.from, to: taskMarker.to };
  }

  if (direction === "forward" && position >= taskMarker.from && position < taskMarker.to) {
    return { from: taskMarker.from, to: taskMarker.to };
  }

  return null;
}

function expandSelectionAroundTaskMarkers(
  view: EditorView,
  from: number,
  to: number
): { from: number; to: number } | null {
  let expandedFrom = from;
  let expandedTo = to;
  let changed = false;
  const startLineNumber = view.state.doc.lineAt(from).number;
  const endPosition = to > from ? to - 1 : to;
  const endLineNumber = view.state.doc.lineAt(endPosition).number;

  for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber += 1) {
    const line = view.state.doc.line(lineNumber);
    const taskMarker = getTaskMarkerRange(line);

    if (taskMarker && rangesOverlap(expandedFrom, expandedTo, taskMarker.from, taskMarker.to)) {
      expandedFrom = Math.min(expandedFrom, taskMarker.from);
      expandedTo = Math.max(expandedTo, taskMarker.to);
      changed = true;
    }
  }

  return changed ? { from: expandedFrom, to: expandedTo } : null;
}

function mergeRanges(ranges: { from: number; to: number }[]): { from: number; to: number }[] {
  const sorted = [...ranges].sort((left, right) => left.from - right.from || left.to - right.to);
  const merged: { from: number; to: number }[] = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];

    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function deleteTaskMarkerRange(view: EditorView, direction: "backward" | "forward"): boolean {
  const rangesToDelete: { from: number; to: number }[] = [];

  for (const range of view.state.selection.ranges) {
    if (range.empty) {
      const taskMarkerRange = getCollapsedTaskMarkerDeleteRange(view, range.from, direction);

      if (taskMarkerRange) {
        rangesToDelete.push(taskMarkerRange);
      }

      continue;
    }

    const taskMarkerRange = expandSelectionAroundTaskMarkers(view, range.from, range.to);

    if (taskMarkerRange) {
      rangesToDelete.push(taskMarkerRange);
    }
  }

  if (rangesToDelete.length === 0) {
    return false;
  }

  const changes: ChangeSpec[] = mergeRanges(rangesToDelete).map((range) => ({
    from: range.from,
    to: range.to,
    insert: "",
  }));

  view.dispatch({ changes });
  return true;
}

const editorDecorationPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    atomicRanges: RangeSet<Decoration>;

    constructor(view: EditorView) {
      const builtDecorations = buildEditorDecorations(view);
      this.decorations = builtDecorations.decorations;
      this.atomicRanges = builtDecorations.atomicRanges;
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        const builtDecorations = buildEditorDecorations(update.view);
        this.decorations = builtDecorations.decorations;
        this.atomicRanges = builtDecorations.atomicRanges;
      }
    }
  },
  {
    decorations: (value) => value.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.atomicRanges ?? RangeSet.empty
      ),
  }
);

export const importantLineExtension = [
  editorDecorationPlugin,
  Prec.high(
    keymap.of([
      {
        key: "Backspace",
        run: (view) => deleteTaskMarkerRange(view, "backward"),
      },
      {
        key: "Delete",
        run: (view) => deleteTaskMarkerRange(view, "forward"),
      },
    ])
  ),
];
