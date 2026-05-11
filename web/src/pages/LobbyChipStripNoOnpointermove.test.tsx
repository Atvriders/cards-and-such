import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3213 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointermove` attribute.
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
 * `onpointermove` is the inline HTML event handler attribute for the
 * Pointer Events `pointermove` event — it fires continuously while a
 * pointer (mouse, pen, or touch contact) moves over the element.
 * Authoring it as an inline DOM attribute on the chip strip would be
 * wrong because:
 *  1. The chip strip is a horizontally-scrollable flex container of
 *     `role="tab"` buttons. Pointer-move handling on the track itself
 *     would fire on every pixel of cursor travel across the rail —
 *     dozens to hundreds of events per second — which is gratuitous
 *     work for a static filter strip whose only interactions are
 *     button click, focus, and wheel/keyboard scroll.
 *  2. Inline `onpointermove="..."` strings are evaluated as globals
 *     in unsafe-eval mode and are routinely blocked by strict
 *     Content-Security-Policy (`script-src` without `unsafe-inline`),
 *     producing CSP violation reports in CI and breaking the chip
 *     strip on hardened deployments.
 *  3. Pointer-move would spuriously interfere with native scrolling
 *     gestures, drag-to-scroll, and screen-reader pointer probing,
 *     creating accessibility regressions that no other pin currently
 *     guards.
 *  4. The component already exposes the correct interaction model via
 *     React synthetic handlers on the individual chip buttons (click,
 *     focus, keydown) — there is no design need for a track-level
 *     inline pointer-move binding, ever.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on event handlers.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on event handlers.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy/event-handler attribute's absence — none of them
 *    currently cover `onpointermove`. A regression that added
 *    `onpointermove="..."` (e.g. by mistakenly inlining a
 *    pointer-tracking listener onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onpointermove") === false` and
 * `track.getAttribute("onpointermove") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline event
 * handler attribute — `onpointermove=""` with an empty value is still
 * authored, and any string value is a regression. We also assert the
 * `getAttribute` form to double-pin both code paths.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointermove attribute (W3213)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointermove attribute", () => {
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

    // The pin: NO onpointermove attribute is authored on the chip
    // strip. A regression that adds `onpointermove=""`,
    // `onpointermove="handleMove(event)"`, or any other inline
    // pointer-move binding would fail here.
    expect(track!.hasAttribute("onpointermove")).toBe(false);
    expect(track!.getAttribute("onpointermove")).toBeNull();
  });
});
