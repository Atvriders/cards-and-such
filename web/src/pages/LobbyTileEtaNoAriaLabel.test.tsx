import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2379 — pin that the per-tile `tile-chip-eta` chip rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO `aria-label`
 * attribute.
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * The eta chip exposes its label exclusively through visible text
 * ("⏱ <mins>m") plus the `title` tooltip ("Estimated playtime: …").
 * It deliberately does NOT carry an `aria-label` — adding one would
 * either duplicate the title (forcing assistive tech to announce the
 * value twice) or worse, override the human-readable visible text
 * with a less descriptive accessible name. The sibling tile-difficulty
 * chip DOES carry `aria-label="Difficulty: …"` because its visible
 * content is purely decorative dots; the eta chip's `<mins>m` text is
 * itself the accessible name, so an `aria-label` here would be a
 * regression.
 *
 * Sibling tests already pin the chip's tagName (W1609 LobbyTileEtaTag),
 * className tokens (W1550 LobbyTileEtaClass), exact className
 * (LobbyTileEtaClassExact / W1642), label class (W1564
 * LobbyTileEtaLabelClass), inner glyph aria-hidden (W1748
 * LobbyTileEtaGlyphAria), title shape (W1244 LobbyTileEtaTitle), exact
 * title string (W2311 LobbyTileEtaTitleAttr), and absence of `id`
 * (W2075), `style` (W2157), `role` (W2211), `tabindex`, and
 * `aria-hidden`. NONE of those exercise the `aria-label` attribute —
 * grepping `web/src/pages/Lobby*.test.tsx` for `tile-eta` together
 * with `aria-label` shows the only hit is the unrelated
 * `LobbyTilePlayCtaHidden` test (which only mentions tile-eta in a
 * code comment, not an assertion). A silent regression that added
 * e.g. `aria-label="eta"` would still pass every existing tile-eta
 * assertion.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2075 / W2157 / W2211
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta has no aria-label attribute (W2379)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without an `aria-label` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor shared by sibling tile-eta tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length, "no tile-eta chips rendered").toBeGreaterThan(0);

    // Core assertion: the chip carries no `aria-label` attribute.
    // Using `hasAttribute` (rather than reading `getAttribute`) catches
    // both the missing-attr and explicit-empty-string cases while still
    // failing if any non-empty aria-label is added.
    const first = etaChips[0]!;
    expect(first.hasAttribute("aria-label")).toBe(false);
    expect(first.getAttribute("aria-label")).toBeNull();
  });
});
