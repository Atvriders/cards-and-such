import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2073 — pin that the solo-card `.tile-meta` wrapper renders WITHOUT
 * an `id` attribute.
 *
 * The lobby's per-tile `<div className="tile-meta">` row (LobbyPage.tsx
 * ~L2059, ~L3000, etc.) is a presentational flex container holding the
 * category chip + optional multiplayer badge. Because every real tile
 * renders its own meta row, attaching an `id` would either (a) collide
 * across tiles producing duplicate-id document warnings, or (b) leak a
 * stable hook that consumers could couple to.
 *
 * The sibling W1670 test (LobbyTileMetaTag) pins the wrapper's tagName
 * + exact className but does NOT assert that the element is free of an
 * `id` attribute. A silent regression that added `id="tile-meta"` (or
 * any per-tile id) would still satisfy that test while breaking the
 * "no document-level id collisions" invariant.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W1461 /
 * W1389 / W1373 / W1670 splits: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file
 * or to LobbyTileMetaTag.test.tsx.
 */
describe("LobbyPage — solo-card tile-meta wrapper has no id attribute (W2073)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-meta` wrapper without an `id` attribute", async () => {
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

    // Core assertion: the wrapper carries no `id` attribute. Using
    // `hasAttribute` (rather than just checking `meta.id === ""`)
    // catches both the missing-attr and explicit-empty-string cases
    // while still failing if any non-empty id is added.
    expect(meta!.hasAttribute("id")).toBe(false);
  });
});
