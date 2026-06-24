import { describe, expect, it } from "vitest";
import {
  expandDeleteRangeForTaskMarker,
  findTaskMarkerRangeInLine,
  getContinuationTaskPrefix,
  isTaskMarkerSelected,
} from "../src/taskMarker";

describe("findTaskMarkerRangeInLine", () => {
  it("recognizes unchecked and checked task markers", () => {
    expect(findTaskMarkerRangeInLine("- [ ] hello")).toEqual({
      fromCh: 0,
      toCh: 6,
      state: " ",
    });
    expect(findTaskMarkerRangeInLine("  - [x] hello")).toEqual({
      fromCh: 2,
      toCh: 8,
      state: "x",
    });
    expect(findTaskMarkerRangeInLine("- [X] hello")).toEqual({
      fromCh: 0,
      toCh: 6,
      state: "X",
    });
  });

  it("does not recognize ordinary paragraphs or non-dash tasks", () => {
    expect(findTaskMarkerRangeInLine("hello")).toBeNull();
    expect(findTaskMarkerRangeInLine("* [ ] hello")).toBeNull();
    expect(findTaskMarkerRangeInLine("- [?] hello")).toBeNull();
  });
});

describe("expandDeleteRangeForTaskMarker", () => {
  it("deletes the whole marker on Backspace from after the marker", () => {
    expect(expandDeleteRangeForTaskMarker("- [ ] hello", 6, 6, "backward")).toEqual({
      fromCh: 0,
      toCh: 6,
    });
  });

  it("deletes the whole marker on Delete from before the marker", () => {
    expect(expandDeleteRangeForTaskMarker("- [ ] hello", 0, 0, "forward")).toEqual({
      fromCh: 0,
      toCh: 6,
    });
  });

  it("expands a selection that partly covers the marker", () => {
    expect(expandDeleteRangeForTaskMarker("- [ ] hello", 3, 8, "forward")).toEqual({
      fromCh: 0,
      toCh: 8,
    });
  });

  it("ignores selections outside the marker", () => {
    expect(expandDeleteRangeForTaskMarker("- [ ] hello", 7, 11, "backward")).toBeNull();
  });
});

describe("getContinuationTaskPrefix", () => {
  it("creates an unchecked continuation task with the same indentation", () => {
    expect(getContinuationTaskPrefix("- [ ] hello")).toBe("- [ ] ");
    expect(getContinuationTaskPrefix("  - [x] hello")).toBe("  - [ ] ");
  });

  it("ignores ordinary paragraphs", () => {
    expect(getContinuationTaskPrefix("hello")).toBeNull();
  });
});

describe("isTaskMarkerSelected", () => {
  it("detects a selection that covers the marker", () => {
    expect(isTaskMarkerSelected(0, 6, 0, 8)).toBe(true);
    expect(isTaskMarkerSelected(0, 6, 3, 10)).toBe(true);
  });

  it("ignores selections that only cover body text", () => {
    expect(isTaskMarkerSelected(0, 6, 7, 12)).toBe(false);
  });

  it("ignores an empty cursor", () => {
    expect(isTaskMarkerSelected(0, 6, 3, 3)).toBe(false);
  });
});
