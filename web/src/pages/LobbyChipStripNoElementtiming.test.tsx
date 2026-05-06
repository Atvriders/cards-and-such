import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2873 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `elementtiming` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `elementtiming` is a global HTML attribute defined by the Element
 * Timing API (WICG/W3C Web Performance WG). When present, it opts an
 * element into the browser's PerformanceObserver `"element"` entry
 * stream so that LCP-style render timing is reported for that
 * specific element under the supplied identifier (e.g. it surfaces
 * the element in `PerformanceElementTiming` entries with the
 * `identifier` field set to the attribute value).
 *
 * The chip-strip filter rail is intentionally NOT instrumented as an
 * Element Timing target. It is not the LCP candidate (it is a small
 * horizontally-scrolling control rail above the grid, never the
 * largest contentful element of the lobby viewport), and the
 * codebase does not register a `PerformanceObserver({type:
 * "element"})` consumer for chip-strip identifiers. Authoring
 * `elementtiming="lobby-chips"` (or any value) on this element would
 * therefore either:
 *  - silently bloat the performance-entry buffer with an unread
 *    entry on every render (memory pressure on long-lived tabs), or
 *  - mislead a future observer that tries to attribute LCP/render
 *    cost to the chip strip when in fact the heavy candidate is the
 *    hero/grid below it.
 *
 * Why this needs its own pin separate from the other chip-strip
 * absence pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    track at all.
 *  - W1330 (LobbyChipStripAria) and W1331
 *    (LobbyChipStripAriaLabelExact) pin `role` / `aria-label` on the
 *    inner track — silent on `elementtiming`.
 *  - The LobbyChipStripNoAria* family (W2767 NoAriaBusy, W2823
 *    NoAriaAtomic, W2754 NoAriaMultiselectable, etc.) each pin a
 *    DIFFERENT specific ARIA attribute's absence — none cover the
 *    `elementtiming` Element Timing API attribute.
 *  - The LobbyChipStripNo* HTML-attribute family (NoAutofocus,
 *    NoAutocapitalize, NoContenteditable, NoDir, NoExportparts,
 *    NoForm, NoHidden, NoId, NoInert, NoInputmode, NoIs, NoItemprop,
 *    NoItemref, NoItemscope, NoItemtype, NoLang, NoName, NoPart,
 *    NoPopover, NoPopovertarget, NoSlot, NoSpellcheck, NoStyle,
 *    NoTabindex, NoTranslate, NoValue, NoAutocomplete, NoAnchor)
 *    each pin a different global HTML / element-specific attribute —
 *    none cover `elementtiming`.
 *  - None of the existing pins would catch a regression that added
 *    `elementtiming="lobby-chips"` (or any string value) to the
 *    inner `<div class="lobby-chips" role="tablist">`, registering
 *    an unintended Element Timing target on every render.
 *
 * The pin: `track.hasAttribute("elementtiming") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* and matches the
 * accessor the Element Timing spec uses to decide whether an entry
 * should be queued.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no elementtiming attribute (W2873)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an elementtiming attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO elementtiming attribute is authored on the chip
    // strip. A regression that adds `elementtiming="lobby-chips"`
    // (or any value) — opting the chip rail into the Element Timing
    // API and surfacing PerformanceElementTiming entries for it on
    // every render — would fail here.
    expect(track!.hasAttribute("elementtiming")).toBe(false);
  });
});
