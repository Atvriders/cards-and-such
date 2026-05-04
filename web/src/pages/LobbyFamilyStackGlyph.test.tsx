import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1324 — the FamilyCard's variant-count badge prefixes the count with a
 * decorative `≡` stack glyph rendered inside `<span class="tile-family-
 * stack" aria-hidden="true">≡</span>` (LobbyPage.tsx ~L3246). The glyph
 * is a purely visual cue — assistive tech reads the badge label via the
 * surrounding text ("<N> variants") and the parent `aria-label` on the
 * family-card button (W1275 sibling). Stripping the `aria-hidden`
 * annotation would cause screen readers to vocalise the bare unicode
 * codepoint as part of the badge, polluting the announcement.
 *
 * Adjacent coverage:
 *   - W713 (LobbyPage.test.tsx ~L2620) pins the textual "<N> variants"
 *     contract on the same `fam-count-<id>` testid but does NOT inspect
 *     the inner glyph span — its regex strips the leading `≡`.
 *   - W1275 (LobbyFamilyHasPopup.test.tsx) pins `aria-haspopup="dialog"`
 *     on the outer button.
 *   - W1314 (LobbyFamilyCta.test.tsx) pins the footer "Pick" CTA copy.
 * None inspect the `tile-family-stack` decorative glyph's a11y opacity.
 *
 * `klondike` is the canonical multi-variant family reused by
 * W761/W892/W1275/W1314/W713 — its grid tile testid is demoted to
 * `grid-tile-klondike` because klondike is in FEATURED_IDS
 * (LobbyPage.tsx L1690-L1701). Narrowing via the search box suppresses
 * the featured strip so the within-tile lookup is unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1275/W1314/W892: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — family-card stack glyph aria-hidden (W1324)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("family-card variant-count badge's ≡ glyph is aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to a single deterministic tile. With a search
    // query active, the featured strip is suppressed (LobbyPage.tsx
    // ~L2000) so klondike surfaces only via its grid tile.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The fam-count badge wraps the decorative stack glyph as its first
    // child. The glyph's `aria-hidden="true"` annotation is the surface
    // under test — without it, screen readers would announce the bare
    // codepoint alongside the "<N> variants" label.
    const countBadge = within(tile).getByTestId(`fam-count-${FAMILY_ID}`);
    const glyph = countBadge.querySelector(".tile-family-stack");
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    // Belt-and-braces: the glyph's literal content is the `≡` stack
    // marker. A regression that swapped the glyph (or emptied it) would
    // surface here even when the aria-hidden annotation is preserved.
    expect(glyph?.textContent).toBe("≡");
  });
});
