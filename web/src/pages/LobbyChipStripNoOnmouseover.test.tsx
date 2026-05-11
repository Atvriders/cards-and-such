import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3131 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmouseover` attribute.
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
 * `onmouseover` is a legacy inline DOM event-handler attribute whose
 * value is a string of JavaScript executed when the pointer enters the
 * element. On a React-rendered `<div role="tablist">` it is wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — any hover behavior should be expressed via React
 *     synthetic events (`onMouseOver`/`onMouseEnter`) wired through
 *     props, not as a raw HTML attribute carrying a JS string.
 *  2. Inline `onmouseover="..."` is a classic XSS / CSP-violation
 *     vector — a stray attribute that survives templating would let
 *     arbitrary JS run on mouse-over and is flagged by strict CSP
 *     (`script-src 'self'`, no `unsafe-inline`) and by security
 *     linters (eslint-plugin-react `no-unknown-property`, axe).
 *  3. The chip strip has its own hover affordances driven by CSS
 *     (`.lobby-chips .chip:hover`) and by React handlers on the
 *     individual `<button role="tab">` children — the outer track
 *     does not, and must not, mount any pointer-event JS string.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmouseover`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onmouseover`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2894 (NoCoords),
 *    W2903 (NoCite), and the broad family of LobbyChipStripNo* pins
 *    each pin one specific global/legacy attribute's absence — none
 *    of them currently cover `onmouseover`. A regression that added
 *    `onmouseover="doSomething()"` (e.g. by mistakenly templating an
 *    inline event-handler string onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onmouseover") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `onmouseover` with an empty value is still authored,
 * and any string value is a regression. We additionally pin
 * `getAttribute("onmouseover") === null` to cover both shapes of the
 * DOM API contract.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmouseover attribute (W3131)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmouseover attribute", () => {
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

    // The pin: NO onmouseover attribute is authored on the chip strip.
    // A regression that adds `onmouseover=""`, `onmouseover="alert(1)"`,
    // or any other inline pointer-event JS string would fail here.
    expect(track!.hasAttribute("onmouseover")).toBe(false);
    expect(track!.getAttribute("onmouseover")).toBeNull();
  });
});
