import { describe, expect, it } from "vitest";
import { getHighlightStart } from "../src/decorations";

describe("getHighlightStart", () => {
  it("skips task, star, and delegated prefixes", () => {
    expect(getHighlightStart("- [ ] ⭐ 📤 hello %%kt-important%%")).toBe("- [ ] ⭐ 📤 ".length);
  });

  it("skips delegated prefixes without star markers", () => {
    expect(getHighlightStart("  📤 hello %%kt-important%%")).toBe("  📤 ".length);
  });

  it("normalizes legacy marker order for highlight start", () => {
    expect(getHighlightStart("- [ ] 📤 ⭐ hello %%kt-important%%")).toBe("- [ ] 📤 ⭐ ".length);
  });
});
