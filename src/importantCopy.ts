const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;

export function extendCopyEndChForImportantMarker(line: string, toCh: number): number {
  const match = line.match(IMPORTANT_MARKER_RE);

  if (!match || match.index === undefined) {
    return toCh;
  }

  return toCh === match.index ? line.length : toCh;
}
