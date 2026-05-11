import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3309 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onslotchange` attribute.
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
 * `onslotchange` is the legacy inline event handler attribute for the
 * `slotchange` event, which is fired on a `<slot>` element when the
 * nodes assigned to it change. Its only meaningful host is a `<slot>`
 * element inside a shadow DOM tree. On a `<div role="tablist">` it is
 * meaningless: the chip strip is a plain light-DOM flex/scroll
 * container of `role="tab"` buttons — it is NOT a `<slot>`, it is not
 * inside a shadow root, and it never emits a `slotchange` event.
 * Authoring `onslotchange` on the chip strip would be wrong because:
 *  1. The element is a `<div>`, not a `<slot>`. The `slotchange` event
 *     is only ever dispatched at `<slot>` elements (per the DOM spec
 *     and HTML living standard). A `<div>` will never fire one, so the
 *     handler will never run — it would be dead inline JavaScript.
 *  2. Inline `on*=` attributes execute their string contents as
 *     JavaScript in the global scope, which is a CSP/XSS hazard and is
 *     forbidden by every reasonable `script-src` / `unsafe-inline`
 *     policy. A stray `onslotchange="alert(1)"` is exactly the kind of
 *     attribute injection that CSP audits flag.
 *  3. Validators (W3C Nu, html-validate) flag inline event handlers on
 *     elements that cannot fire the event as invalid/unknown attribute
 *     usage, polluting CI accessibility and lint reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onslotchange`.
 *  - W2903 (LobbyChipStripNoCite), W2894 (LobbyChipStripNoCoords),
 *    W2754 (LobbyChipsNoAriaMultiselectable), and the broad family of
 *    LobbyChipStripNo* pins each cover one specific
 *    global/legacy/aria/event-handler attribute's absence — none of
 *    them currently cover `onslotchange`. A regression that added
 *    `onslotchange="..."` (e.g. by mistakenly templating a slot-style
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onslotchange") === false` AND
 * `track.getAttribute("onslotchange") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an authored HTML
 * attribute — `onslotchange=""` with an empty value is still authored,
 * and any string value is a regression. The `getAttribute(...) === null`
 * companion assertion guards against any DOM quirk where attribute
 * presence and value retrieval could diverge.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onslotchange attribute (W3309)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onslotchange attribute", () => {
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

    // The pin: NO onslotchange attribute is authored on the chip strip.
    // A regression that adds `onslotchange=""`, `onslotchange="..."`,
    // or any other inline slotchange handler binding would fail here.
    expect(track!.hasAttribute("onslotchange")).toBe(false);
    expect(track!.getAttribute("onslotchange")).toBeNull();
  });
});
