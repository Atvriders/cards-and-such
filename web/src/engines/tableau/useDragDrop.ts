import { useCallback, useEffect, useRef, useState } from "react";
import type { Pile, Ruleset } from "./types.js";
import { canMove } from "./moves.js";
import { playSound } from "../../platform/sounds.js";

export interface DragState {
  fromPile: string | null;
  count: number;
}

/**
 * Visual state for a single pile while a drag is in flight.
 * - `idle`     — no drag, or this pile isn't relevant
 * - `valid`    — drop here is allowed by the ruleset (green glow)
 * - `invalid`  — drop here is illegal (red glow); only emitted on hover
 */
export type PileDragVisual = "idle" | "valid" | "invalid";

export interface DragDrop {
  /** True iff a drag is currently in flight (any source). */
  isDragging: boolean;
  /** The pile the drag started from, or null. */
  draggingFrom: string | null;
  /** The pile the cursor is currently over during a drag, or null. */
  dragOverPile: string | null;
  onDragStart: (pileId: string, indexFromTop: number) => (e: React.DragEvent) => void;
  onDragEnter: (pileId: string) => (e: React.DragEvent) => void;
  onDragLeave: (pileId: string) => (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDrop: (
    pileId: string,
    onMove: (from: string, to: string, count: number) => void,
  ) => (e: React.DragEvent) => void;
  /** Returns the visual hover state to apply to a given pile during drag. */
  pileVisual: (pileId: string, piles?: readonly Pile[]) => PileDragVisual;
  /** Per-pile className helper: "pile-tableau drag-over valid" etc. */
  pileClassName: (
    pileId: string,
    base: string,
    piles?: readonly Pile[],
  ) => string;
}

interface Options {
  /** Optional ruleset + piles for live valid/invalid drop highlighting. */
  ruleset?: Ruleset;
  piles?: readonly Pile[];
  /** Move handler used by the touch/pointer fallback (mobile). When set, the
   *  hook installs document-level pointer listeners that synthesize drag flow
   *  on coarse-pointer devices where HTML5 drag is unreliable. */
  onMove?: (from: string, to: string, count: number) => void;
}

/**
 * Drag-and-drop hook with HTML5 drag plus pointer-event fallback for touch.
 * Tracks the current source pile, hover target, and (when given a ruleset) emits
 * valid/invalid visual states so callers can render green/red glows.
 */
export function useDragDrop(opts: Options = {}): DragDrop {
  const ref = useRef<DragState>({ fromPile: null, count: 0 });
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const [dragOverPile, setDragOverPile] = useState<string | null>(null);
  const [invalidFlash, setInvalidFlash] = useState<string | null>(null);

  const piles = opts.piles;
  const ruleset = opts.ruleset;

  const onDragStart = useCallback(
    (pileId: string, indexFromTop: number) => (e: React.DragEvent) => {
      ref.current = { fromPile: pileId, count: indexFromTop + 1 };
      setDraggingFrom(pileId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `${pileId}:${indexFromTop + 1}`);
      // Attach a `.dragging` class to the source card so CSS can dim it.
      const target = e.currentTarget as HTMLElement;
      target.classList.add("dragging");
      // Smoother ghost preview: use the dragged element itself as the drag image,
      // offset to the cursor. Browsers default to a screenshot of the element,
      // but we re-set it to ensure no visual lag/jitter on long cascades.
      try {
        const rect = target.getBoundingClientRect();
        e.dataTransfer.setDragImage(target, e.clientX - rect.left, e.clientY - rect.top);
      } catch {
        // Some test environments (jsdom) don't implement setDragImage.
      }
    },
    [],
  );

  const onDragEnter = useCallback(
    (pileId: string) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverPile(pileId);
    },
    [],
  );

