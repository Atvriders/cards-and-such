import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2716 — the `chip-arcade` button (the per-category arcade chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~L2651-2666) MUST NOT carry a `tabindex` attribute in
 * its current shape. The chip is a native `<button>` (pinned by W1962
 * in LobbyChipTag.test.tsx) inside a `role="tablist"` chip-strip, and
 * its keyboard tab participation is supplied by the implicit native
 * BUTTON tab order (effective tabindex 0) — NOT by an explicit
 * `tabindex` attribute. Layering an explicit `tabindex` on top would
 * either:
 *   1. With `tabIndex={0}`, be redundant noise that locks-in a
 *      contract the chip-strip's roving-focus refactor would need to
 *      remove later, OR
 *   2. With `tabIndex={-1}`, silently REMOVE the chip-arcade button
 *      from the page tab order — a keyboard-accessibility regression
 *      where a sighted-keyboard user could no longer reach the arcade
 *      filter via Tab at all, OR
 *   3. With any positive `tabindex={N>0}`, hijack the document-wide
 *      tab order and break the natural reading-order flow that the
 *      WAI-ARIA tablist pattern requires.
 *
 * The shared `Chip` helper (LobbyPage.tsx ~L2651) emits exactly these
 * `<button>` props today: `type`, `role`, `aria-selected`,
 * `aria-pressed`, `className`, `onClick`, `data-testid`. No
 * `tabIndex` is passed. Pinning its absence on chip-arcade
 * specifically is the load-bearing guard against a future PR that
 * special-cases the arcade chip with an explicit tabindex (e.g. to
 * "fix" a perceived focus-management quirk).
 *
 * Why this needs its OWN per-chip pin:
 *  - W2228 (LobbyChipStripNoTabindex.test.tsx) pins absence of
 *    `tabindex` on the `.lobby-chips` tablist TRACK — the container
 *    DIV — not on any individual chip BUTTON inside it. A regression
 *    that added `tabIndex={-1}` to a single chip would slip through
 *    W2228 entirely.
 *  - W2127 (LobbyChipArrowLeftTabIndex.test.tsx) and the matching
 *    right-arrow pin assert that the overflow ARROW buttons DO carry
 *    `tabIndex={-1}`. Those are the OPPOSITE shape — they SHOULD be
 *    removed from tab order because they are duplicate affordances
 *    for the chip-strip's horizontal-scroll behaviour. The category
 *    chips are NOT duplicates of anything; they are the primary
 *    filter affordance and MUST stay in tab order with native (no
 *    explicit tabindex) semantics.
 *  - Sibling files such as LobbyChipArcadeRole.test.tsx (W2555),
 *    LobbyChipArcadeAriaSelectedDefault.test.tsx,
 *    LobbyChipArcadeAriaPressedDefault.test.tsx,
 *    LobbyChipArcadeType.test.tsx,
 *    LobbyChipArcadeNoAriaControls.test.tsx,
 *    LobbyChipArcadeNoAriaLabel.test.tsx (W2599),
 *    LobbyChipArcadeNoId.test.tsx and LobbyChipArcadeNoStyle.test.tsx
 *    all fetch the chip via `data-testid="chip-arcade"` but each pins
 *    a different attribute — none read `hasAttribute("tabindex")` on
 *    the chip-arcade button.
 *  - LobbyChipTag.test.tsx (W1962) mentions `tabindex=0` in its
 *    docblock as the IMPLICIT native-BUTTON behaviour but only
 *    asserts `tagName === "BUTTON"`. A `<button tabindex="-1">`
 *    would still pass W1962's tagName check while silently dropping
 *    the chip from the tab order.
 *
 * We resolve the chip via its stable `data-testid="chip-arcade"` (the
 * testId wired at LobbyPage.tsx ~L1970 via `testId={`chip-${cat}`}`)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `hasAttribute("tabindex")` to pin the
 * literal markup absence — confirming the attribute is not present at
 * all, rather than checking for a particular value (which would pass
 * for an empty `tabindex=""` or for `tabindex="-1"`, both of which
 * would themselves be regressions).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-arcade test) mirrors the per-surface-
 * attribute pattern used by LobbyChipArcadeNoAriaLabel.test.tsx
 * (W2599) and LobbyChipStripNoTabindex.test.tsx (W2228) so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-arcade has no tabindex attribute (W2716)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-arcade without a tabindex attribute (native BUTTON tab order applies)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade") as HTMLButtonElement;

    // The chip's tab participation is supplied by the implicit native
    // BUTTON tab order (effective tabindex 0). An explicit `tabindex`
    // attribute — at any value — would either be redundant noise
    // (tabindex="0"), silently drop the chip from the tab order
    // (tabindex="-1"), or hijack document-wide tab order
    // (tabindex="N>0"). `hasAttribute` reads the literal markup so a
    // regression that adds the prop fails here with a clear diff
    // regardless of the value supplied.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
