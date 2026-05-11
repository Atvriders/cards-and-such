import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3318 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onselectionchange` attribute.
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
 * `onselectionchange` is the inline event-handler content attribute for
 * the global `selectionchange` event — it fires on `document` when the
 * user agent's selection (caret / highlighted range) changes. On a
 * `<div role="tablist">` it is meaningless: the chip strip is a flex
 * row of `role="tab"` buttons, it has no editable text content, no
 * caret, and no user-driven text selection state worth observing.
 * Authoring it on the chip strip would be wrong because:
 *  1. The `selectionchange` event is dispatched on `document` (and on
 *     editable hosts / form controls with text selection) — it is NOT
 *     a bubbling event on arbitrary `<div>` elements, so the inline
 *     handler on a tablist would simply never fire.
 *  2. Authoring `onselectionchange="..."` would attach a string-eval
 *     handler that React's synthetic-event system does not manage,
 *     bypassing the test renderer and leaking a raw global handler
 *     into the DOM.
 *  3. Validators (W3C Nu, html-validate) and security linters (CSP
 *     `unsafe-inline` audits) flag stray inline event-handler
 *     attributes on non-applicable elements as policy violations.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on event handlers.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote-source URL) and silent on
 *    `onselectionchange` (inline event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onselectionchange`. A regression that added
 *    `onselectionchange="..."` (e.g. by mistakenly templating an
 *    inline selection-watcher onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onselectionchange") === false` AND
 * `track.getAttribute("onselectionchange") === null`. We assert both
 * primitives because `hasAttribute` catches the empty-value case
 * (`onselectionchange=""` is still authored) and `getAttribute`
 * returning `null` is the canonical absence sentinel.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onselectionchange attribute (W3318)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onselectionchange attribute", () => {
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

    // The pin: NO onselectionchange attribute is authored on the chip
    // strip. A regression that adds `onselectionchange=""`,
    // `onselectionchange="handler()"`, or any other inline
    // selection-watcher binding would fail here.
    expect(track!.hasAttribute("onselectionchange")).toBe(false);
    expect(track!.getAttribute("onselectionchange")).toBeNull();
  });
});
