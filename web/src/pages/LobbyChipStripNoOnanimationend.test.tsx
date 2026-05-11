import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3255 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onanimationend` inline event-handler attribute.
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
 * `onanimationend` is the legacy inline event-handler attribute that
 * fires when a CSS animation finishes its last iteration on the
 * element. In a React codebase, listeners are wired declaratively via
 * `onAnimationEnd={...}` (which React lowers to a delegated synthetic
 * listener), NEVER as an inline `onanimationend="..."` HTML attribute
 * containing a string of JavaScript. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip has no CSS animation whose end needs to be
 *     observed — it is a static flex/scroll container of `role="tab"`
 *     buttons. There is no animation-end side effect to schedule.
 *  2. Inline event-handler HTML attributes are an XSS vector and
 *     violate strict CSP `script-src` policies (no `'unsafe-inline'`
 *     for event handlers). They are blocked entirely under a
 *     hash/nonce-based CSP.
 *  3. Mixing inline `onanimationend="..."` with React's synthetic
 *     `onAnimationEnd` would split the listener surface across two
 *     incompatible systems, producing double-fire or order-dependent
 *     bugs that are nightmarish to debug.
 *  4. Validators (html-validate, axe, the W3C Nu checker in some
 *     strict profiles) and security scanners (CSP evaluators,
 *     Snyk/SAST tooling) flag inline event handlers as a smell on any
 *     element, and especially on a non-interactive container.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onanimationend`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onanimationend`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — an ARIA attribute,
 *    orthogonal to inline DOM event handlers.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map attribute, not an event handler.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source attribute, not an event handler.
 *  - The broad family of LobbyChipStripNo* pins covers many global,
 *    ARIA, and legacy HTML attributes, but none currently cover the
 *    `onanimationend` inline event-handler attribute. A regression
 *    that added `onanimationend="doSomething()"` (e.g. via a stray
 *    spread, a templating slip, or a copy/paste from a non-React
 *    snippet) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onanimationend") === false` AND
 * `track.getAttribute("onanimationend") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy HTML attribute — an empty `onanimationend=""` is still
 * authored, and any string value is a regression. We additionally
 * assert `getAttribute(...) === null` to belt-and-suspenders the
 * pin against any edge case where a DOM polyfill returns truthy for
 * `hasAttribute` but null for `getAttribute`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onanimationend attribute (W3255)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onanimationend attribute", () => {
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

    // The pin: NO onanimationend inline event-handler attribute is
    // authored on the chip strip. A regression that adds
    // `onanimationend=""`, `onanimationend="doSomething()"`, or any
    // other string-bound handler would fail here.
    expect(track!.hasAttribute("onanimationend")).toBe(false);
    expect(track!.getAttribute("onanimationend")).toBeNull();
  });
});
