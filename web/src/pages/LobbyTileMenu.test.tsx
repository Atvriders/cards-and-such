import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { useState, type JSX } from "react";
import { LobbyTileMenu, type LobbyTileMenuProps } from "./LobbyTileMenu.js";

/**
 * Coverage for the W248 right-click / long-press tile context menu.
 * Focuses on the behaviors that aren't already exercised through the
 * full LobbyPage tile flow: render shape, dismissal triggers, and the
 * keyboard / role plumbing AT users rely on.
 */

afterEach(() => {
  cleanup();
});

function renderMenu(
  overrides: Partial<LobbyTileMenuProps> = {},
): {
  onClose: ReturnType<typeof vi.fn>;
  onPlay: ReturnType<typeof vi.fn>;
  onCopyLink: ReturnType<typeof vi.fn>;
  onToggleFavorite: ReturnType<typeof vi.fn>;
  onShareWithFriend: ReturnType<typeof vi.fn>;
  onHide: ReturnType<typeof vi.fn>;
} {
  const onClose = vi.fn();
  const onPlay = vi.fn();
  const onCopyLink = vi.fn();
  const onToggleFavorite = vi.fn();
  const onShareWithFriend = vi.fn();
  const onHide = vi.fn();
  render(
    <LobbyTileMenu
      gameId="klondike"
      gameTitle="Klondike"
      x={32}
      y={48}
      isFavorite={false}
      onClose={onClose}
      onPlay={onPlay}
      onCopyLink={onCopyLink}
      onToggleFavorite={onToggleFavorite}
      onShareWithFriend={onShareWithFriend}
      onHide={onHide}
      {...overrides}
    />,
  );
  return { onClose, onPlay, onCopyLink, onToggleFavorite, onShareWithFriend, onHide };
}

