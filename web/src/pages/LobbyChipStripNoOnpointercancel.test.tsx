import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3216 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointercancel` attribute.
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
 * `onpointercancel` is the legacy inline-handler form of the Pointer
 * Events `pointercancel` event — fired by the user agent when an
 * in-progress pointer interaction is aborted (e.g. the OS hijacks the
 * gesture for a system scroll, the touch contact area exceeds the
 * device's tolerance, or a pen leaves the digitiser's hover range).
 * Authoring it as an HTML attribute on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — pointer-cancel gestures on the track itself are not
 *     part of the filter UX. Tab activation is driven by `onClick` on
 *     the child `<button role="tab">` elements, not by raw pointer
 *     handlers on the parent track.
 *  2. Inline event-handler attributes (`onfoo="..."`) are a
 *     long-deprecated authoring style that bypasses React's synthetic
 *     event system, breaks SSR hydration parity, and triggers CSP
 *     `unsafe-inline` violations on hardened deployments.
 *  3. A stray `onpointercancel="..."` would imply the filter rail
 *     intercepts pointer-cancel gestures at the container level —
 *     which would compete with the child tab buttons' click handlers
 *     and produce subtle event-ordering bugs on touch devices when
 *     the OS aborts an in-progress tap.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onpointercancel`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpointercancel`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onpointercancel`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute and silent on `onpointercancel`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — silent on
 *    `onpointercancel`.
 *  - Sibling pointer-handler pins exist for `onpointerdown`,
 *    `onpointermove`, and `onpointerup` — each pins one specific
 *    pointer event's inline-handler absence and is silent on
 *    `pointercancel`, which is a distinct user-agent-fired event
 *    (the OS aborts the gesture rather than the user releasing it).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onpointercancel`. A regression that added
 *    `onpointercancel="handler()"` (e.g. by mistakenly templating an
 *    inline pointer-cancel handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onpointercancel") === false` AND
 * `track.getAttribute("onpointercancel") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointercancel attribute (W3216)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointercancel attribute", () => {
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

    // The pin: NO onpointercancel attribute is authored on the chip strip.
    // A regression that adds `onpointercancel=""`,
    // `onpointercancel="handler()"`, or any other inline pointer-cancel
    // handler binding would fail here.
    expect(track!.hasAttribute("onpointercancel")).toBe(false);
    expect(track!.getAttribute("onpointercancel")).toBeNull();
  });
});
