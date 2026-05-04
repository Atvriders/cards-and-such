import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { LobbyTileMenu } from "./LobbyTileMenu.js";

/**
 * W1430 — Tile-menu items render with inline `padding: 8px 12px` so each
 * row has a comfortable click target (taller than the default zero-padding
 * `<button>` would give us). The surrounding popover uses its own padding
 * (6 px) for the gutter; the per-row padding lives on the button so hover
 * highlight backgrounds extend edge-to-edge across the row. Other inner
 * attributes — inline `cursor: pointer` (W1417), `text-align: left`
 * (W1267), `role="menuitem"` (W248) — are pinned elsewhere; the inner
 * row padding is not.
 */

afterEach(() => {
  cleanup();
});

describe("LobbyTileMenu — menuitem padding: 8px 12px (W1430)", () => {
  it("each menu item button has inline padding 8px 12px", () => {
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

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(5);
    for (const item of items) {
      const style = (item as HTMLButtonElement).style;
      expect(style.paddingTop).toBe("8px");
      expect(style.paddingBottom).toBe("8px");
      expect(style.paddingLeft).toBe("12px");
      expect(style.paddingRight).toBe("12px");
    }
  });
});
