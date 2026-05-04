import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1275 — the FamilyCard's root `<button>` advertises
 * `aria-haspopup="dialog"` (LobbyPage.tsx ~L3220) so assistive
 * technology announces the affordance as opening a dialog rather than a
 * menu or a navigation. Sibling W892 (LobbyFamilyClick.test.tsx)
 * exercises the click → fam-picker open behaviour, but the static
 * a11y attribute itself is unpinned — a regression that dropped or
 * mistyped (e.g. `"menu"`, `"true"`) would slip past W892 because the
 * dialog still mounts on click.
 *
 * Adjacent coverage:
 *   - W874 (LobbyTileMenu.test.tsx ~L283) pins `aria-haspopup="menu"`
 *     on the right-click-driven SoloCard tile menu (different element,
 *     different value).
 *   - LobbyPage.test.tsx ~L570 pins `aria-haspopup="true"` on the
 *     overflow trigger (different element again).
 * Neither asserts the family-tile's own `"dialog"` annotation.
 *
 * `klondike` is the canonical family id reused by W761/W892/W609 — its
 * grid tile testid is demoted to `grid-tile-klondike` because klondike
 * is in FEATURED_IDS (LobbyPage.tsx L1690-L1701). Narrowing the grid
 * with the search box suppresses the featured strip so the assertion is
 * deterministic regardless of pagination boundaries.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W892/W874/W1158: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — family-card aria-haspopup=\"dialog\" (W1275)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("family-card button advertises aria-haspopup=\"dialog\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to a single deterministic tile. With a search
    // query active, the featured strip is suppressed (LobbyPage.tsx
    // ~L2000) so klondike surfaces only via its grid tile — whose
    // testid is demoted to `grid-tile-klondike` because klondike still
    // lives in FEATURED_IDS.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The static a11y annotation: SoloCard tiles use `"menu"` for the
    // right-click menu, family tiles use `"dialog"` for the picker.
    expect(tile).toHaveAttribute("aria-haspopup", "dialog");
  });
});
