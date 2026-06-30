const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;
const IMPORTANT_MARKER = "%%kt-important%%";

export type ImportantMarkerRange = {
  fromCh: number;
  toCh: number;
};

export type ImportantMarkerOnlyLineRange = {
  from: number;
  to: number;
};

export type InlineImportantMarkerRange = {
  from: number;
  to: number;
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

export function findImportantMarkerOnlyLineRanges(text: string): ImportantMarkerOnlyLineRange[] {
  const ranges: ImportantMarkerOnlyLineRange[] = [];
  let lineStart = 0;

  for (const line of text.split("\n")) {
    const lineEnd = lineStart + line.length;

    if (isImportantMarkerOnlyLine(line)) {
      ranges.push({ from: lineStart, to: lineEnd });
    }

    lineStart = lineEnd + 1;
  }

  return ranges;
}

export function findInlineImportantMarkerRanges(text: string): InlineImportantMarkerRange[] {
  const ranges: InlineImportantMarkerRange[] = [];
  let lineStart = 0;

  for (const line of text.split("\n")) {
    const trailingMarker = findImportantMarkerRangeInLine(line);
    let searchFrom = 0;

    while (searchFrom < line.length) {
      const markerFrom = line.indexOf(IMPORTANT_MARKER, searchFrom);

      if (markerFrom === -1) {
        break;
      }

      const markerTo = markerFrom + IMPORTANT_MARKER.length;
      const isTrailingMarker =
        trailingMarker !== null &&
        markerFrom >= trailingMarker.fromCh &&
        markerTo <= trailingMarker.toCh;

      if (!isTrailingMarker) {
        const removeFollowingSpace =
          markerTo < line.length &&
          /\s/.test(line[markerTo]) &&
          (markerFrom === 0 || /\s/.test(line[markerFrom - 1]));

        ranges.push({
          from: lineStart + markerFrom,
          to: lineStart + markerTo + (removeFollowingSpace ? 1 : 0),
        });
      }

      searchFrom = markerTo;
    }

    lineStart += line.length + 1;
  }

  return ranges;
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
