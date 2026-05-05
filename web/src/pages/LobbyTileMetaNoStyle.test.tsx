import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2160 — pin that the solo-card `.tile-meta` wrapper renders WITHOUT
 * an inline `style` attribute.
 *
 * The lobby's per-tile `<div className="tile-meta">` row (LobbyPage.tsx
 * ~L2059, ~L3000, ~L3093, ~L3240, ~L3388, ~L3447) is a purely
 * presentational flex container whose layout is owned entirely by
 * LobbyPage.css via the `.tile .tile-meta { … }` rule. An inline
 * `style="..."` attribute injected at the JSX layer would silently
 * override the cascade — most painfully, theme overrides for
 * compact / dense lobby variants raise specificity to inline-style
 * level and become impossible to reach from CSS alone, leaving
 * downstream tweaks dead.
 *
 * Sibling tests pin the wrapper's tagName + className (W1670,
 * LobbyTileMetaTag) and the absence of an `id` attribute (W2073,
 * LobbyTileMetaNoId), but neither asserts the absence of an inline
 * `style` attribute — grepping `Lobby*.test.tsx` for files that
 * contain BOTH `tile-meta` and `style` returns only the unrelated
 * `LobbyTileCatGlyphNoStyle` (which targets the inner glyph span,
 * not the wrapper) and the mega-file `LobbyPage.test.tsx` (whose
 * single `tile-meta`/`style` co-occurrence sits in W713 family-tile
 * documentation, not on this wrapper).
 *
 * Lives in a NEW SIBLING file per the same rationale as the W2073 /
 * W1670 / W1461 splits: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file
 * or to LobbyTileMetaNoId / LobbyTileMetaTag.
 */
describe("LobbyPage — solo-card tile-meta wrapper has no inline style attribute (W2160)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-meta` wrapper without a `style` attribute", async () => {
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

    // Core assertion: the wrapper carries no `style` attribute.
    // `hasAttribute("style")` is the strictest check — it returns
    // `true` even for `style=""`, so a regression that stamped an
    // empty inline style (still bumping CSS specificity at the
    // attribute-presence level for some selectors) would still fail
    // here.
    expect(meta!.hasAttribute("style")).toBe(false);
  });
});
