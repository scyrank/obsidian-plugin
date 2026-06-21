import { describe, expect, it } from "vitest";
import { extendCopyEndChForImportantMarker } from "../src/importantCopy";

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
