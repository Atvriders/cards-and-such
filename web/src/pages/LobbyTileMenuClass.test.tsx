import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { LobbyTileMenu } from "./LobbyTileMenu.js";

/**
 * W1412 — The tile-menu popover container is tagged with the
 * `lobby-tile-menu` className so global stylesheets (and screenshot
 * tooling) can target the popover without hooking into the inline
 * positioning styles. Other attributes on the same element —
 * `role="menu"`, `aria-label`, `data-testid="tile-menu"`, the inline
 * `text-align: left` on items — are covered elsewhere; the className
 * itself is not.
 */

afterEach(() => {
  cleanup();
});

describe("LobbyTileMenu — container className (W1412)", () => {
  it("menu root carries the lobby-tile-menu className", () => {
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
    expect(menu).toHaveClass("lobby-tile-menu");
  });
});
