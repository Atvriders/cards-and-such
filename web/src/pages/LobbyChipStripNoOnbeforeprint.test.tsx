import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3303 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeprint` attribute.
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
 * `onbeforeprint` is a legacy inline event-handler content attribute
 * whose only valid host is the `<body>` element (it mirrors the
 * `BeforePrintEvent` that fires on `window` just before the print
 * dialog opens). On a `<div role="tablist">` it is meaningless: no
 * user agent dispatches `beforeprint` to a non-`<body>` element, so an
 * inline `onbeforeprint="..."` on the chip strip will never be
 * invoked. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body, so the print lifecycle
 *     event never bubbles to it as an inline handler target.
 *  2. Inline event-handler attributes are a Content Security Policy
 *     liability ("unsafe-inline" for `script-src` is required to
 *     execute them); shipping `onbeforeprint="..."` on a div would
 *     force CSP relaxation for no functional benefit.
 *  3. Validators (W3C Nu, html-validate) flag `onbeforeprint` on
 *     non-`<body>` elements as misplaced, polluting CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onbeforeprint`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onbeforeprint`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA state, orthogonal to a print
 *    lifecycle inline handler.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite),
 *    and the broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onbeforeprint`. A regression that added
 *    `onbeforeprint="window.print()"` (e.g. by accidentally
 *    templating a body-level print hook onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onbeforeprint") === false` AND
 * `track.getAttribute("onbeforeprint") === null`. `hasAttribute`
 * (rather than property lookup) is the canonical primitive for
 * asserting absence of an inline event-handler content attribute —
 * `onbeforeprint=""` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeprint attribute (W3303)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeprint attribute", () => {
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

    // The pin: NO onbeforeprint attribute is authored on the chip
    // strip. A regression that adds `onbeforeprint=""`,
    // `onbeforeprint="window.print()"`, or any other inline
    // print-lifecycle handler binding would fail here.
    expect(track!.hasAttribute("onbeforeprint")).toBe(false);
    expect(track!.getAttribute("onbeforeprint")).toBeNull();
  });
});
