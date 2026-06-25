import { describe, expect, it } from "vitest";
import { mapCursorChAfterLineTransform } from "../src/editorCommands";

describe("mapCursorChAfterLineTransform", () => {
  it("keeps the cursor attached to body text when adding a task prefix", () => {
    expect(mapCursorChAfterLineTransform("hello", "- [ ] hello", 2)).toBe(8);
    expect(mapCursorChAfterLineTransform("hello", "- [ ] hello", 5)).toBe(11);
  });

  it("keeps the cursor attached to body text when removing a task prefix", () => {
    expect(mapCursorChAfterLineTransform("- [x] hello", "hello", 8)).toBe(2);
    expect(mapCursorChAfterLineTransform("- [x] hello", "hello", 11)).toBe(5);
  });

  it("keeps the cursor attached to body text when toggling a task star", () => {
    expect(mapCursorChAfterLineTransform("- [ ] hello", "- [ ] ⭐ hello", 8)).toBe(10);
    expect(mapCursorChAfterLineTransform("- [ ] ⭐ hello", "- [ ] hello", 10)).toBe(8);
  });

  it("keeps the cursor attached to body text when toggling a delegated marker", () => {
    expect(mapCursorChAfterLineTransform("- [ ] hello", "- [ ] 📤 hello", 8)).toBe(11);
    expect(mapCursorChAfterLineTransform("- [ ] 📤 hello", "- [ ] hello", 11)).toBe(8);
  });

  it("does not move the cursor when appending an important marker", () => {
    expect(mapCursorChAfterLineTransform("hello", "hello %%kt-important%%", 2)).toBe(2);
    expect(mapCursorChAfterLineTransform("hello", "hello %%kt-important%%", 5)).toBe(5);
  });

  it("moves the cursor out of a removed important marker", () => {
    expect(mapCursorChAfterLineTransform("hello %%kt-important%%", "hello", 12)).toBe(5);
  });
});
