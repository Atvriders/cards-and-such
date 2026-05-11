import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3137 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmouseout` attribute.
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
 * `onmouseout` is a legacy inline DOM event-handler attribute whose
 * value is parsed as a JavaScript function body and fired when the
 * pointer leaves the element. In a React codebase, all pointer
 * lifecycle handlers belong on the synthetic event system
 * (`onMouseLeave` / `onPointerLeave`), never inline as DOM attributes:
 *  1. Authoring `onmouseout="..."` as an HTML attribute bypasses
 *     React's synthetic event delegation, runs in the global scope
 *     (no closure over component state), and cannot be torn down on
 *     unmount — a guaranteed leak.
 *  2. CSP `script-src` policies that disallow `'unsafe-inline'`
 *     reject inline event handlers outright, breaking the page under
 *     a hardened production CSP.
 *  3. Validators (W3C Nu, html-validate, axe, eslint-plugin-react)
 *     flag inline event-handler attributes as anti-patterns;
 *     `onmouseout` specifically is also superseded by the modern
 *     `mouseleave` / `pointerleave` events for hover-exit semantics.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmouseout`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onmouseout`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA state, orthogonal to inline
 *    DOM event handlers.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    pin absence of legacy HTML content attributes (image-map
 *    hotspot, quote source URL) — silent on inline event handlers.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global / legacy / ARIA attribute's absence — none of
 *    them currently cover `onmouseout`. A regression that added
 *    `onmouseout="someLegacyHandler()"` (e.g. by mistakenly porting
 *    a vanilla-JS hover snippet onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onmouseout") === false` AND
 * `track.getAttribute("onmouseout") === null`. `hasAttribute` is
 * the canonical primitive for asserting absence of an authored
 * inline event-handler attribute — `onmouseout=""` with an empty
 * value is still authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmouseout attribute (W3137)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmouseout attribute", () => {
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

    // The pin: NO onmouseout attribute is authored on the chip strip.
    // A regression that adds `onmouseout=""`, `onmouseout="foo()"`,
    // or any other inline hover-exit handler would fail here.
    expect(track!.hasAttribute("onmouseout")).toBe(false);
    expect(track!.getAttribute("onmouseout")).toBeNull();
  });
});
