import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1427 — the FamilyCard's chips row renders an extra "+N variants"
 * chip (LobbyPage.tsx ~L3273) whenever `memberCount > 1`. The chip is
 * decorated with the `tile-chip tile-chip-variants` class pair AND
 * carries a screen-reader-targeted `aria-label` of the form
 * `<N - 1> more variants`. Stripping either the className (visual) or
 * the aria-label (assistive) would silently regress the per-tile
 * variant disclosure.
 *
 * Adjacent coverage:
 *   - W713 pins the upper-right `fam-count-<id>` "<N> variants" badge
 *     text contract.
 *   - W1324 (LobbyFamilyStackGlyph.test.tsx) pins the inner `≡` glyph
 *     a11y annotation.
 *   - W1275 / W1314 pin button-level aria-haspopup and CTA copy.
 * None inspect the inline `tile-chip-variants` chip — that surface is
 * the regression target here.
 *
 * `klondike` is the canonical multi-variant family used by sibling
 * W713/W1275/W1324 tests. Narrowing via the search box suppresses the
 * featured strip so the within-tile lookup is unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1275/W1314/W1324: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — family-card +N variants chip (W1427)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("renders tile-chip-variants chip with '+<N-1> variants' label and matching aria-label", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow to a single deterministic tile. Featured strip is
    // suppressed under an active query, so the klondike main-grid tile
    // surfaces with the `grid-tile-klondike` testid override.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The `+N variant(s)` chip lives inside the family card's chips
    // row. It is the only descendant carrying the
    // `tile-chip-variants` class — querySelector pins the exact node
    // under test without dragging in TileMetaChips siblings.
    const variantsChip = tile.querySelector(".tile-chip-variants");
    expect(variantsChip).not.toBeNull();
    // Visual contract: the chip pairs the generic `tile-chip` styling
    // with the variant-specific modifier. Dropping either side would
    // regress hover / colour treatment.
    expect(variantsChip).toHaveClass("tile-chip");
    expect(variantsChip).toHaveClass("tile-chip-variants");

    // Read the upper-right `fam-count-<id>` badge to derive the
    // expected (N - 1) suffix without hard-coding the family size —
    // adding a new klondike variant should keep this test green.
    const countBadge = within(tile).getByTestId(`fam-count-${FAMILY_ID}`);
    const countMatch = (countBadge.textContent ?? "").match(/(\d+)\s+variants?$/);
    expect(countMatch).not.toBeNull();
    const memberCount = Number(countMatch?.[1] ?? "0");
    expect(memberCount).toBeGreaterThanOrEqual(2);
    const expectedExtra = memberCount - 1;

    // Visible chip copy: "+<N-1> variant" (N-1 === 1) or
    // "+<N-1> variants" (N-1 !== 1). Klondike has >=2 members so the
    // chip is always present; pluralisation must follow the same
    // ternary as the upper-right badge.
    const expectedText = `+${expectedExtra} variant${expectedExtra === 1 ? "" : "s"}`;
    expect(variantsChip?.textContent).toBe(expectedText);

    // Assistive contract: aria-label restates the chip without the
    // leading "+" punctuation so screen readers announce
    // "<N-1> more variants" rather than the literal plus glyph.
    const expectedAria = `${expectedExtra} more variant${expectedExtra === 1 ? "" : "s"}`;
    expect(variantsChip).toHaveAttribute("aria-label", expectedAria);
  });
});
