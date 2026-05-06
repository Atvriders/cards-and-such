import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2728 — the LobbyPage `chip-top-rated` Chip <button> (the dedicated
 * "Top rated" filter chip in the chip-strip, rendered through the
 * shared `Chip` helper at LobbyPage.tsx ~L1936) MUST NOT carry a
 * `tabindex` attribute in its current shape. The chip is a native
 * `<button>` (pinned by W1962 in LobbyChipTag.test.tsx) inside a
 * `role="tablist"` chip-strip, and its keyboard tab participation is
 * supplied by the implicit native BUTTON tab order (effective
 * tabindex 0) — NOT by an explicit `tabindex` attribute. Layering an
 * explicit `tabindex` on top would either:
 *   1. With `tabIndex={0}`, be redundant noise that locks-in a
 *      contract the chip-strip's roving-focus refactor would need to
 *      remove later, OR
 *   2. With `tabIndex={-1}`, silently REMOVE the chip-top-rated
 *      button from the page tab order — a keyboard-accessibility
 *      regression where a sighted-keyboard user could no longer reach
 *      the "Top rated" filter via Tab at all, OR
 *   3. With any positive `tabindex={N>0}`, hijack the document-wide
 *      tab order and break the natural reading-order flow that the
 *      WAI-ARIA tablist pattern requires.
 *
 * The shared `Chip` helper emits exactly these `<button>` props
 * today: `type`, `role`, `aria-selected`, `aria-pressed`,
 * `className`, `onClick`, `data-testid`. No `tabIndex` is passed.
 * Pinning its absence on chip-top-rated specifically is the
 * load-bearing guard against a future PR that special-cases the
 * "Top rated" chip with an explicit tabindex (e.g. to coordinate
 * with the unrelated drawer top-rated entry at LobbyPage.tsx ~L1829
 * which DOES carry a roving `tabIndex` — that drawer-button shape
 * MUST NOT leak onto the chip-strip chip).
 *
 * Why this needs its OWN per-chip pin on chip-top-rated specifically:
 *  - W2228 (LobbyChipStripNoTabindex.test.tsx) pins absence of
 *    `tabindex` on the `.lobby-chips` tablist TRACK — the container
 *    DIV — not on any individual chip BUTTON inside it. A regression
 *    that added `tabIndex={-1}` to a single chip would slip through
 *    W2228 entirely.
 *  - W2724 (LobbyChipAllNoTabindex.test.tsx) and W2716
 *    (LobbyChipArcadeNoTabindex.test.tsx) and the matching
 *    board/cards/dice/favorites/recently chip-No-Tabindex pins
 *    assert the same shape on each per-category chip but each
 *    fetches a DIFFERENT `data-testid`. None of them read the
 *    chip-top-rated button.
 *  - Sibling files such as LobbyChipTopRatedNoAriaControls,
 *    LobbyChipTopRatedNoAriaDisabled, LobbyChipTopRatedNoAriaLabel,
 *    LobbyChipTopRatedNoAutofocus, LobbyChipTopRatedNoForm,
 *    LobbyChipTopRatedNoId, LobbyChipTopRatedNoName,
 *    LobbyChipTopRatedNoStyle, LobbyChipTopRatedNoValue,
 *    LobbyChipTopRatedRole, LobbyChipTopRatedType and
 *    LobbyChipTopRatedGlyphAria all fetch the chip via
 *    `data-testid="chip-top-rated"` but each pins a different
 *    attribute — none read `hasAttribute("tabindex")` on the
 *    chip-top-rated button.
 *  - LobbyChipTag.test.tsx (W1962) only asserts
 *    `tagName === "BUTTON"`. A `<button tabindex="-1">` would still
 *    pass W1962's tagName check while silently dropping the chip
 *    from the tab order.
 *
 * We resolve the chip via its stable `data-testid="chip-top-rated"`
 * (the testId wired at LobbyPage.tsx ~L1940 via
 * `testId="chip-top-rated"`) so the lookup is locale-independent and
 * immune to translation-key changes. The assertion uses
 * `hasAttribute("tabindex")` to pin the literal markup absence —
 * confirming the attribute is not present at all, rather than
 * checking for a particular value (which would pass for an empty
 * `tabindex=""` or for `tabindex="-1"`, both of which would
 * themselves be regressions).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-top-rated test) mirrors the per-
 * surface-attribute pattern used by LobbyChipAllNoTabindex.test.tsx
 * (W2724) and LobbyChipArcadeNoTabindex.test.tsx (W2716) so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-top-rated has no tabindex attribute (W2728)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chip-top-rated without a tabindex attribute (native BUTTON tab order applies)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated") as HTMLButtonElement;

    // Sanity: confirm we pinned the actual chip-top-rated <button>
    // wrapper and not a child span/glyph. The `tabindex` attribute
    // is meaningful on any element, so if a future refactor moved
    // the testid down onto an inner span this assertion would still
    // run but against the wrong target — guard the tagName explicitly
    // so the failure mode is a clear "wrong element" diff rather
    // than a silent drift.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on
    // chip-top-rated. The chip's tab participation is supplied by
    // the implicit native BUTTON tab order (effective tabindex 0).
    // An explicit `tabindex` attribute — at any value — would
    // either be redundant noise (tabindex="0"), silently drop the
    // chip from the tab order (tabindex="-1"), or hijack
    // document-wide tab order (tabindex="N>0"). `hasAttribute`
    // reads the literal markup so a regression that adds the prop
    // fails here with a clear diff regardless of the value
    // supplied.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
