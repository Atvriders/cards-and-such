import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3249 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfullscreenerror` inline event-handler attribute.
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
 * `onfullscreenerror` is a legacy inline event-handler content
 * attribute that fires when an element fails to transition into
 * fullscreen mode (via the Fullscreen API). On a `<div role="tablist">`
 * filter rail it is meaningless because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     filter buttons — it is never the target of a
 *     `Element.requestFullscreen()` call, so it can neither succeed
 *     nor fail to enter fullscreen.
 *  2. Inline `on*` handlers bypass the React synthetic-event system,
 *     defeating delegation, capture ordering, and SSR-safety. The
 *     project policy is that ALL event wiring on this element goes
 *     through React props (`onScroll`, `onKeyDown`, etc.), never via
 *     a string-valued inline content attribute.
 *  3. A stray `onfullscreenerror="..."` would also be a CSP
 *     `unsafe-inline` script trigger and a static-analysis red flag.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on inline events.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on inline events.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2894
 *    (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite) and the
 *    broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently
 *    cover `onfullscreenerror`. A regression that added
 *    `onfullscreenerror="..."` (e.g. by mistakenly templating a
 *    Fullscreen-API error handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onfullscreenerror") === false`
 * AND `track.getAttribute("onfullscreenerror") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy inline event-handler content attribute — even
 * `onfullscreenerror=""` is still authored and is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfullscreenerror attribute (W3249)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfullscreenerror attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
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

    // The pin: NO onfullscreenerror attribute is authored on the chip
    // strip. A regression that adds `onfullscreenerror=""`,
    // `onfullscreenerror="handleFsError()"`, or any other inline
    // Fullscreen-API error-handler binding would fail here.
    expect(track!.hasAttribute("onfullscreenerror")).toBe(false);
    expect(track!.getAttribute("onfullscreenerror")).toBeNull();
  });
});
