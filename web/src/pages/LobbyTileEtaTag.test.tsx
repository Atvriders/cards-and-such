import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1609 — pin the SPAN tagName of the OUTER lobby tile-eta chip
 * rendered by `TileMetaChips` (LobbyPage.tsx ~L2735):
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >
 *     <span aria-hidden="true">…</span>
 *     <span className="tile-chip-label">{compactLabel}</span>
 *   </span>
 *
 * The outer eta chip MUST stay a phrasing-content `<span>`. It sits
 * inside the `.tile-chips` flex container as a sibling of the
 * difficulty chip (whose own outer SPAN tagName is pinned by W1599
 * `LobbyTileDiffTag`). A refactor reaching for `<div>` / `<button>` /
 * `<a>` would trigger a "block inside inline" hydration warning,
 * hijack the tile-level click target, or reflow the pill row into a
 * block layout that distorts the at-a-glance display.
 *
 * Sibling W1244 (LobbyTileEtaTitle)  pins the chip's `title`.
 * Sibling W1550 (LobbyTileEtaClass)  pins the chip's className token.
 * Sibling W1564 (LobbyTileEtaLabelClass) pins the inner label class.
 * Grepping `web/src/pages/Lobby*.test.tsx` for `tile-eta.*tagName`
 * (and vice-versa) returns zero hits, so the outer element type is
 * currently unpinned in executable assertions.
 *
 * Mirrors W1599 (LobbyTileDiffTag) exactly — same rationale, same
 * shape, just for the eta sibling chip.
 */
describe("LobbyPage — tile-chip-eta outer tagName (W1609)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-eta chip outer wrapper as a SPAN element", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length).toBeGreaterThan(0);

    // The assertion must hold for EVERY chip — a refactor that swaps a
    // single tile's wrapper to a `<div>` would otherwise slip through.
    for (const chip of Array.from(etaChips)) {
      expect(chip.tagName).toBe("SPAN");
    }
  });
});
