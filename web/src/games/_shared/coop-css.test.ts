import { describe, expect, it } from "vitest";
import { coopCss, quizCss } from "./coop-css.js";

describe("coopCss", () => {
  it("scopes every selector with the given prefix", () => {
    const css = coopCss("acme", "#ff0000", "#f0f0f0");
    // A representative set of selectors that must exist with the prefix.
    const selectors = [
      ".acme-wrap",
      ".acme-header",
      ".acme-icon",
      ".acme-scenario",
      ".acme-round",
      ".acme-intro",
      ".acme-bars",
      ".acme-bar-track",
      ".acme-bar-fill",
      ".acme-bar-good",
      ".acme-bar-bad",
      ".acme-morale",
      ".acme-last",
      ".acme-tactics",
      ".acme-tactic",
      ".acme-tactic-emoji",
      ".acme-tactic-name",
      ".acme-log",
      ".acme-final",
      ".acme-final-score",
    ];
    for (const sel of selectors) {
      expect(css).toContain(sel);
    }
    // Different prefix must not leak in.
    expect(css).not.toContain(".other-wrap");
    // Accent + bg are interpolated into rules.
    expect(css).toContain("#ff0000");
    expect(css).toContain("background:#f0f0f0");
  });

  it("produces distinct output for distinct prefixes/colors", () => {
    const a = coopCss("a", "#111111", "#222222");
    const b = coopCss("b", "#333333", "#444444");
    expect(a).not.toEqual(b);
    expect(a).toContain(".a-wrap");
    expect(b).toContain(".b-wrap");
    expect(a).not.toContain(".b-wrap");
    expect(b).not.toContain(".a-wrap");
  });
});

describe("quizCss", () => {
  it("scopes quiz selectors with prefix and threads colors", () => {
    const css = quizCss("qz", "#abcdef", "#fafafa");
    const selectors = [
      ".qz-wrap",
      ".qz-header",
      ".qz-progress",
      ".qz-score",
      ".qz-q",
      ".qz-choices",
      ".qz-choice",
      ".qz-correct",
      ".qz-wrong",
      ".qz-feedback",
      ".qz-good",
      ".qz-bad",
      ".qz-next",
      ".qz-final",
      ".qz-final-score",
      ".qz-streak",
    ];
    for (const sel of selectors) {
      expect(css).toContain(sel);
    }
    // Compound selector (choice + state) must be present.
    expect(css).toContain(".qz-choice.qz-correct");
    expect(css).toContain(".qz-choice.qz-wrong");
    // Color interpolation.
    expect(css).toContain("#abcdef");
    expect(css).toContain("background:#fafafa");
  });
});
