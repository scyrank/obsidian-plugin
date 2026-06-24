import { describe, expect, it } from "vitest";
import {
  extendCopyEndChForImportantMarker,
  findImportantMarkerRangeInLine,
  getImportantMarkerLeftArrowTarget,
  getImportantMarkerRightArrowTarget,
  getImportantMarkerEnterInsertPosition,
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

describe("getImportantMarkerRightArrowTarget", () => {
  it("moves from the visible line end to the next line start", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerRightArrowTarget(line, 0, line.length, line.length + 5, 4)).toBe(
      line.length + 1
    );
  });

  it("moves from marker right boundary to the next line start", () => {
    const line = "task %%kt-important%%";

    expect(
      getImportantMarkerRightArrowTarget(line, 0, line.length, line.length + 5, line.length)
    ).toBe(line.length + 1);
  });

  it("stays inactive outside the marker range", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerRightArrowTarget(line, 0, line.length, line.length + 5, 2)).toBeNull();
  });
});

describe("getImportantMarkerLeftArrowTarget", () => {
  it("moves from marker right boundary to the visible line end", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerLeftArrowTarget(line, 0, line.length)).toBe(4);
  });

  it("stays inactive before the marker range", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerLeftArrowTarget(line, 0, 4)).toBeNull();
  });
});

describe("getImportantMarkerEnterInsertPosition", () => {
  it("inserts a newline after the marker from the visible line end", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerEnterInsertPosition(line, 0, 4)).toBe(line.length);
  });

  it("inserts a newline after the marker from the marker right boundary", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerEnterInsertPosition(line, 0, line.length)).toBe(line.length);
  });

  it("stays inactive outside the marker range", () => {
    const line = "task %%kt-important%%";

    expect(getImportantMarkerEnterInsertPosition(line, 0, 2)).toBeNull();
  });
});
