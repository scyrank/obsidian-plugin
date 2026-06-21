import { describe, expect, it } from "vitest";
import {
  extendCopyEndChForImportantMarker,
  findImportantMarkerRangeInLine,
} from "../src/importantCopy";

describe("findImportantMarkerRangeInLine", () => {
  it("finds a trailing important marker including leading whitespace", () => {
    const line = "- [ ] task %%kt-important%%";

    expect(findImportantMarkerRangeInLine(line)).toEqual({
      fromCh: "- [ ] task".length,
      toCh: line.length,
    });
  });

  it("returns null when there is no trailing marker", () => {
    expect(findImportantMarkerRangeInLine("- [ ] task")).toBeNull();
  });
});

describe("extendCopyEndChForImportantMarker", () => {
  it("extends a single-line selection ending before the marker", () => {
    const line = "- [ ] important task %%kt-important%%";

    expect(extendCopyEndChForImportantMarker(line, "- [ ] important task".length)).toBe(
      line.length
    );
  });

  it("does not extend a selection ending inside body text", () => {
    const line = "- [ ] important task %%kt-important%%";

    expect(extendCopyEndChForImportantMarker(line, 8)).toBe(8);
  });

  it("does not extend lines without important marker", () => {
    expect(extendCopyEndChForImportantMarker("- [ ] task", 8)).toBe(8);
  });
});
