import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2254 — pin that the solo-card `.tile-meta` wrapper renders WITHOUT
 * a `tabindex` attribute.
 *
 * The lobby's per-tile `<div className="tile-meta">` row (LobbyPage.tsx
 * ~L2059) is a purely presentational flex container holding the category
 * chip + optional multiplayer badge. The keyboard-navigable surface is
 * the enclosing tile button itself (covered by the W545 grid-roving
 * tabindex tests); the meta row must remain a non-focusable, non-tab-
 * stop child so that Tab traversal lands on the tile, not on the
 * decorative meta wrapper.
 *
 * Sibling W2073 (LobbyTileMetaNoId) pins absence of `id`, W1670
 * (LobbyTileMetaTag) pins tagName + exact className, and the *NoStyle /
 * *NoRole / *AriaHidden siblings each cover their own attribute.
 * NONE of those assert absence of `tabindex`, so a regression that
 * stamped `tabIndex={0}` (or `-1`) onto the meta wrapper — which would
 * silently inject the decorative div into the keyboard tab order, or
 * make it programmatically focusable in a way the grid roving handler
 * does not coordinate with — would slip past the existing suite.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W2073 /
 * W1670 splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to neighbouring
 * tile-meta tests.
 */
describe("LobbyPage — solo-card tile-meta wrapper has no tabindex attribute (W2254)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-meta` wrapper without a `tabindex` attribute", async () => {
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

    // Core assertion: the wrapper carries no `tabindex` attribute. Using
    // `hasAttribute` (rather than reading `meta.tabIndex`, which always
    // returns a numeric default) is the only way to distinguish "no
    // attribute set" from "explicit tabindex={-1}" — we want both to
    // fail-forward as "decorative div, not in tab order".
    expect(meta!.hasAttribute("tabindex")).toBe(false);
  });
});
