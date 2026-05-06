import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2809 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `aria-keyshortcuts` attribute.
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
 * `aria-keyshortcuts` is meant to advertise specific keyboard
 * shortcuts (e.g. "Alt+S") that a user can press to operate a
 * widget without interacting with it directly. The chip-strip
 * tablist itself is operated via the standard tablist keyboard
 * model (Tab to focus, Arrow keys to navigate within) supplied by
 * the role and the per-chip tabIndex management — it is NOT
 * bound to any global hotkey ("press X to jump to filters") or
 * page-level chord. There is no documented shortcut that activates
 * the chip rail or any individual chip from anywhere on the
 * lobby, so authoring `aria-keyshortcuts` on the tablist would
 * either lie to assistive tech (announcing a key combination that
 * does nothing) or, if some future developer wired a chord and
 * forgot to update the attribute, drift out of sync silently.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `aria-keyshortcuts`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-keyshortcuts`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal.
 *  - W2767 (LobbyChipStripNoAriaBusy) pins absence of `aria-busy`
 *    — orthogonal.
 *  - The family of LobbyChipStripNoAria* pins (NoAriaChecked,
 *    NoAriaControls, NoAriaCurrent, NoAriaDescribedBy,
 *    NoAriaDisabled, NoAriaExpanded, NoAriaHaspopup, NoAriaModal,
 *    NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRequired, NoAriaSelected) collectively pins absence of
 *    those specific attributes — none of them touch
 *    `aria-keyshortcuts`.
 *  - None of the existing pins would catch a regression that added
 *    `aria-keyshortcuts="Alt+F"` (or any other shortcut string) to
 *    the inner `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-keyshortcuts") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, matching
 * the accessor screen readers / accessibility audits use to decide
 * whether to announce shortcut hints.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-keyshortcuts attribute (W2809)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-keyshortcuts attribute", () => {
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

    // The pin: NO aria-keyshortcuts attribute is authored on the
    // chip strip. A regression that adds `aria-keyshortcuts="Alt+F"`
    // (or similar) — promising a global hotkey that does not exist,
    // or that exists but is undocumented and untested — would fail
    // here.
    expect(track!.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});
