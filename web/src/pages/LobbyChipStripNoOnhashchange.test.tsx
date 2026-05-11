import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3273 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onhashchange` attribute.
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
 * `onhashchange` is a legacy inline event-handler attribute whose only
 * valid host is the `<body>` element — where it fires when the URL
 * fragment identifier (the part after `#`) changes. On a
 * `<div role="tablist">` it is meaningless: no user agent dispatches a
 * `hashchange` event to non-`<body>` elements, so an inline handler
 * authored on the chip strip would never fire. Authoring it on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body and is not a recipient of
 *     `hashchange` events. Any `onhashchange="…"` string would be dead
 *     code that never executes.
 *  2. Inline event-handler attributes are a CSP violation under
 *     `script-src 'self'` (and any policy that does not allow
 *     `'unsafe-inline'`). A stray `onhashchange="navigate()"` would
 *     break the page under a hardened CSP and pollute CSP violation
 *     reports.
 *  3. Validators and linters (eslint-plugin-react `react/no-unknown-property`,
 *     html-validate, axe) flag inline `on*` handlers on arbitrary
 *     elements as poor practice — handlers should be attached via
 *     `addEventListener` or React's synthetic event props (`onClick`,
 *     etc.), and `hashchange` specifically should be listened for on
 *     `window`, never inlined on a DOM element.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onhashchange`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onhashchange`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onhashchange`.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    pin absence of other legacy HTML attributes (`coords`, `cite`) —
 *    silent on inline `on*` handlers.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy/aria attribute's absence — none of them
 *    currently cover the `onhashchange` inline event-handler
 *    attribute. A regression that added
 *    `onhashchange="reloadChips()"` (e.g. by mistakenly inlining a
 *    fragment-router callback onto the tablist instead of registering
 *    a `window.addEventListener("hashchange", …)`) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onhashchange") === false` together
 * with `track.getAttribute("onhashchange") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an authored HTML attribute — `onhashchange=""` with an empty value
 * is still authored, and any string value is a regression. The
 * `getAttribute(...) === null` assertion is a belt-and-braces check
 * that the serialized attribute value is also absent.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onhashchange attribute (W3273)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onhashchange attribute", () => {
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

    // The pin: NO onhashchange attribute is authored on the chip
    // strip. A regression that adds `onhashchange=""`,
    // `onhashchange="navigate()"`, or any other inline fragment-router
    // callback binding would fail here.
    expect(track!.hasAttribute("onhashchange")).toBe(false);
    expect(track!.getAttribute("onhashchange")).toBeNull();
  });
});
