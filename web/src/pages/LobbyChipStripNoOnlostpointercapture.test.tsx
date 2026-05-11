import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3228 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onlostpointercapture` attribute.
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
 * `onlostpointercapture` is the inline-attribute form of the
 * `lostpointercapture` event handler — fired when an element loses
 * pointer capture (e.g. after a call to `releasePointerCapture` or
 * when capture is implicitly released). On the chip-strip filter
 * rail there is no `setPointerCapture` call, no pointer-capture
 * lifecycle, and no semantic meaning for losing capture. Authoring
 * it on the tablist would be wrong because:
 *  1. The chip strip is a horizontally-scrolling flex container of
 *     `role="tab"` buttons — it never captures the pointer, so it
 *     can never lose capture. The handler would never fire.
 *  2. Inline `on*` attributes execute their string body as JavaScript
 *     in the global scope, bypassing React's synthetic-event system
 *     and any CSP `script-src` policy that forbids inline handlers.
 *     A stray `onlostpointercapture="doStuff()"` would be a CSP
 *     violation and a security smell.
 *  3. React routes pointer-capture events through its `onLostPointerCapture`
 *     synthetic prop (camelCase, not the lowercase HTML attribute) —
 *     so the lowercase DOM attribute being present at all is a sign
 *     that something is templating raw HTML onto the element rather
 *     than going through React's prop pipeline.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` pins:
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source URL attribute, unrelated to pointer-capture events.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on event handlers.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to pointer events.
 *  - The broad family of LobbyChipStripNo* pointer-event pins
 *    (NoOnpointerdown, NoOnpointerup, NoOnpointermove, NoOnpointerover,
 *    NoOnpointerout, NoOnpointerenter, NoOnpointerleave, NoOnpointercancel,
 *    NoOnGotPointerCapture if any) each pin one specific pointer-event
 *    handler attribute's absence — `onlostpointercapture` is its own
 *    distinct event in the Pointer Events spec and needs its own pin.
 *    A regression that added `onlostpointercapture="..."` (e.g. by
 *    a mistaken inline-handler refactor) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onlostpointercapture") === false` and
 * `track.getAttribute("onlostpointercapture") === null`. Both forms
 * guard the absence — `hasAttribute` is the canonical primitive, and
 * `getAttribute(...) === null` doubles as a belt-and-braces check
 * since an empty-string value would still authoring the attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onlostpointercapture attribute (W3228)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onlostpointercapture attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO onlostpointercapture attribute is authored on the
    // chip strip. A regression that adds `onlostpointercapture=""`,
    // `onlostpointercapture="handler()"`, or any other inline
    // pointer-capture-loss handler binding would fail here.
    expect(track!.hasAttribute("onlostpointercapture")).toBe(false);
    expect(track!.getAttribute("onlostpointercapture")).toBeNull();
  });
});
