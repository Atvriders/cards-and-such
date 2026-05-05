import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2217 — pin that the solo-card `.tile-meta` wrapper renders WITHOUT
 * a `role` attribute.
 *
 * The lobby's per-tile `<div className="tile-meta">` row (LobbyPage.tsx
 * ~L2059) is a presentational flex container that groups the category
 * chip and (optionally) a multiplayer badge. It is NOT a landmark, list,
 * group, toolbar, or any other ARIA-classified region — it is purely a
 * layout primitive. Adding a `role` attribute (e.g. `role="group"` or
 * `role="toolbar"`) would inject an extra accessibility-tree node per
 * tile, polluting screen-reader navigation across the dozens of cards
 * the lobby renders simultaneously.
 *
 * Sibling tests pin the wrapper's tagName/className (W1670), absence of
 * `id` (W2073), absence of inline `style` (LobbyTileMetaNoStyle), and
 * `aria-hidden` posture (LobbyTileMetaAriaHidden). NONE of them assert
 * the absence of a `role` attribute, so a regression that added
 * `role="group"` to the meta row would slip past the existing suite.
 *
 * Lives in a NEW SIBLING file per the same rationale as the prior
 * LobbyTileMeta* splits: it shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file or
 * to its sibling tile-meta tests.
 */
describe("LobbyPage — solo-card tile-meta wrapper has no role attribute (W2217)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-meta` wrapper without a `role` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor shared by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate one real solo-card tile root (matches `tile-<digits>`,
    // skipping nested chrome like `tile-rating-*` / `tile-eta-*`).
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    let target: HTMLElement | null = null;
    for (const tile of Array.from(tiles)) {
      const testid = tile.getAttribute("data-testid") ?? "";
      if (/^tile-\d+$/.test(testid)) {
        target = tile;
        break;
      }
    }
    expect(target, "no real solo-card tile rendered").not.toBeNull();

    const meta = target!.querySelector<HTMLElement>(":scope > .tile-meta");
    expect(meta, "tile missing direct .tile-meta child").not.toBeNull();

    // Core assertion: the wrapper carries no `role` attribute. Using
    // `hasAttribute` catches both the missing-attr and explicit-empty
    // cases while still failing if any non-empty role is added.
    expect(meta!.hasAttribute("role")).toBe(false);
  });
});
