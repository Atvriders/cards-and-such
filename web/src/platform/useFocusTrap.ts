import { useEffect, type RefObject } from "react";

/**
 * Selector covering elements that participate in tab navigation. We
 * exclude things that are explicitly opted-out (`tabindex="-1"`,
 * `disabled`, or `aria-hidden="true"`) inside `focusableIn` below.
 */
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Enumerate focusable descendants of `el`, skipping disabled / hidden ones. */
export function focusableIn(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (n) => !n.hasAttribute("disabled") && n.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Modal focus-trap hook. When `active`, moves focus into `containerRef`
 * (first focusable, or the container itself) and constrains Tab / Shift-Tab
 * navigation to wrap inside the container. Restores focus to whatever was
 * focused before activation when the trap deactivates / unmounts.
 *
 * Designed to be cheap and idempotent — safe to attach to any modal-style
 * surface (dialog, popover, picker) for consistent keyboard behaviour.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;

    // Move focus into the container — first focusable wins, otherwise
    // the container itself (must already have tabIndex={-1} for this).
    const initial = focusableIn(container);
    (initial[0] ?? container).focus?.();

    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key !== "Tab") return;
      const focusables = focusableIn(container);
      if (focusables.length === 0) {
        ev.preventDefault();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const activeEl = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && (activeEl === first || !container.contains(activeEl))) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && activeEl === last) {
        ev.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      // Restore focus to wherever we yanked it from — guarded because
      // the previously-focused node may have been removed from the DOM.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus?.();
      }
    };
  }, [active, containerRef]);
}

export default useFocusTrap;
