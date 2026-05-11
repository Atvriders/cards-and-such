import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3129 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmouseup` attribute.
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
 * `onmouseup` is a legacy inline DOM-event handler attribute. Authoring
 * inline event handlers on the chip strip would be wrong because:
 *  1. The chip strip is a React-managed flex/scroll container of
 *     `role="tab"` buttons — interaction must flow through React's
 *     synthetic event system (`onMouseUp` prop), not via a global
 *     inline `onmouseup="..."` HTML attribute that creates a function
 *     in the global scope and bypasses React's event delegation.
 *  2. Inline event-handler attributes are a Content Security Policy
 *     (CSP) hazard — `script-src` directives without `'unsafe-inline'`
 *     reject them, and strict CSP audits flag every inline handler as
 *     a finding.
 *  3. A stray `onmouseup="doSomething()"` on the tablist would imply
 *     non-React, untyped, string-based behavior on a strongly-typed
 *     React tree — confusing tooling that introspects event wiring
 *     (linters, a11y audits, security scanners) and disabling the
 *     React event-pooling guarantees the rest of the page relies on.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmouseup`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onmouseup`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onmouseup`.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite)
 *    and siblings each pin one specific global/legacy attribute's
 *    absence — none currently cover `onmouseup`. A regression that
 *    added `onmouseup="foo()"` (e.g. by mistakenly templating an
 *    inline handler onto the tablist) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onmouseup") === false` AND
 * `track.getAttribute("onmouseup") === null`. `hasAttribute` (rather
 * than only `getAttribute(...) === null`) is the canonical primitive
 * for asserting absence of an inline-handler attribute — `onmouseup`
 * with an empty value is still authored, and any string value is a
 * regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmouseup attribute (W3129)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmouseup attribute", () => {
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

    // The pin: NO onmouseup attribute is authored on the chip strip.
    // A regression that adds `onmouseup=""`, `onmouseup="doFoo()"`,
    // or any other inline handler string would fail here.
    expect(track!.hasAttribute("onmouseup")).toBe(false);
    expect(track!.getAttribute("onmouseup")).toBe(null);
  });
});
