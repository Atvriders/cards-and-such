import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3171 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwheel` attribute.
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
 * `onwheel` is a legacy inline event-handler content attribute that
 * registers a string of JavaScript to run when the user scrolls the
 * mouse wheel over the element. On the chip strip it would be wrong
 * for several reasons:
 *  1. Inline event handlers are a CSP (Content Security Policy)
 *     hazard — they require `unsafe-inline` in `script-src`, which
 *     defeats one of CSP's core protections against XSS.
 *  2. The chip strip already wires its wheel behaviour through React
 *     synthetic events / `addEventListener` on the ref, where handler
 *     identity, cleanup, and passive-listener semantics are managed
 *     explicitly. A stray inline `onwheel="..."` would create a second,
 *     uncontrolled handler with no teardown path.
 *  3. Inline event attributes serialize their value as a raw string,
 *     bypassing React's synthetic event system entirely — the handler
 *     runs outside React's batching, lifecycle, and dev-mode
 *     warnings, so bugs introduced this way are hard to diagnose.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onwheel`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onwheel`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA attribute, not an inline event.
 *  - W2894 (LobbyChipStripNoCoords) and W2903 (LobbyChipStripNoCite)
 *    pin absence of unrelated legacy HTML attributes.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific attribute's absence — none of them currently cover
 *    `onwheel`. A regression that added `onwheel="doSomething()"` to
 *    the tablist (e.g. by an ill-advised wheel-scroll prototype that
 *    landed an inline handler) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onwheel") === false` AND
 * `track.getAttribute("onwheel") === null`. The former is the
 * canonical primitive for asserting absence; the latter guards
 * against a regression that authors `onwheel=""` (which some
 * frameworks emit when binding `undefined`/`null` values).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onwheel attribute (W3171)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwheel attribute", () => {
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

    // The pin: NO onwheel inline event-handler attribute is authored
    // on the chip strip. A regression that adds `onwheel=""`,
    // `onwheel="handleWheel()"`, or any other inline handler binding
    // would fail here.
    expect(track!.hasAttribute("onwheel")).toBe(false);
    expect(track!.getAttribute("onwheel")).toBeNull();
  });
});
