import { describe, expect, it } from "vitest";
import { cycleTaskState, toggleImportant, toggleStar } from "../src/lineTransform";

describe("cycleTaskState", () => {
  it("cycles plain, unchecked, checked, and plain again", () => {
    expect(cycleTaskState("hello")).toBe("- [ ] hello");
    expect(cycleTaskState("- [ ] hello")).toBe("- [x] hello");
    expect(cycleTaskState("- [x] hello")).toBe("hello");
  });

  it("preserves independent star and important markers", () => {
    expect(cycleTaskState("⭐ hello %%kt-important%%")).toBe("- [ ] ⭐ hello %%kt-important%%");
    expect(cycleTaskState("- [ ] ⭐ hello %%kt-important%%")).toBe("- [x] ⭐ hello %%kt-important%%");
    expect(cycleTaskState("- [x] ⭐ hello %%kt-important%%")).toBe("⭐ hello %%kt-important%%");
  });

  it("preserves indentation", () => {
    expect(cycleTaskState("  hello")).toBe("  - [ ] hello");
    expect(cycleTaskState("  - [x] hello")).toBe("  hello");
  });
});

describe("toggleImportant", () => {
  it("adds and removes important marker", () => {
    expect(toggleImportant("hello")).toBe("hello %%kt-important%%");
    expect(toggleImportant("hello %%kt-important%%")).toBe("hello");
    expect(toggleImportant("- [ ] hello")).toBe("- [ ] hello %%kt-important%%");
    expect(toggleImportant("- [ ] hello %%kt-important%%")).toBe("- [ ] hello");
  });

  it("does not duplicate an existing marker", () => {
    const once = toggleImportant("hello %%kt-important%%");
    expect(once).toBe("hello");
    expect(toggleImportant(once)).toBe("hello %%kt-important%%");
  });
});

describe("toggleStar", () => {
  it("adds and removes star on plain lines", () => {
    expect(toggleStar("hello")).toBe("⭐ hello");
    expect(toggleStar("⭐ hello")).toBe("hello");
  });

  it("adds and removes star after checkbox on task lines", () => {
    expect(toggleStar("- [ ] hello")).toBe("- [ ] ⭐ hello");
    expect(toggleStar("- [ ] ⭐ hello")).toBe("- [ ] hello");
  });

  it("preserves important markers", () => {
    expect(toggleStar("- [x] hello %%kt-important%%")).toBe("- [x] ⭐ hello %%kt-important%%");
    expect(toggleStar("- [x] ⭐ hello %%kt-important%%")).toBe("- [x] hello %%kt-important%%");
  });

  it("preserves indentation", () => {
    expect(toggleStar("  hello")).toBe("  ⭐ hello");
    expect(toggleStar("  - [ ] hello")).toBe("  - [ ] ⭐ hello");
  });
});
