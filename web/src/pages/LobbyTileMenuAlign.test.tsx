import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { LobbyTileMenu } from "./LobbyTileMenu.js";

/**
 * W1267 — Tile-menu items render with `text-align: left` inline style so
 * label text hugs the popover's leading edge (matching native menu /
 * dropdown convention). Other attributes — `role="menuitem"`, `type`,
 * `tabindex`, `data-testid` — are covered elsewhere in
 * LobbyTileMenu.test.tsx; the leading-edge alignment is not.
 */

afterEach(() => {
  cleanup();
});

describe("LobbyTileMenu — left-aligned items (W1267)", () => {
  it("each menu item button has inline text-align: left", () => {
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
      expect((item as HTMLButtonElement).style.textAlign).toBe("left");
    }
  });
});
