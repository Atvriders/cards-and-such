import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1354 — pin the `tile--featured` className modifier on featured-strip
 * tiles' interactive root.
 *
 * The featured tile renderers (LobbyPage.tsx ~L2051 for the
 * recommended-strip `<Link>` root, ~L3373 for the family-anchor
 * `<button>`, ~L3433 for the standalone `<Link>`) all build their root
 * className as `tile tile--cat-${...} tile--featured`. The
 * `tile--featured` modifier is product-visible chrome — `LobbyPage.css`
 * keys the featured strip's tile sizing, sheen overlay, and badge slot
 * styling off `.tile--featured`, so dropping or renaming the modifier
 * would silently break the featured visual treatment.
 *
 * Sibling W1334 (LobbyTileWrapClass) pins the parent `.lobby-tile-wrap`
 * wrapper className, sibling W1244 (LobbyTileEtaTitle) pins the eta chip
 * title, and W874/W1267 (LobbyTileMenu) pin `aria-haspopup="menu"` and
 * `aria-expanded` on the regular tile root. The featured tile root's
 * `tile--featured` modifier had no dedicated assertion — searching
 * `Lobby*.test.tsx` for `tile--featured` returns no hits.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W1244 / W1334: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — featured tile className modifier (W1354)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders featured-strip tiles with the `tile--featured` modifier", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // The featured strip renders inside `<section class="lobby-featured">`
    // — every interactive root inside it (Link/button/anchor) should
    // carry the `tile--featured` modifier.
    const featuredSection = document.querySelector<HTMLElement>(
      "section.lobby-featured",
    );
    expect(featuredSection).not.toBeNull();

    const featTiles = featuredSection!.querySelectorAll<HTMLElement>(
      ".lobby-grid--featured > .lobby-tile-wrap > .tile",
    );
    expect(featTiles.length).toBeGreaterThan(0);

    for (const tile of Array.from(featTiles)) {
      expect(tile.className).toMatch(/\btile--featured\b/);
    }
  });
});
