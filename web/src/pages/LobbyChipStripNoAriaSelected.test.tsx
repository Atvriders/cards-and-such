import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2789 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `aria-selected` attribute.
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
 * `aria-selected` is reserved for selectable child items inside a
 * container widget — `tab`, `option`, `gridcell`, `row`, `columnheader`,
 * `rowheader`, `treeitem`. It is explicitly NOT a valid ARIA property
 * for the `tablist` *container* itself (which is what `.lobby-chips`
 * is). Authoring `aria-selected` onto the chip-strip track would make
 * the element fail ARIA-conformance validation and could confuse
 * assistive tech into announcing the entire filter rail as a single
 * selectable item rather than a container of selectable tabs.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-selected`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-selected`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-selected` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767
 *    (LobbyChipStripNoAriaBusy), W2783 (LobbyChipStripNoAriaChecked),
 *    and the sibling no-aria-* pins (no-aria-controls, no-aria-current,
 *    no-aria-described-by, no-aria-disabled, no-aria-haspopup,
 *    no-aria-modal, no-aria-orientation) each pin absence of a
 *    DIFFERENT specific ARIA attribute on the same element — none of
 *    them assert anything about `aria-selected`.
 *  - The per-child pins (e.g. LobbyChipArcadeAriaSelectedDefault,
 *    LobbyChipBoardAriaSelectedDefault, LobbyChipCardsAriaSelectedDefault,
 *    LobbyChipDiceAriaSelectedDefault, LobbyChipSolitaireAriaSelectedDefault)
 *    pin `aria-selected` *presence and value* on individual `<button
 *    role="tab">` chips — they say nothing about the parent track.
 *  - None of the existing pins would catch a regression that added
 *    `aria-selected="true"` or `aria-selected="false"` to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-selected") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-selected attribute (W2789)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-selected attribute", () => {
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

    // The pin: NO aria-selected attribute is authored on the chip
    // strip container. `aria-selected` is invalid on a `tablist` role
    // per the ARIA spec (it belongs on the per-tab children), and a
    // regression that added `aria-selected="true"` or `="false"` to
    // the container would mis-classify the filter rail itself as a
    // selectable item to assistive tech.
    expect(track!.hasAttribute("aria-selected")).toBe(false);
  });
});
