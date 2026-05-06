import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2832 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `dir` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2625 of LobbyPage.tsx.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoForm.test.tsx and
 * LobbyChipStripNoTabindex.test.tsx headers for the catalog: tag,
 * aria, id, style, child count, form, etc.). What none of those
 * cover is the ABSENCE of a `dir` attribute on the chip-strip track.
 *
 * The `dir` attribute is HTML's text-direction hint — it forces a
 * subtree to render `ltr`, `rtl`, or `auto` regardless of the
 * inherited document direction. The chip-strip is a horizontally
 * scrollable tablist that derives its direction from the document
 * `<html dir>` so that overflow arrows, swipe gestures, and the
 * ResizeObserver-driven scroll logic all stay coherent across
 * locales. A stray `dir="..."` attribute on this specific element
 * would be:
 *   1. A direction override that flips the visual order of chips
 *      relative to the rest of the page in mixed-direction layouts.
 *   2. A foothold for `dir="auto"` heuristics that pick a direction
 *      from the first strong-directional character in chip labels,
 *      producing chip ordering that can change as labels are edited.
 *   3. A break in the contract that scroll math (`scrollLeft`,
 *      arrow visibility, snap-to-chip) is computed against the
 *      ambient document direction, not a per-element override.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `dir` attribute at all. If a future change deliberately
 * needs one (e.g. forcing LTR for a numeric badge sub-row), it
 * should add it AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoForm / LobbyChipStripNoTabindex pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no dir attribute (W2832)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a dir attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not the outer
    // `.lobby-chips-wrap` or a `.lobby-chips-arrow` overflow button.
    // Without this guard a future restructure that moved the className
    // onto a wrapper could pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `dir` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `dir=""` would
    // be flagged.
    expect(strip!.hasAttribute("dir")).toBe(false);
  });
});
