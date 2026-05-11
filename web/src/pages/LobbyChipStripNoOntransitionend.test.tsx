import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3264 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontransitionend` inline event handler attribute.
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
 * `ontransitionend` is a legacy inline DOM event handler attribute
 * that fires when a CSS transition completes on the element.
 * Authoring it as an HTML attribute is wrong on the chip strip
 * because:
 *  1. Inline event handlers bind a string-of-JS to the global scope,
 *     bypassing React's synthetic event system and the component's
 *     own lifecycle — any handler authored here would run outside
 *     React, with no access to component state, refs, or hooks.
 *  2. They are a known CSP (Content-Security-Policy) violation
 *     vector: `script-src 'self'` (without `'unsafe-inline'`) blocks
 *     them, so a stray `ontransitionend="..."` becomes a runtime
 *     CSP error in any hardened deployment.
 *  3. The chip strip already uses CSS transitions for its scroll
 *     indicators and chip hover/active states — wiring an inline
 *     handler would duplicate React's event delegation and risk
 *     double-firing or out-of-order updates.
 *  4. Validators (W3C Nu, html-validate) and a11y linters flag
 *     inline `on*` handlers as anti-patterns in React codebases.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on inner-track attributes.
 *  - W1330 / W1331 pin `role`/`aria-label` on the inner track —
 *    silent on inline event handlers.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL).
 *  - W3261 (LobbyChipStripNoOntransitionstart) pins absence of
 *    `ontransitionstart` — fires at transition START, not END.
 *    `ontransitionend` is a distinct event handler attribute with
 *    its own DOM IDL slot and its own CSP-violation surface.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none currently
 *    cover `ontransitionend`. A regression that added
 *    `ontransitionend="..."` (e.g. by mistakenly inlining a CSS
 *    transition completion listener as an HTML attribute) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("ontransitionend") === false` and
 * `track.getAttribute("ontransitionend") === null`. Both forms are
 * asserted because `hasAttribute` is the canonical absence primitive
 * but `getAttribute` returning `null` provides a redundant guard
 * against any future DOM quirk that distinguishes the two.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontransitionend attribute (W3264)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontransitionend attribute", () => {
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

    // The pin: NO ontransitionend attribute is authored on the
    // chip strip. A regression that adds `ontransitionend=""`,
    // `ontransitionend="handler()"`, or any other inline event
    // handler string would fail here.
    expect(track!.hasAttribute("ontransitionend")).toBe(false);
    expect(track!.getAttribute("ontransitionend")).toBe(null);
  });
});
