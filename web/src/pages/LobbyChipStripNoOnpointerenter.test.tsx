import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3219 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerenter` attribute.
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
 * `onpointerenter` is a legacy inline event-handler content attribute
 * that fires when a pointer device (mouse, pen, touch) enters the
 * element's hit-test region. Authoring it as an HTML attribute on the
 * chip strip would be wrong because:
 *  1. The chip strip's hover/enter behavior (if any) is owned by
 *     React's synthetic event system via `onPointerEnter` JSX props
 *     bound to discrete React children, not by a string-bodied inline
 *     handler on the track container. Mixing the two breaks React's
 *     event delegation model.
 *  2. Inline `onpointerenter="..."` evaluates its body as JavaScript
 *     in the global scope at dispatch time — a textbook XSS vector if
 *     any value flowing into the attribute is ever user-influenced.
 *     Strict CSP (`script-src` without `'unsafe-inline'`) blocks it
 *     outright, surfacing as a CSP violation report.
 *  3. The chip filter rail is a horizontally-scrolling flex container
 *     of `role="tab"` buttons — there is no per-track pointer-enter
 *     interaction in the design. A stray `onpointerenter` would imply
 *     hover-driven behavior that does not exist, confusing assistive
 *     tech heuristics and automated UX crawlers that introspect
 *     interactive surfaces.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on inline event handlers.
 *  - W1330 / W1331 (LobbyChipStripAria*) pin `role` + `aria-label` —
 *    silent on inline event handlers.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    HTML attribute (quote source URL), orthogonal to pointer events.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global / legacy / aria attribute's absence — none of
 *    them currently cover `onpointerenter`. A regression that added
 *    `onpointerenter="..."` (e.g. by mistakenly templating an inline
 *    hover handler onto the tablist) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onpointerenter") === false` AND
 * `track.getAttribute("onpointerenter") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an authored content attribute — `onpointerenter=""` with an empty
 * value is still authored, and any string body is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerenter attribute (W3219)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerenter attribute", () => {
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

    // The pin: NO onpointerenter attribute is authored on the chip
    // strip. A regression that adds `onpointerenter=""`,
    // `onpointerenter="alert(1)"`, or any other inline pointer-enter
    // handler string would fail here.
    expect(track!.hasAttribute("onpointerenter")).toBe(false);
    expect(track!.getAttribute("onpointerenter")).toBeNull();
  });
});