describe("LobbyTileMenu", () => {
  it("renders all five menu items with role=menuitem", () => {
    renderMenu();
    const menu = screen.getByTestId("tile-menu");
    expect(menu).toHaveAttribute("role", "menu");
    expect(menu).toHaveAttribute("aria-label", "Actions for klondike");

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(5);
    // Each menu item must have visible text (a11y: discernible name).
    for (const item of items) {
      expect(item.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    }
    expect(screen.getByTestId("tile-menu-play")).toHaveTextContent("Play");
    expect(screen.getByTestId("tile-menu-copy")).toHaveTextContent("Copy link");
    expect(screen.getByTestId("tile-menu-fav")).toHaveTextContent(
      "Add to favorites",
    );
    expect(screen.getByTestId("tile-menu-friend")).toHaveTextContent(
      "Share with friend",
    );
    expect(screen.getByTestId("tile-menu-hide")).toHaveTextContent(
      "Hide from lobby",
    );
  });

  it("invoking Hide fires onHide and closes the menu", () => {
    const { onHide, onClose } = renderMenu();
    fireEvent.click(screen.getByTestId("tile-menu-hide"));
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("flips the favorite label when isFavorite=true", () => {
    renderMenu({ isFavorite: true });
    expect(screen.getByTestId("tile-menu-fav")).toHaveTextContent(
      "Remove from favorites",
    );
  });

  it("Escape closes the menu", () => {
    const { onClose } = renderMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a click outside the menu closes it", () => {
    const { onClose } = renderMenu();
    // mousedown on document body (outside the popover) — capture-phase listener
    // in the component triggers onClose.
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("auto-focuses the first menu item on open", async () => {
    renderMenu();
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
  });

  it("exposes menu items as native buttons in DOM order", () => {
    renderMenu();
    const items = screen.getAllByRole("menuitem");
    // role=menuitem on real <button type=button> means each is keyboard
    // focusable in tab order with no extra wiring.
    const ids = items.map((el) => el.getAttribute("data-testid"));
    expect(ids).toEqual([
      "tile-menu-play",
      "tile-menu-copy",
      "tile-menu-fav",
      "tile-menu-friend",
      "tile-menu-hide",
    ]);
    for (const item of items) {
      expect(item.tagName).toBe("BUTTON");
      expect(item).toHaveAttribute("type", "button");
    }
  });

  it("invoking an item fires the action and closes the menu", () => {
    const { onPlay, onClose } = renderMenu();
    fireEvent.click(screen.getByTestId("tile-menu-play"));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses a roving tabindex: only the focused item is tabIndex=0", async () => {
    renderMenu();
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
    expect(screen.getByTestId("tile-menu-play")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("tile-menu-copy")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByTestId("tile-menu-fav")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByTestId("tile-menu-friend")).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByTestId("tile-menu-hide")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("ArrowDown moves focus to the next item and updates the rover", async () => {
    renderMenu();
    const menu = screen.getByTestId("tile-menu");
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-copy")).toHaveFocus();
    });
    expect(screen.getByTestId("tile-menu-copy")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("tile-menu-play")).toHaveAttribute("tabindex", "-1");
  });

  it("ArrowUp from the first item wraps to the last", async () => {
    renderMenu();
    const menu = screen.getByTestId("tile-menu");
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-hide")).toHaveFocus();
    });
  });

  it("ArrowDown from the last item wraps to the first", async () => {
    renderMenu();
    const menu = screen.getByTestId("tile-menu");
    fireEvent.keyDown(menu, { key: "End" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-hide")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
  });

  it("Home and End jump to the first and last items", async () => {
    renderMenu();
    const menu = screen.getByTestId("tile-menu");
    fireEvent.keyDown(menu, { key: "End" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-hide")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "Home" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-play")).toHaveFocus();
    });
  });

  it("Enter activates the focused item and closes the menu", async () => {
    const { onCopyLink, onClose } = renderMenu();
    const menu = screen.getByTestId("tile-menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-copy")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "Enter" });
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Space activates the focused item", async () => {
    const { onShareWithFriend, onClose } = renderMenu();
    const menu = screen.getByTestId("tile-menu");
    // End jumps to the last item (hide); ArrowUp moves to the friend
    // share, which is the action this case verifies Space activates.
    fireEvent.keyDown(menu, { key: "End" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-hide")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    await waitFor(() => {
      expect(screen.getByTestId("tile-menu-friend")).toHaveFocus();
    });
    fireEvent.keyDown(menu, { key: " " });
    expect(onShareWithFriend).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Minimal fixture mirroring the LobbyPage tile contract: a focusable
   * "tile" element advertising `aria-haspopup="menu"` and toggling
   * `aria-expanded` based on whether a `LobbyTileMenu` is currently open.
   * The actual lobby tile (a router `<Link>`) wires identical attributes;
   * this fixture lets us assert the AT-facing contract without spinning
   * up the full LobbyPage / router stack.
   */
  function TileWithMenu(): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
      <>
        <a
          href="/play/klondike"
          data-testid="tile-klondike"
          aria-haspopup="menu"
          aria-expanded={open}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          Klondike
        </a>
        {open && (
          <LobbyTileMenu
            gameId="klondike"
            gameTitle="Klondike"
            x={10}
            y={10}
            isFavorite={false}
            onClose={() => setOpen(false)}
            onPlay={() => {}}
            onCopyLink={() => {}}
            onToggleFavorite={() => {}}
            onShareWithFriend={() => {}}
            onHide={() => {}}
          />
        )}
      </>
    );
  }

  it("tile advertises aria-haspopup=\"menu\" after right-click opens the menu", () => {
    render(<TileWithMenu />);
    const tile = screen.getByTestId("tile-klondike");
    // Pre-condition: the tile must always advertise that it owns a menu
    // so screen readers announce it before the user opens the popover.
    expect(tile).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.contextMenu(tile);
    // Right-click materializes the popover; aria-haspopup is unchanged
    // (it describes a static relationship, not menu visibility).
    expect(screen.getByTestId("tile-menu")).toBeInTheDocument();
    expect(tile).toHaveAttribute("aria-haspopup", "menu");
  });

  it("tile aria-expanded toggles as the menu opens and closes", async () => {
    render(<TileWithMenu />);
    const tile = screen.getByTestId("tile-klondike");
    // Closed: aria-expanded reflects the absent popover.
    expect(tile).toHaveAttribute("aria-expanded", "false");
    fireEvent.contextMenu(tile);
    // Opened: popover mounts and aria-expanded flips to true so AT users
    // hear "expanded" when they land on the tile after right-clicking.
    expect(screen.getByTestId("tile-menu")).toBeInTheDocument();
    expect(tile).toHaveAttribute("aria-expanded", "true");
    // Escape dismisses the menu via LobbyTileMenu's document listener;
    // aria-expanded must drop back to false in the same render cycle.
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
    });
    expect(tile).toHaveAttribute("aria-expanded", "false");
  });
});
