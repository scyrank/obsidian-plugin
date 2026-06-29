export type TaskMarkerState = " " | "x" | "X";

export type TaskMarkerRange = {
  fromCh: number;
  toCh: number;
  state: TaskMarkerState;
};

export type RepeatedTaskMarkerPrefixRange = {
  from: number;
  to: number;
};

export type DeleteDirection = "backward" | "forward";

const TASK_MARKER_RE = /^(\s*)- \[([ xX])\]\s+/;
const INDENT_RE = /^\s*/;
const TASK_MARKER_WITHOUT_INDENT_RE = /^- \[([ xX])\]\s+/;

export function findTaskMarkerRangeInLine(line: string): TaskMarkerRange | null {
  const match = line.match(TASK_MARKER_RE);

  if (!match) {
    return null;
  }

  return {
    fromCh: match[1].length,
    toCh: match[0].length,
    state: match[2] as TaskMarkerState,
  };
}

export function getContinuationTaskPrefix(line: string): string | null {
  const match = line.match(TASK_MARKER_RE);

  if (!match) {
    return null;
  }

  return `${match[1]}- [ ] `;
}

export function findRepeatedTaskMarkerPrefixRangeInLine(
  line: string
): { fromCh: number; toCh: number } | null {
  const indentLength = line.match(INDENT_RE)?.[0].length ?? 0;
  let position = indentLength;
  let markerCount = 0;
  let lastMarkerFromCh = indentLength;

  while (position < line.length) {
    const match = line.slice(position).match(TASK_MARKER_WITHOUT_INDENT_RE);

    if (!match) {
      break;
    }

    markerCount += 1;
    lastMarkerFromCh = position;
    position += match[0].length;
  }

  if (markerCount < 2) {
    return null;
  }

  return {
    fromCh: indentLength,
    toCh: lastMarkerFromCh,
  };
}

export function findRepeatedTaskMarkerPrefixRanges(
  text: string
): RepeatedTaskMarkerPrefixRange[] {
  const ranges: RepeatedTaskMarkerPrefixRange[] = [];
  let lineStart = 0;

  for (const line of text.split("\n")) {
    const repeatedPrefix = findRepeatedTaskMarkerPrefixRangeInLine(line);

    if (repeatedPrefix && repeatedPrefix.fromCh < repeatedPrefix.toCh) {
      ranges.push({
        from: lineStart + repeatedPrefix.fromCh,
        to: lineStart + repeatedPrefix.toCh,
      });
    }

    lineStart += line.length + 1;
  }

  return ranges;
}

function rangesOverlap(
  leftFrom: number,
  leftTo: number,
  rightFrom: number,
  rightTo: number
): boolean {
  return leftFrom < rightTo && rightFrom < leftTo;
}

export function expandDeleteRangeForTaskMarker(
  line: string,
  fromCh: number,
  toCh: number,
  direction: DeleteDirection
): { fromCh: number; toCh: number } | null {
  const marker = findTaskMarkerRangeInLine(line);

  if (!marker) {
    return null;
  }

  if (fromCh !== toCh) {
    if (!rangesOverlap(fromCh, toCh, marker.fromCh, marker.toCh)) {
      return null;
    }

    return {
      fromCh: Math.min(fromCh, marker.fromCh),
      toCh: Math.max(toCh, marker.toCh),
    };
  }

  if (direction === "backward" && fromCh > marker.fromCh && fromCh <= marker.toCh) {
    return { fromCh: marker.fromCh, toCh: marker.toCh };
  }

  if (direction === "forward" && fromCh >= marker.fromCh && fromCh < marker.toCh) {
    return { fromCh: marker.fromCh, toCh: marker.toCh };
  }

  return null;
}

export function isTaskMarkerSelected(
  markerFrom: number,
  markerTo: number,
  selectionFrom: number,
  selectionTo: number
): boolean {
  return selectionFrom !== selectionTo && rangesOverlap(selectionFrom, selectionTo, markerFrom, markerTo);
}
