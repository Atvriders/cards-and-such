import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2821 — the chip-strip inner track (`.lobby-chips`) MUST NOT carry an
 * `aria-relevant` attribute. The track is rendered around lines 2623-2630
 * of LobbyPage.tsx as a `role="tablist"` <div> with only `aria-label`,
 * `className`, and a ref:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *       {children}
 *     </div>
 *
 * Sibling pins on the SAME inner `.lobby-chips` track currently in the
 * suite already lock down a number of properties (className, role,
 * aria-label, the absence of an id, the absence of various other ARIA
 * attributes, etc.). What NONE of those cover is the absence of an
 * `aria-relevant` attribute.
 *
 * `aria-relevant` is only meaningful on an `aria-live` region: it tells
 * assistive technology which kinds of mutation (additions, removals,
 * text, all) inside a live region should be announced. The chip-strip
 * is a static `role="tablist"` and is NOT a live region — so attaching
 * `aria-relevant` to it would be either:
 *   1. Inert noise (ignored by screen readers because there is no
 *      `aria-live`, but still a non-semantic attribute that future
 *      accessibility audits would flag), or
 *   2. Actively harmful if a regression simultaneously promoted the
 *      chip-strip to a live region — every chip render / re-order /
 *      filter update would then be announced verbatim, drowning the
 *      user in announcements during ordinary navigation.
 *
 * Pin the absence so an accidental introduction of live-region
 * machinery on the chip-strip surfaces in CI rather than in production
 * AT output. The companion StatsCatHeatmapNoAriaRelevant pin (W2688)
 * applies the same reasoning to the stats heatmap grid; this is the
 * lobby chip-strip equivalent.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2036 / W2041 / W2688 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip has no aria-relevant attribute (W2821)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips inner <div> does NOT carry an aria-relevant attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the stable className. There is a sibling drawer tablist
    // with role="tablist" elsewhere in the tree, so a className lookup
    // is more specific than getByRole. Crucially, this lookup is
    // independent of the `aria-relevant` attribute itself, so it cannot
    // vacuously pass.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: anchor is the chip-strip track, not some other element
    // that happened to share the class — guards against a future
    // restructure that moved the class onto a different node.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `aria-relevant` attribute on the track.
    // Use `hasAttribute` rather than checking for a specific value —
    // an `aria-relevant=""` would still be a non-semantic public
    // surface that future code could come to depend on.
    expect(strip!.hasAttribute("aria-relevant")).toBe(false);
  });
});
