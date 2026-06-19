import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

const IMPORTANT_MARKER = "%%kt-important%%";
const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;
const TASK_PREFIX_RE = /^(\s*)- \[[ xX]\]\s+/;
const INDENT_RE = /^\s*/;
const STAR_PREFIX_RE = /^⭐\s+/;

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

function buildImportantLineDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    let position = from;

    while (position <= to) {
      const line = view.state.doc.lineAt(position);

      if (line.text.includes(IMPORTANT_MARKER)) {
        const markerStart = getImportantMarkerStart(line.text);

        if (markerStart !== null) {
          const highlightStart = getHighlightStart(line.text);

          if (highlightStart < markerStart) {
            builder.add(
              line.from + highlightStart,
              line.from + markerStart,
              Decoration.mark({ class: "kh-task-important-text" })
            );
          }

          builder.add(
            line.from + markerStart,
            line.to,
            Decoration.mark({ class: "kh-task-important-marker" })
          );
        }
      }

      position = line.to + 1;
    }
  }

  return builder.finish();
}

const importantLineViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildImportantLineDecorations(view);
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildImportantLineDecorations(update.view);
      }
    }
  },
  {
    decorations: (value) => value.decorations,
  }
);

export const importantLineExtension = [importantLineViewPlugin];
