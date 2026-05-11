import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3252 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onanimationstart` attribute.
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
 * `onanimationstart` is a legacy inline event-handler attribute that
 * fires when a CSS animation begins on the element. On a
 * `<div role="tablist">` filter rail it is wrong because:
 *  1. Inline `on*` handlers are a CSP / hardening anti-pattern — any
 *    inline handler string is evaluated as JavaScript and is blocked
 *    by `script-src 'self'` style content-security-policy headers.
 *    Authoring `onanimationstart="..."` would create a CSP violation
 *    in production deployments that disable `'unsafe-inline'`.
 *  2. React's idiomatic primitive is the camelCase JSX prop
 *    `onAnimationStart={handler}`, which attaches a managed
 *    SyntheticEvent listener — it does NOT render as a DOM
 *    `onanimationstart` attribute. A stray lowercase
 *    `onanimationstart="..."` would imply someone bypassed React's
 *    event system to inject a raw string handler.
 *  3. The chip strip has no CSS animations declared on its own box —
 *    the scroll-snap rail does not @keyframes-animate. An
 *    animation-start listener is therefore semantically unmotivated:
 *    there is nothing to listen for.
 *  4. Validators (W3C Nu, html-validate, ESLint react/no-unknown-property)
 *    flag lowercase inline event handlers in JSX as either invalid
 *    DOM properties or as forbidden-by-rule.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track's inline event handlers at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on inline `on*`
 *    handlers.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on inline event handlers.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2894
 *    (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite), and the
 *    broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently
 *    cover the `onanimationstart` inline event-handler attribute.
 *    A regression that added `onanimationstart="handleStart(event)"`
 *    (e.g. by hand-porting a vanilla-JS pattern) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onanimationstart") === false` and
 * `track.getAttribute("onanimationstart") === null`. `hasAttribute`
 * is the canonical primitive for asserting absence of a legacy HTML
 * attribute — `onanimationstart=""` with an empty value is still
 * authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onanimationstart attribute (W3252)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onanimationstart attribute", () => {
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

    // The pin: NO onanimationstart attribute is authored on the chip
    // strip. A regression that adds `onanimationstart=""`,
    // `onanimationstart="handleStart(event)"`, or any other inline
    // event-handler string would fail here.
    expect(track!.hasAttribute("onanimationstart")).toBe(false);
    expect(track!.getAttribute("onanimationstart")).toBeNull();
  });
});
