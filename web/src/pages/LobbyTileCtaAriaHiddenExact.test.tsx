import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2323 — the FamilyCard's footer CTA span (LobbyPage.tsx ~L3291) carries
 * `aria-hidden="true"` so the visible "Pick" affordance + chevron SVG is
 * suppressed from assistive tech. The surrounding `<button>` already
 * exposes the family title and `aria-haspopup="dialog"` (W1275) as the
 * accessible name, so leaking "Pick" through to AT would either duplicate
 * the announcement or — with `aria-hidden="false"` — invert the contract.
 *
 * Existing coverage of `.tile-cta` aria-hidden:
 *   - W1344 (LobbyTilePlayCtaHidden.test.tsx) pins the SOLO-tile path
 *     (`texas-holdem`) — `.tile-cta` carries `aria-hidden="true"`. The
 *     family branch in LobbyPage.tsx is a separate render at L3291 with
 *     its own JSX literal, so a regression that flipped one branch
 *     without the other would slip past W1344.
 *   - W1314 (LobbyFamilyCta.test.tsx) pins the family `.tile-cta` TEXT
 *     ("Pick" not "Play") but does NOT assert the `aria-hidden`
 *     attribute — its `toHaveTextContent` check survives a flip to
 *     `aria-hidden="false"` or attribute removal.
 *   - W1324 (LobbyFamilyStackGlyph.test.tsx) pins `aria-hidden="true"`
 *     on the `.tile-family-stack` glyph (a different element).
 *   - W2208 (LobbyTileFootAriaHidden.test.tsx) pins the ABSENCE of
 *     `aria-hidden` on the `.tile-foot` wrapper itself.
 * None of these pin the family `.tile-cta`'s exact `aria-hidden` value.
 *
 * Pinning the exact string `"true"` (not just presence) guards against
 * a flip to `aria-hidden="false"` — which renders as the literal string
 * "false" and would still satisfy a `hasAttribute` check while inverting
 * the accessibility contract.
 *
 * `klondike` is the canonical family id reused by
 * W761/W892/W1275/W1314/W1324 — its grid tile testid is demoted to
 * `grid-tile-klondike` because klondike is in FEATURED_IDS
 * (LobbyPage.tsx L1690-L1701). Narrowing via the search box suppresses
 * the featured strip so the within-tile `.tile-cta` lookup is unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1275/W1314/W1324/W1344: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — family-card .tile-cta aria-hidden exact value (W2323)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("family-tile .tile-cta carries aria-hidden=\"true\" (exact string)", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to the canonical multi-variant family. With a
    // search query active, the featured strip is suppressed
    // (LobbyPage.tsx ~L2000) so klondike surfaces only via its grid tile.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The family footer CTA is rendered inside `.tile-cta` (LobbyPage.tsx
    // ~L3291). It contains the literal "Pick" + chevron SVG; the entire
    // span is hidden from AT because the wrapping `<button>` already owns
    // the accessible name + `aria-haspopup="dialog"`.
    const cta = tile.querySelector(".tile-cta");
    expect(cta).not.toBeNull();
    // Belt-and-braces: confirm we're anchored on the FAMILY CTA ("Pick"),
    // not a SoloCard branch ("Play" — pinned by W1344). A regression that
    // replaced the FamilyCard branch with the SoloCard branch would
    // surface here before the aria-hidden assertion fires vacuously.
    expect(cta).toHaveTextContent(/^Pick/);
    // The actual contract: exact-string equality on the attribute value.
    // `toBe("true")` rejects `aria-hidden="false"` (still attribute-
    // present but inverted) where `toHaveAttribute("aria-hidden")` alone
    // — or `hasAttribute` — would not.
    expect(cta!.getAttribute("aria-hidden")).toBe("true");
  });
});