  const onDragLeave = useCallback(
    (pileId: string) => (e: React.DragEvent) => {
      // Only clear when leaving to a node outside this pile, otherwise the
      // dragenter on a child element will fight the dragleave on the parent.
      const related = e.relatedTarget as Node | null;
      const current = e.currentTarget as Node;
      if (related && current.contains(related)) return;
      setDragOverPile((prev) => (prev === pileId ? null : prev));
    },
    [],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("dragging");
    ref.current = { fromPile: null, count: 0 };
    setDraggingFrom(null);
    setDragOverPile(null);
  }, []);

  const onDrop = useCallback(
    (toPileId: string, onMove: (from: string, to: string, count: number) => void) =>
      (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain") || "";
        const [fromPile, countStr] = raw.split(":");
        const count = Number(countStr);
        if (fromPile && count > 0) {
          // If we have a ruleset, validate and flash red on illegal drops
          // instead of silently no-op'ing.
          if (ruleset && piles) {
            const ok = canMove(
              piles,
              { fromPile, toPile: toPileId, count },
              ruleset,
            );
            if (!ok) {
              setInvalidFlash(toPileId);
            } else {
              playSound("card-place");
              onMove(fromPile, toPileId, count);
            }
          } else {
            playSound("card-place");
            onMove(fromPile, toPileId, count);
          }
        }
        ref.current = { fromPile: null, count: 0 };
        setDraggingFrom(null);
        setDragOverPile(null);
      },
    [piles, ruleset],
  );

  // Auto-clear the invalid-flash after the CSS animation completes.
  useEffect(() => {
    if (!invalidFlash) return;
    const timer = window.setTimeout(() => setInvalidFlash(null), 360);
    return () => window.clearTimeout(timer);
  }, [invalidFlash]);

  // Touch / pointer-events fallback for mobile devices where HTML5 drag is
  // unreliable (notably iOS Safari). Activates only on coarse-pointer screens
  // and only when a move handler is supplied via opts.onMove. We hit-test the
  // pile under the cursor on pointerup and dispatch a move (red flash if illegal).
  const onMoveRef = useRef<typeof opts.onMove>(opts.onMove);
  useEffect(() => {
    onMoveRef.current = opts.onMove;
  }, [opts.onMove]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarse) return;
    if (!onMoveRef.current) return;

    const findPileAt = (x: number, y: number): string | null => {
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        const id = (el as HTMLElement).getAttribute?.("data-testid");
        if (id && id.startsWith("pile-")) return id.slice("pile-".length);
      }
      return null;
    };

    let active: { fromPile: string; count: number; cardEl: HTMLElement } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const cardEl = target.closest('.card[draggable="true"]') as HTMLElement | null;
      if (!cardEl) return;
      const pileEl = cardEl.closest('[data-testid^="pile-"]') as HTMLElement | null;
      if (!pileEl) return;
      const fromPile = pileEl.getAttribute("data-testid")!.slice("pile-".length);
      const cardWrappers = pileEl.querySelectorAll(".pile-card");
      let indexFromTop = 0;
      for (let i = cardWrappers.length - 1; i >= 0; i--) {
        const w = cardWrappers[i] as HTMLElement;
        if (w.contains(cardEl)) {
          indexFromTop = cardWrappers.length - 1 - i;
          break;
        }
      }
      const count = indexFromTop + 1;
      active = { fromPile, count, cardEl };
      ref.current = { fromPile, count };
      setDraggingFrom(fromPile);
      cardEl.classList.add("dragging");
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!active) return;
      const overId = findPileAt(e.clientX, e.clientY);
      setDragOverPile((prev) => (prev === overId ? prev : overId));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!active) return;
      const dropId = findPileAt(e.clientX, e.clientY);
      active.cardEl.classList.remove("dragging");
      if (dropId && dropId !== active.fromPile && onMoveRef.current) {
        if (ruleset && piles) {
          const ok = canMove(
            piles,
            { fromPile: active.fromPile, toPile: dropId, count: active.count },
            ruleset,
          );
          if (ok) {
            playSound("card-place");
            onMoveRef.current(active.fromPile, dropId, active.count);
          } else {
            setInvalidFlash(dropId);
          }
        } else {
          playSound("card-place");
          onMoveRef.current(active.fromPile, dropId, active.count);
        }
      }
      active = null;
      ref.current = { fromPile: null, count: 0 };
      setDraggingFrom(null);
      setDragOverPile(null);
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("pointercancel", handlePointerUp, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [piles, ruleset]);

  const pileVisual = useCallback(
    (pileId: string, livePiles?: readonly Pile[]): PileDragVisual => {
      if (invalidFlash === pileId) return "invalid";
      if (!draggingFrom || dragOverPile !== pileId) return "idle";
      if (pileId === draggingFrom) return "idle";
      const evalPiles = livePiles ?? piles;
      if (!ruleset || !evalPiles) return "valid";
      const ok = canMove(
        evalPiles,
        { fromPile: draggingFrom, toPile: pileId, count: ref.current.count },
        ruleset,
      );
      return ok ? "valid" : "invalid";
    },
    [draggingFrom, dragOverPile, invalidFlash, piles, ruleset],
  );

  const pileClassName = useCallback(
    (pileId: string, base: string, livePiles?: readonly Pile[]): string => {
      const v = pileVisual(pileId, livePiles);
      if (v === "idle") return base;
      // The legacy `is-drop-target` / `is-drop-invalid` classes remain supported
      // by Pile.css; we add the new `drag-over valid|invalid` for fresh styling.
      const legacy = v === "valid" ? "is-drop-target" : "is-drop-invalid";
      return `${base} drag-over ${v} ${legacy}`;
    },
    [pileVisual],
  );

  return {
    isDragging: draggingFrom != null,
    draggingFrom,
    dragOverPile,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDragEnd,
    onDrop,
    pileVisual,
    pileClassName,
  };
}
