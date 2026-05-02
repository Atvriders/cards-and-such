import { useEffect, useRef, useState, type JSX, type KeyboardEvent as ReactKeyboardEvent } from "react";

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
 *
 * Keyboard model (WAI-ARIA Authoring Practices for `menu`):
 *   - ArrowDown / ArrowUp   move focus to next / previous item, wrapping
 *   - Home / End            jump to first / last item
 *   - Enter / Space         activate the focused item
 *   - Tab / Shift+Tab       still navigate (native button focus order)
 *   - Escape                close without selecting
 *
 * A roving tabindex (only the focused item is `tabIndex=0`, others are
 * `-1`) keeps the menu a single tab stop within the surrounding page,
 * matching native menu behavior.
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
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // Index of the currently-focused item in the visual order. Drives the
  // roving tabindex so the menu is a single tab stop.
  const [focusIndex, setFocusIndex] = useState<number>(0);

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
    itemRefs.current[0]?.focus();
  }, []);

  // Keep DOM focus in sync with the rover. Whenever focusIndex changes
  // (arrow / Home / End), move focus to that button.
  useEffect(() => {
    itemRefs.current[focusIndex]?.focus();
  }, [focusIndex]);

  // Clamp into viewport so a near-edge right-click still shows all items.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const left = Math.max(4, Math.min(x, vw - MENU_WIDTH - 4));
  const top = Math.max(4, Math.min(y, vh - MENU_HEIGHT - 4));

  function run(action: () => void): void {
    action();
    onClose();
  }

  // Build the menu items declaratively so navigation handlers can iterate
  // a single source of truth. Order here is the visual / DOM order.
  const items: Array<{ testId: string; label: string; onSelect: () => void }> = [
    { testId: "tile-menu-play", label: "Play", onSelect: () => run(onPlay) },
    { testId: "tile-menu-copy", label: "Copy link", onSelect: () => run(onCopyLink) },
    {
      testId: "tile-menu-fav",
      label: isFavorite ? "Remove from favorites" : "Add to favorites",
      onSelect: () => run(onToggleFavorite),
    },
    {
      testId: "tile-menu-friend",
      label: "Share with friend",
      onSelect: () => run(onShareWithFriend),
    },
  ];

  function handleMenuKey(e: ReactKeyboardEvent<HTMLDivElement>): void {
    const last = items.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        setFocusIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        setFocusIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        setFocusIndex(0);
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        setFocusIndex(last);
        break;
      case "Enter":
      case " ":
      case "Spacebar": {
        // Activate the currently-focused item. Native <button> would also
        // fire on Enter/Space, but we intercept here so the behaviour is
        // identical regardless of which item the rover points at and so
        // Space doesn't scroll the page.
        e.preventDefault();
        e.stopPropagation();
        const target = items[focusIndex];
        if (target) target.onSelect();
        break;
      }
      default:
        break;
    }
  }

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label={`Actions for ${gameId}`}
      data-testid="tile-menu"
      className="lobby-tile-menu"
      onKeyDown={handleMenuKey}
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
      {items.map((it, i) => (
        <MenuItem
          key={it.testId}
          testId={it.testId}
          onSelect={it.onSelect}
          tabIndex={i === focusIndex ? 0 : -1}
          buttonRef={(el) => {
            itemRefs.current[i] = el;
          }}
          onFocus={() => setFocusIndex(i)}
        >
          {it.label}
        </MenuItem>
      ))}
    </div>
  );
}

interface MenuItemProps {
  testId: string;
  onSelect: () => void;
  children: React.ReactNode;
  tabIndex: number;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onFocus: () => void;
}

function MenuItem({ testId, onSelect, children, tabIndex, buttonRef, onFocus }: MenuItemProps): JSX.Element {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="menuitem"
      tabIndex={tabIndex}
      data-testid={testId}
      onClick={onSelect}
      onFocus={onFocus}
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
