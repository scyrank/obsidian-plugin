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

export function isImportantMarkerOnlyLine(line: string): boolean {
  const marker = findImportantMarkerRangeInLine(line);

  return marker !== null && line.slice(0, marker.fromCh).trim().length === 0;
}

export function extendCopyEndChForImportantMarker(line: string, toCh: number): number {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker) {
    return toCh;
  }

  return toCh === marker.fromCh ? marker.toCh : toCh;
}

export function getImportantMarkerRightArrowTarget(
  line: string,
  lineFrom: number,
  lineTo: number,
  docLength: number,
  position: number
): number | null {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker) {
    return null;
  }

  const markerFrom = lineFrom + marker.fromCh;
  const markerTo = lineFrom + marker.toCh;

  if (position >= markerFrom && position <= markerTo) {
    return lineTo < docLength ? lineTo + 1 : lineTo;
  }

  return null;
}

export function getImportantMarkerLeftArrowTarget(
  line: string,
  lineFrom: number,
  position: number
): number | null {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker) {
    return null;
  }

  const markerFrom = lineFrom + marker.fromCh;
  const markerTo = lineFrom + marker.toCh;

  if (position > markerFrom && position <= markerTo) {
    return markerFrom;
  }

  return null;
}

export function getImportantMarkerEnterInsertPosition(
  line: string,
  lineFrom: number,
  position: number
): number | null {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker) {
    return null;
  }

  const markerFrom = lineFrom + marker.fromCh;
  const markerTo = lineFrom + marker.toCh;

  if (position >= markerFrom && position <= markerTo) {
    return markerTo;
  }

  return null;
}

export type ImportantLineSplit = {
  before: string;
  marker: string;
  after: string;
};

export function splitLineKeepingImportantMarkerAbove(
  line: string,
  splitCh: number
): ImportantLineSplit | null {
  const marker = findImportantMarkerRangeInLine(line);

  if (!marker || splitCh < 0 || splitCh > marker.fromCh) {
    return null;
  }

  return {
    before: line.slice(0, splitCh).trimEnd(),
    marker: line.slice(marker.fromCh),
    after: line.slice(splitCh, marker.fromCh).trimStart(),
  };
}
