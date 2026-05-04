import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { LobbyTileMenu } from "./LobbyTileMenu.js";

/**
 * W1417 — Tile-menu items render with inline `cursor: pointer` so users
 * see an action affordance hovering any row (the popover renders over a
 * grid where the surrounding tile uses `cursor: pointer` too, but each
 * `<button role="menuitem">` carries the style on its own element so the
 * pointer state is correct even when the button is focused via keyboard
 * and the cursor sits outside the parent). Other inner-element
 * attributes — `role="menuitem"` (W248), `type="button"` (W248), inline
 * `text-align: left` (W1267), roving `tabindex` (W248) — are pinned
 * elsewhere; the pointer cursor is not.
 */

afterEach(() => {
  cleanup();
});

describe("LobbyTileMenu — menuitem cursor: pointer (W1417)", () => {
  it("each menu item button has inline cursor: pointer", () => {
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
      expect((item as HTMLButtonElement).style.cursor).toBe("pointer");
    }
  });
});
