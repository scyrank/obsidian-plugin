import type { Editor, EditorPosition } from "obsidian";

type LineTransform = (line: string) => string;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function getCommonPrefixLength(left: string, right: string): number {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;

  while (index < maxLength && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function getCommonSuffixLength(left: string, right: string, prefixLength: number): number {
  const maxLength = Math.min(left.length, right.length) - prefixLength;
  let length = 0;

  while (
    length < maxLength &&
    left[left.length - 1 - length] === right[right.length - 1 - length]
  ) {
    length += 1;
  }

  return length;
}

export function mapCursorChAfterLineTransform(
  oldLine: string,
  newLine: string,
  ch: number
): number {
  const oldCh = clamp(ch, 0, oldLine.length);

  if (oldLine === newLine) {
    return oldCh;
  }

  const prefixLength = getCommonPrefixLength(oldLine, newLine);
  const suffixLength = getCommonSuffixLength(oldLine, newLine, prefixLength);
  const oldChangeEnd = oldLine.length - suffixLength;
  const newChangeEnd = newLine.length - suffixLength;

  if (oldCh <= prefixLength) {
    return oldCh;
  }

  if (oldCh >= oldChangeEnd) {
    return clamp(oldCh + newLine.length - oldLine.length, 0, newLine.length);
  }

  const oldChangedLength = oldChangeEnd - prefixLength;
  const newChangedLength = newChangeEnd - prefixLength;

  if (oldChangedLength <= 0) {
    return clamp(newChangeEnd, 0, newLine.length);
  }

  const changedRegionRatio = (oldCh - prefixLength) / oldChangedLength;
  return clamp(Math.round(prefixLength + changedRegionRatio * newChangedLength), 0, newLine.length);
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function getSelectedLineRange(editor: Editor): { startLine: number; endLine: number } {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  const startLine = Math.min(from.line, to.line);
  let endLine = Math.max(from.line, to.line);

  if (editor.somethingSelected() && to.ch === 0 && endLine > startLine) {
    endLine -= 1;
  }

  return { startLine, endLine };
}

function getTransformedLines(
  editor: Editor,
  startLine: number,
  endLine: number,
  transform: LineTransform
): string[] {
  const lines: string[] = [];

  for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
    const line = editor.getLine(lineNumber);
    lines.push(isBlank(line) ? line : transform(line));
  }

  return lines;
}

export function applyToSelectedLines(editor: Editor, transform: LineTransform): void {
  const hadSelection = editor.somethingSelected();
  const cursor = editor.getCursor();
  const { startLine, endLine } = getSelectedLineRange(editor);
  const transformedLines = getTransformedLines(editor, startLine, endLine, transform);
  const oldCursorLine = editor.getLine(cursor.line);
  const newCursorLine = transformedLines[cursor.line - startLine] ?? oldCursorLine;
  const mappedCursorCh = mapCursorChAfterLineTransform(oldCursorLine, newCursorLine, cursor.ch);
  const transformedText = transformedLines.join("\n");
  const replaceEnd: EditorPosition = {
    line: endLine,
    ch: editor.getLine(endLine).length,
  };

  editor.replaceRange(transformedText, { line: startLine, ch: 0 }, replaceEnd);

  if (hadSelection) {
    editor.setSelection(
      { line: startLine, ch: 0 },
      {
        line: startLine + transformedLines.length - 1,
        ch: transformedLines[transformedLines.length - 1]?.length ?? 0,
      }
    );
    return;
  }

  const currentLine = editor.getLine(cursor.line);
  editor.setCursor({
    line: cursor.line,
    ch: Math.min(mappedCursorCh, currentLine.length),
  });
}
