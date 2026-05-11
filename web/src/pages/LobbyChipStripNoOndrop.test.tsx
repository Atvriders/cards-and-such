import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3201 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondrop` attribute.
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
 * `ondrop` is a global HTML event-handler content attribute that fires
 * the `drop` event when a draggable payload is released over the
 * element. On a `<div role="tablist">` it is meaningless: the chip
 * strip is a horizontally scrolling rail of `role="tab"` buttons that
 * filter the lobby by category — it is not a drop target. Authoring
 * `ondrop` on the chip strip would be wrong because:
 *  1. The chip strip never participates in HTML5 drag-and-drop. It has
 *     no `draggable` children, no `ondragover` preventDefault wiring,
 *     and no semantic notion of "receiving" a dropped payload.
 *  2. An inline `ondrop="..."` handler is an HTML event-handler
 *     content attribute, which is a CSP-relevant inline-script
 *     vector. Strict CSP policies (`script-src 'self'`,
 *     `unsafe-inline`-free) reject inline event handlers — leaking
 *     one onto the tablist would break the page under hardened CSP.
 *  3. Even an empty `ondrop=""` is parsed by browsers as a no-op
 *     handler binding, polluting the element's event-handler IDL
 *     attribute slot and confusing devtools / accessibility audits
 *     that introspect authored handlers.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its event-handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ondrop`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ondrop`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `ondrop`.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite),
 *    and the broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `ondrop`. A regression that added
 *    `ondrop="handleDrop(event)"` (e.g. by mistakenly templating a
 *    drag-and-drop handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("ondrop") === false` AND
 * `track.getAttribute("ondrop") === null`. Both forms are asserted
 * because `hasAttribute` is the canonical primitive for absence of a
 * content attribute (an authored `ondrop=""` would still flip
 * `hasAttribute` true), while `getAttribute(...) === null` provides
 * belt-and-braces coverage matching the rest of the No* pin family.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondrop attribute (W3201)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondrop attribute", () => {
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

    // The pin: NO ondrop attribute is authored on the chip strip.
    // A regression that adds `ondrop=""`, `ondrop="handleDrop(event)"`,
    // or any other inline drop-event handler binding would fail here.
    expect(track!.hasAttribute("ondrop")).toBe(false);
    expect(track!.getAttribute("ondrop")).toBeNull();
  });
});
