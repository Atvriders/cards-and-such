import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { LobbyTileMenu } from "./LobbyTileMenu.js";

/**
 * W1466 — The tile-menu popover container stacks its menu items
 * vertically via an inline `flex-direction: column`. This is what
 * keeps the five action buttons in a single column regardless of
 * their natural width. Sibling attributes on the same element —
 * `lobby-tile-menu` className (W1412), inline padding, role="menu",
 * aria-label, data-testid — are pinned elsewhere; the inline
 * flex-direction is not.
 */

afterEach(() => {
  cleanup();
});

describe("LobbyTileMenu — container flex-direction: column (W1466)", () => {
  it("menu root inline style stacks items in a column", () => {
    render(
      <LobbyTileMenu
        gameId="klondike"
        gameTitle="Klondike"
        x={32}
        y={48}
        isFavorite={false}
        onClose={vi.fn()}
        onPlay={vi.fn()}
        onCopyLink={vi.fn()}
        onToggleFavorite={vi.fn()}
        onShareWithFriend={vi.fn()}
        onHide={vi.fn()}
      />,
    );

    const menu = screen.getByTestId("tile-menu");
    expect(menu.style.flexDirection).toBe("column");
  });
});
