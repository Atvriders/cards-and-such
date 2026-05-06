import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2730 — the drawer-nav element rendered by LobbyPage at
 * LobbyPage.tsx ~L1769 — `<nav class="lobby-drawer-nav"
 * role="tablist" aria-label="Filter by category (drawer)" ...>` —
 * MUST NOT carry a `tabindex` attribute in its current shape. The
 * element is a NAV that wraps a vertical column of `DrawerLink`
 * BUTTONs (the sidebar mirror of the horizontal `.lobby-chips`
 * chip-strip). Each individual DrawerLink already participates in the
 * page tab order via its native `<button>` semantics (effective
 * tabindex 0). Layering an explicit `tabindex` onto the surrounding
 * NAV container would either:
 *
 *   1. With `tabIndex={0}`, INSERT the NAV container itself into the
 *      page tab order as a focusable wrapper — a screen-reader and
 *      keyboard regression where Tab would land on the empty NAV
 *      element (which has no actionable handler beyond
 *      `onKeyDown={onDrawerKeyDown}`, which is roving-focus arrow-key
 *      handling, NOT Enter/Space activation) before reaching the
 *      first DrawerLink BUTTON inside it. A keyboard user pressing
 *      Tab would burn one extra Tab to step through the wrapper for
 *      no payoff, and a screen reader would announce the NAV's
 *      `aria-label="Filter by category (drawer)"` on focus — useful
 *      as a landmark label, NOT as a focusable-element name. OR
 *
 *   2. With `tabIndex={-1}`, programmatically mark the NAV as a
 *      `.focus()`-able element (without inserting it into Tab order).
 *      That would invite future code to call `drawerNavRef.focus()`
 *      to "shift focus to the drawer" on open — a focus-management
 *      anti-pattern for a tablist (the WAI-ARIA tablist pattern moves
 *      focus to the ACTIVE TAB on container focus, not to the
 *      container itself). It would also make the NAV a target for
 *      programmatic focus from the drawer-toggle button's onClick
 *      handler, breaking the existing roving-focus contract handled
 *      via `onDrawerKeyDown`. OR
 *
 *   3. With any positive `tabindex={N>0}`, hijack the document-wide
 *      tab order and break the natural reading-order flow that the
 *      WAI-ARIA tablist pattern requires.
 *
 * The NAV today emits exactly four React props: `className`, `role`,
 * `aria-label`, `onKeyDown`. No `tabIndex` is passed. The pin guards
 * against a future PR that special-cases the drawer NAV with an
 * explicit tabindex (e.g. to "fix" a perceived focus-management quirk
 * around drawer expand/collapse, or to implement a "focus the drawer"
 * keyboard shortcut by attaching it to the wrapper rather than to the
 * active DrawerLink).
 *
 * Why this needs its OWN per-surface pin:
 *  - W2228 (LobbyChipStripNoTabindex.test.tsx) pins absence of
 *    `tabindex` on the `.lobby-chips` HORIZONTAL chip-strip TRACK —
 *    the DIV chip-strip used outside the drawer. That assertion
 *    targets `.lobby-chips`, not `.lobby-drawer-nav`, so a regression
 *    that added `tabIndex={-1}` only to the drawer-nav would slip
 *    through W2228 entirely. The two tablists are physically distinct
 *    DOM nodes with different selectors and different surrounding
 *    containers (one is the inline filter chip-strip, the other is
 *    the collapsible sidebar drawer).
 *  - W2716 (LobbyChipArcadeNoTabindex.test.tsx) and the matching
 *    per-chip No-Tabindex pins assert the same shape on each per-
 *    category chip BUTTON inside the chip-strip. None of them read
 *    the drawer NAV CONTAINER — they read individual `<button>`
 *    chips via their `data-testid`.
 *  - W2724 (LobbyChipAllNoTabindex.test.tsx) pins absence of
 *    `tabindex` on the `chip-all` BUTTON — a single chip inside the
 *    horizontal chip-strip, not the drawer NAV container.
 *  - W2312 (LobbyDrawerToggleNoTabindex.test.tsx) pins absence of
 *    `tabindex` on the drawer TOGGLE BUTTON (the chevron `‹`/`›`
 *    button at LobbyPage.tsx ~L1761), not on the NAV element it
 *    expands/collapses.
 *  - Sibling drawer-NAV files (LobbyDrawerNavClass.test.tsx,
 *    LobbyDrawerNavNoStyle.test.tsx, LobbyDrawerNavMulti.test.tsx)
 *    each pin a different attribute on the NAV element — none of
 *    them call `hasAttribute("tabindex")` on the drawer-nav.
 *
 * We resolve the NAV via `document.querySelector(".lobby-drawer-nav")`
 * (rather than via a `data-testid`, which the NAV does not carry —
 * see LobbyPage.tsx ~L1769) so the lookup is locale-independent and
 * survives unrelated edits to its `aria-label` text. The assertion
 * uses `hasAttribute("tabindex")` to pin the literal markup absence —
 * confirming the attribute is not present at all, rather than checking
 * for a particular value (which would pass for an empty `tabindex=""`
 * or for `tabindex="-1"`, both of which would themselves be the
 * regressions this pin guards against).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing drawer-nav test) mirrors the per-surface-
 * attribute pattern used by LobbyChipStripNoTabindex.test.tsx (W2228)
 * and LobbyChipAllNoTabindex.test.tsx (W2724) so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — drawer-nav has no tabindex attribute (W2730)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders <nav class='lobby-drawer-nav'> without a tabindex attribute (children supply tab order)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const nav = document.querySelector(".lobby-drawer-nav");

    // Sanity: the NAV element exists in the rendered DOM. If this
    // ever fails it means the drawer-nav surface itself was removed
    // or renamed — the W2730 contract is moot in that case but the
    // failure mode should be clearly visible rather than masked.
    expect(nav).not.toBeNull();

    // Core pin: the literal `tabindex` attribute is absent. Children
    // of the NAV (the DrawerLink BUTTONs) supply tab participation
    // via native BUTTON semantics; the WAI-ARIA tablist pattern does
    // NOT require the tablist CONTAINER itself to be focusable.
    expect((nav as Element).hasAttribute("tabindex")).toBe(false);
  });
});
