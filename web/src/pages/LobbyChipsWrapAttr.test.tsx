import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1997 — the chip-strip outer wrapper (`.lobby-chips-wrap`) carries
 * NO `role` attribute. It is purely a presentational layout/positioning
 * <div> that hosts the two scroll-arrow buttons and the inner
 * `.lobby-chips` tablist track. The ARIA role lives on the INNER track
 * (`<div class="lobby-chips" role="tablist">`, LobbyPage.tsx ~L2623-2628),
 * NOT on the outer wrapper.
 *
 * The wrapper is rendered (LobbyPage.tsx ~L2611-L2614) as a bare
 * <div> with only a className:
 *
 *     <div
 *       className={`lobby-chips-wrap${canLeft ? " has-overflow-left" : ""}${canRight ? " has-overflow-right" : ""}`}
 *     >
 *
 * Why this needs its own pin separate from W1286 / W1967:
 *  - W1286 (LobbyChipStripWrap) pins `tagName === "DIV"` and
 *    `classList.contains("lobby-chips-wrap")` — it does NOT touch
 *    `role` at all.
 *  - W1967 (LobbyChipsWrapClass) pins exact `className === "lobby-chips-wrap"`
 *    on first paint — also silent on `role`.
 *  - Neither existing pin would catch a regression that added e.g.
 *    `role="tablist"` to the OUTER wrapper, which would create two
 *    nested tablists (the wrapper AND its `.lobby-chips` child), break
 *    the ARIA tab semantics, and confuse screen readers and `getByRole`
 *    consumers that expect exactly one tablist for the filter strip.
 *  - Conversely, a regression that moved `role="tablist"` UP from the
 *    inner track onto the wrapper (and dropped it from the inner div)
 *    would leave the wrapper with a role it shouldn't have.
 *
 * The pin: `wrap.getAttribute("role")` MUST be `null` (no role attr).
 * Using `getAttribute` rather than `hasAttribute` records the absence
 * via the same accessor most ARIA-introspection code paths use.
 *
 * We resolve the wrapper via the inner `.lobby-chips` track's
 * `parentElement` — the same anchor W1286 / W1967 use — so the lookup
 * itself does not depend on any attribute of the wrapper we're pinning.
 */
describe("LobbyPage — chip-strip wrapper has no role attribute (W1997)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-chips-wrap outer <div> WITHOUT a role attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the inner tablist track's stable className. There is a
    // sibling drawer tablist with role="tablist" elsewhere in the tree,
    // so querySelector on the .lobby-chips className is safer than
    // getByRole("tablist") here.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();
    // Sanity: confirm the inner track is the one that owns the
    // `role="tablist"`. This is what makes the wrapper's lack-of-role
    // meaningful — the role lives ONE level deeper.
    expect(strip!.getAttribute("role")).toBe("tablist");

    const wrap = strip!.parentElement;
    expect(wrap).not.toBeNull();
    // Sanity: anchor is the chip-strip wrapper, not some other ancestor.
    expect(wrap!.classList.contains("lobby-chips-wrap")).toBe(true);

    // The pin: the outer wrapper carries NO role. `getAttribute`
    // returns `null` (not the empty string) when the attribute is
    // absent. A regression that adds `role="..."` to the wrapper
    // — accidentally promoting it to a landmark, region, group, or a
    // second tablist — fails here.
    expect(wrap!.getAttribute("role")).toBe(null);
  });
});
