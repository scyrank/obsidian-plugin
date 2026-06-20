export type TaskMarkerState = " " | "x" | "X";

export type TaskMarkerRange = {
  fromCh: number;
  toCh: number;
  state: TaskMarkerState;
};

export type DeleteDirection = "backward" | "forward";

const TASK_MARKER_RE = /^(\s*)- \[([ xX])\]\s+/;

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
