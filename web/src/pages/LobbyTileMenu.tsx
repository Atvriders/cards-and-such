import { useEffect, useRef, type JSX } from "react";

/**
 * Small popover-style context menu rendered absolutely-positioned at the
 * cursor (or touch) coordinates. Opened by right-click on a lobby tile,
 * or by a long-press (≥ 600 ms) on touch devices. Closes on Escape, on
 * any outside click/contextmenu, or after an item is invoked.
 *
 * The menu is intentionally portal-free — the lobby tile wrapper already
 * uses `position: relative` for the heart toggle, so a
 * `position: fixed` child sized to a few items renders cleanly above the
 * grid without affecting layout. Coordinates are clamped to the viewport
 * so right-clicks near the edge don't push items off-screen.
 */

export interface LobbyTileMenuProps {
  /** Game id this menu is acting on — used to label and route. */
  gameId: string;
  /** Display title (used in the friend-mode share copy). */
  gameTitle: string;
  /** Cursor / touch coordinates in viewport space. */
  x: number;
  y: number;
  /** Whether this id is currently in the user's favorites list. */
  isFavorite: boolean;
  /** Close the menu without selecting anything. */
  onClose: () => void;
  /** Navigate to /play/<id>. */
  onPlay: () => void;
  /** Copy share-able play URL to the clipboard. */
  onCopyLink: () => void;
  /** Toggle favorite status. */
  onToggleFavorite: () => void;
  /** Build a friend-mode URL with a fresh seed and copy it. */
  onShareWithFriend: () => void;
}

/**
 * Approx menu dimensions used for viewport clamping. The popover itself
 * sizes to its contents so this is intentionally a bit conservative —
 * we'd rather nudge the menu inward 4 px than let it overflow.
 */
const MENU_WIDTH = 200;
const MENU_HEIGHT = 180;

export function LobbyTileMenu({
  gameId,
  x,
  y,
  isFavorite,
  onClose,
  onPlay,
  onCopyLink,
  onToggleFavorite,
  onShareWithFriend,
}: LobbyTileMenuProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape and on any click/contextmenu outside the popover.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    function onDocPointer(e: MouseEvent): void {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && root.contains(e.target)) return;
      onClose();
    }
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onDocPointer, true);
    document.addEventListener("contextmenu", onDocPointer, true);
    document.addEventListener("touchstart", onDocPointer as EventListener, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onDocPointer, true);
      document.removeEventListener("contextmenu", onDocPointer, true);
      document.removeEventListener("touchstart", onDocPointer as EventListener, true);
    };
  }, [onClose]);

  // Focus the first item when the menu opens so keyboard users can
  // immediately tab/arrow through it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const first = root.querySelector<HTMLButtonElement>("button[data-testid^='tile-menu-']");
    first?.focus();
  }, []);

  // Clamp into viewport so a near-edge right-click still shows all items.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const left = Math.max(4, Math.min(x, vw - MENU_WIDTH - 4));
  const top = Math.max(4, Math.min(y, vh - MENU_HEIGHT - 4));

  function run(action: () => void): void {
    action();
    onClose();
  }

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label={`Actions for ${gameId}`}
      data-testid="tile-menu"
      className="lobby-tile-menu"
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 80,
        minWidth: 180,
        background: "var(--surface, #1d2330)",
        border: "1px solid var(--border, rgba(255,255,255,0.12))",
        borderRadius: 10,
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        padding: 6,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <MenuItem testId="tile-menu-play" onSelect={() => run(onPlay)}>
        Play
      </MenuItem>
      <MenuItem testId="tile-menu-copy" onSelect={() => run(onCopyLink)}>
        Copy link
      </MenuItem>
      <MenuItem testId="tile-menu-fav" onSelect={() => run(onToggleFavorite)}>
        {isFavorite ? "Remove from favorites" : "Add to favorites"}
      </MenuItem>
      <MenuItem testId="tile-menu-friend" onSelect={() => run(onShareWithFriend)}>
        Share with friend
      </MenuItem>
    </div>
  );
}

interface MenuItemProps {
  testId: string;
  onSelect: () => void;
  children: React.ReactNode;
}

function MenuItem({ testId, onSelect, children }: MenuItemProps): JSX.Element {
  return (
    <button
      type="button"
      role="menuitem"
      data-testid={testId}
      onClick={onSelect}
      style={{
        textAlign: "left",
        padding: "8px 12px",
        background: "transparent",
        color: "inherit",
        border: 0,
        borderRadius: 6,
        font: "inherit",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

export default LobbyTileMenu;
