import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3210 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerup` attribute.
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
 * `onpointerup` is the legacy inline-handler form of the Pointer
 * Events `pointerup` event. Authoring it as an HTML attribute on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *    buttons — pointer-up gestures on the track itself are not part
 *    of the filter UX. Tab activation is driven by `onClick` on the
 *    child `<button role="tab">` elements, not by raw pointer
 *    handlers on the parent track.
 *  2. Inline event-handler attributes (`onfoo="..."`) are a
 *    long-deprecated authoring style that bypasses React's synthetic
 *    event system, breaks SSR hydration parity, and triggers CSP
 *    `unsafe-inline` violations on hardened deployments.
 *  3. A stray `onpointerup="..."` would imply the filter rail
 *    intercepts pointer-up gestures at the container level — which
 *    would compete with the child tab buttons' click handlers and
 *    produce double-fire / event-ordering bugs on touch devices.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onpointerup`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpointerup`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onpointerup`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute and silent on `onpointerup`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — silent on
 *    `onpointerup`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onpointerup`. A regression that added
 *    `onpointerup="handler()"` (e.g. by mistakenly templating an
 *    inline pointer-up handler onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onpointerup") === false` AND
 * `track.getAttribute("onpointerup") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerup attribute (W3210)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerup attribute", () => {
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

    // The pin: NO onpointerup attribute is authored on the chip strip.
    // A regression that adds `onpointerup=""`, `onpointerup="handler()"`,
    // or any other inline pointer-up handler binding would fail here.
    expect(track!.hasAttribute("onpointerup")).toBe(false);
    expect(track!.getAttribute("onpointerup")).toBeNull();
  });
});
