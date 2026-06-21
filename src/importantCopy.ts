const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;

export type ImportantMarkerRange = {
  fromCh: number;
  toCh: number;
};

export function findImportantMarkerRangeInLine(line: string): ImportantMarkerRange | null {
  const match = line.match(IMPORTANT_MARKER_RE);

  if (!match || match.index === undefined) {
    return null;
  }

  return {
    fromCh: match.index,
    toCh: line.length,
  };
}

export function extendCopyEndChForImportantMarker(line: string, toCh: number): number {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker) {
    return toCh;
  }

  return toCh === marker.fromCh ? marker.toCh : toCh;
}
