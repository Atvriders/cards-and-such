import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusTrap } from "./useFocusTrap.js";
import { GAMES } from "../games/registry.js";
import { shortcutsFor } from "./shortcuts.js";
import "./KeyboardShortcuts.css";

/**
 * Group of related shortcuts displayed under a single section heading.
 *
 * Sections are intentionally hard-coded here rather than scraped at runtime
 * — the per-game keydown handlers in `pages/PlayPage.tsx` declare their keys
 * inline (switch statements over `e.key`). Mirroring them here is cheap, and
 * reading the source of truth ourselves means contributors update both
 * places when they add a binding.
 */
interface ShortcutSection {
  /** Stable id used to build `data-testid="kbd-section-<id>"`. */
  id: string;
  /** Human-readable section heading. */
  title: string;
  rows: ShortcutRow[];
}

interface ShortcutRow {
  /**
   * Ordered key glyphs rendered as separate <kbd> chips. Use a single string
   * with space separators for chord sequences (e.g. "g h" — press g, then h).
   */
  keys: string[];
  description: string;
}

/**
 * Master list of shortcuts surfaced in the overlay. Mirrors the actual
 * keydown handlers in `pages/PlayPage.tsx` (H=hit, S=stand, R=roll, Z=undo,
 * Space=advance, Enter=play again, Esc=dismiss banner) plus the global
 * AppShell hooks (? to open this overlay) and lobby filters/search.
 *
 * Keep `id` values URL-/test-id-safe (lowercase, hyphenated).
 */
