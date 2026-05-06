import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2787 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `aria-pressed` attribute.
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
 * `aria-pressed` is reserved for toggle-button widgets (role="button"
 * or native <button> elements that act as a toggle). It is explicitly
 * NOT a valid ARIA property for a `tablist` container — and even on
 * the per-tab children it would be semantically wrong (tabs use
 * `aria-selected`, never `aria-pressed`). Authoring `aria-pressed`
 * onto the chip-strip track would make the element fail
 * ARIA-conformance validation and could cause assistive tech to
 * mis-announce the entire filter rail as a toggle button rather than
 * a tablist.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-pressed`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-pressed`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-pressed` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767
 *    (LobbyChipStripNoAriaBusy), W2783 (LobbyChipStripNoAriaChecked),
 *    and the sibling no-aria-* pins (no-aria-controls, no-aria-current,
 *    no-aria-described-by, no-aria-disabled, no-aria-haspopup,
 *    no-aria-modal, no-aria-orientation) each pin absence of a
 *    DIFFERENT specific ARIA attribute on the same element — none of
 *    them assert anything about `aria-pressed`.
 *  - The per-chip `*AriaPressedDefault` pins (Arcade/Board/Cards/Dice/
 *    Hidden) assert pressed-state on the per-chip <button> children,
 *    not on the parent `.lobby-chips` track container.
 *  - None of the existing pins would catch a regression that added
 *    `aria-pressed="true"`, `aria-pressed="false"`, or
 *    `aria-pressed="mixed"` to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-pressed") === false`.
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
describe("LobbyPage — .lobby-chips tablist has no aria-pressed attribute (W2787)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-pressed attribute", () => {
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

    // The pin: NO aria-pressed attribute is authored on the chip strip.
    // `aria-pressed` is invalid on a `tablist` role per the ARIA spec,
    // and a regression that added `aria-pressed="true"`, `="false"`,
    // or `="mixed"` would mis-classify the filter rail as a toggle
    // button widget to assistive tech.
    expect(track!.hasAttribute("aria-pressed")).toBe(false);
  });
});
