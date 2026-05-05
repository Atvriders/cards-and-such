import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2419 — pin that the LobbyPage family-aggregate tile (the FamilyCard
 * `<button>` at LobbyPage.tsx ~L3215) renders with the literal HTML
 * attribute `type="button"`. The default `<button>` `type` in HTML is
 * `"submit"`, which would cause the family tile to submit any enclosing
 * form on click — a latent foot-gun if the lobby grid ever ends up
 * inside a `<form>` (e.g. wrapped by a future search-form refactor).
 *
 * Why exact-string `"button"` rather than presence-only?
 *   - The default value if the attribute is dropped entirely is
 *     `"submit"`, NOT absence. `getAttribute("type")` returns `null`
 *     when JSX serializes nothing — so a regression that removed the
 *     prop would produce `null` here AND silently flip the runtime
 *     behaviour to submit-on-click. Pinning the literal string
 *     `"button"` catches both removal and any accidental retyping
 *     (e.g. `type="submit"`, `type="reset"`, `type="Button"`).
 *   - The matching SoloCard branch (LobbyPage.tsx ~L3370) — also a
 *     `<button>` rendering — is wired the same way, but the family
 *     branch has its own JSX literal at L3216, so a regression that
 *     flips one branch without the other would slip past any check
 *     anchored on the SoloCard testid.
 *
 * Existing-coverage audit (web/src/pages/Lobby*.test.tsx):
 *   - W1275 (LobbyFamilyHasPopup.test.tsx) pins the family button's
 *     `aria-haspopup="dialog"` annotation but does NOT inspect `type`.
 *   - W892 (LobbyFamilyClick.test.tsx) exercises the click-to-open
 *     picker behaviour (which would still fire even if `type` were
 *     `"submit"` — the onClick handler runs first, and form submission
 *     only matters if a form is present).
 *   - W1314 (LobbyFamilyCta.test.tsx), W1324 (LobbyFamilyStackGlyph),
 *     W1427 (LobbyFamilyVariantsChip), W2323 (LobbyTileCtaAriaHidden-
 *     Exact) all inspect *children* of the family button (`.tile-cta`,
 *     `.tile-family-stack`, `.tile-chip-variants`) — none assert any
 *     attribute on the outer `<button>` itself other than the W1275
 *     `aria-haspopup`.
 *   - LobbyTileAriaExpandedInitial / LobbyTileAriaHaspopup explicitly
 *     filter to `tagName === "A"`, so the family `<button>` is excluded
 *     from those audits.
 *   - No grep across `web/src/pages/Lobby*.test.tsx` finds a
 *     `toHaveAttribute("type", "button")` or equivalent assertion
 *     anchored on `tile-<family.id>` / `grid-tile-<family.id>`.
 *
 * `klondike` is the canonical multi-variant family reused by
 * W761/W892/W1275/W1314/W1324/W1427 — its grid tile testid is demoted
 * to `grid-tile-klondike` because klondike is in FEATURED_IDS
 * (LobbyPage.tsx L1690-L1701). Narrowing the grid via the search box
 * suppresses the featured strip so the family aggregate surfaces with
 * the demoted testid only — no ambiguity from the featured-strip slot.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1275/W1314/W1324/W1427/W2323: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — family-aggregate tile button type=\"button\" (W2419)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("family-aggregate tile button has type=\"button\" (exact string)", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to the canonical multi-variant family. With a
    // search query active, the featured strip is suppressed
    // (LobbyPage.tsx ~L2000) so klondike surfaces only via its grid
    // tile — whose testid is demoted to `grid-tile-klondike` because
    // klondike still lives in FEATURED_IDS (LobbyPage.tsx L1690-L1701).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The family-aggregate root is rendered as a `<button>` (LobbyPage
    // .tsx L3215) — the SoloCard branch is rendered as a `<Link>` (an
    // `<a>` in the DOM). Sanity-check the tagName so the type-attribute
    // assertion below is anchored on the right element under any future
    // refactor that might swap the testid mapping.
    expect(tile.tagName).toBe("BUTTON");

    // Primary contract: exact-string `"button"` (not `"submit"`, not
    // `"reset"`, not `null`). `getAttribute` returns `null` if the
    // attribute is dropped entirely — strict `=== "button"` rejects
    // that regression too.
    expect(tile.getAttribute("type")).toBe("button");
  });
});