const SECTIONS: ShortcutSection[] = [
  {
    id: "global",
    title: "Global",
    rows: [
      { keys: ["?"], description: "Open this keyboard shortcuts overlay" },
      { keys: ["Shift", "/"], description: "Open this overlay (alternate)" },
      { keys: ["Esc"], description: "Close modals / cancel current action" },
      { keys: ["/"], description: "Focus the lobby search box" },
      { keys: ["g", "h"], description: "Go to the home / lobby page" },
      { keys: ["T"], description: "Cycle the active theme" },
    ],
  },
  {
    id: "lobby",
    title: "Lobby",
    rows: [
      { keys: ["F"], description: "Toggle favorites filter" },
      { keys: ["S"], description: "Focus the search box" },
      { keys: ["←", "→", "↑", "↓"], description: "Navigate game tiles" },
      { keys: ["Enter"], description: "Open the focused tile" },
      { keys: ["1", "–", "5"], description: "Filter the lobby by category" },
    ],
  },
  {
    id: "play",
    title: "Play (game-specific)",
    rows: [
      { keys: ["Space"], description: "Primary action — advance / draw / flip" },
      { keys: ["H"], description: "Hit (Blackjack) / Hint (Solitaire)" },
      { keys: ["S"], description: "Stand (Blackjack)" },
      { keys: ["R"], description: "Roll (Dice) / Restart same seed" },
      { keys: ["Shift", "R"], description: "Restart with a random seed" },
      { keys: ["N"], description: "New game (confirms if in progress)" },
      { keys: ["D"], description: "Open today's Daily challenge" },
      { keys: ["="], description: "Open the seed picker" },
      { keys: ["F"], description: "Toggle favorite for the current game" },
      { keys: ["Shift", "F"], description: "Toggle fullscreen" },
      { keys: ["I"], description: "Toggle the info popover" },
      { keys: ["T"], description: "Toggle the settings popover" },
      { keys: ["Z"], description: "Undo last move" },
      { keys: ["Ctrl", "Z"], description: "Undo last move (alternate)" },
      { keys: ["U"], description: "Undo last move (alternate)" },
      { keys: ["Enter"], description: "Play again from the win banner" },
      { keys: ["Esc"], description: "Dismiss the win banner" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Optional game id to prepend a per-game shortcut section pulled from
   * `shortcutsFor(id, category)`. The hook below auto-derives this from
   * the current URL when called inside a Router. Tests / consumers
   * outside a Router can pass undefined; the modal then renders only
   * the global static SECTIONS.
   */
  gameId?: string;
}

/**
 * Renders the global shortcuts overlay. Pure presentation — toggling is
 * driven by `useKeyboardShortcutsModal` so the same hook can be reused by
 * footer links and dev tools. Implements the four standard modal a11y
 * affordances: focus trap, Esc-to-close, click-outside-to-close, and
 * focus restoration (handled by `useFocusTrap`).
 */
export function KeyboardShortcutsModal(
  { open, onClose, gameId }: KeyboardShortcutsModalProps,
): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // If a gameId is supplied (the AppShell consumer derives it from the
  // current /play/<id> route), surface the per-game shortcut section
  // pulled from the SHORTCUTS registry (with categorical fallback). When
  // gameId is undefined (tests, non-Play routes), render only the global
  // static SECTIONS.
  const perGameSection = useMemo<ShortcutSection | null>(() => {
    if (!gameId) return null;
    const plugin = GAMES.find((g) => g.id === gameId);
    const rows = shortcutsFor(gameId, plugin?.category);
    if (!rows || rows.length === 0) return null;
    return {
      id: "per-game",
      title: plugin ? `${plugin.title} — game shortcuts` : "Game shortcuts",
      rows: rows.map((r) => ({
        keys: r.keys.split(/\s*\+\s*|\s+/).filter(Boolean),
        description: r.description,
      })),
    };
  }, [gameId]);

  // Esc anywhere closes; we listen on window so focus can be on any descendant
  // (kbd-close button included) and not just within the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useFocusTrap(dialogRef, open);

  if (!open) return null;

  return (
    <div
      className="kbd-backdrop"
      role="presentation"
      onClick={onClose}
      data-testid="kbd-modal"
    >
      <div
        className="kbd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kbd-modal-title"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="kbd-header">
          <h2 id="kbd-modal-title">Keyboard Shortcuts</h2>
          <button
            type="button"
            className="kbd-close"
            aria-label="Close keyboard shortcuts"
            data-testid="kbd-close"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="kbd-body">
          {[...(perGameSection ? [perGameSection] : []), ...SECTIONS].map((section) => (
            <section
              key={section.id}
              className="kbd-section"
              data-testid={`kbd-section-${section.id}`}
              aria-labelledby={`kbd-section-${section.id}-heading`}
            >
              <h3
                id={`kbd-section-${section.id}-heading`}
                className="kbd-section-heading"
              >
                {section.title}
              </h3>
              <div className="kbd-grid">
                {section.rows.map((row, idx) => (
                  <div
                    key={`${section.id}-${idx}`}
                    className="kbd-row"
                    data-testid={`kbd-row-${idx}`}
                  >
                    <span className="kbd-keys">
                      {row.keys.map((k, i) => (
                        <kbd key={i}>{k}</kbd>
                      ))}
                    </span>
                    <span className="kbd-desc">{row.description}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface KeyboardShortcutsModalApi {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  close: () => void;
}

/**
 * Wires the global `?` and `Shift+/` keystrokes to a boolean toggle while
 * deferring rendering to `<KeyboardShortcutsModal />`. Both `?` and Shift+/
 * are listened for explicitly because some keyboard layouts deliver `?` as
 * `e.key === "?"` directly while others require checking `e.key === "/"
 * && e.shiftKey` (German, Dvorak, etc).
 *
 * Inputs, textareas, and contenteditable surfaces are skipped so users can
 * type a literal `?` without summoning the overlay.
 */
export function useKeyboardShortcutsModal(): KeyboardShortcutsModalApi {
  const [open, setOpenState] = useState(false);

  const setOpen = useCallback((next: boolean) => setOpenState(next), []);
  const toggle = useCallback(() => setOpenState((v) => !v), []);
  const close = useCallback(() => setOpenState(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const isQuestion = e.key === "?" || (e.key === "/" && e.shiftKey);
      if (!isQuestion) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      setOpenState((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen, toggle, close };
}

export default KeyboardShortcutsModal;
