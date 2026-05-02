import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { track } from "./analytics.js";

/**
 * Single fade phase length, in ms. Two phases run back-to-back when the
 * route changes — the outgoing tree fades out, then the incoming tree
 * fades in — so the overall hand-off lasts roughly 2 × FADE_MS.
 *
 * Tuned short enough that fast clickers won't feel a stall (the lobby
 * tile press already nudges to ~80ms of micro-feedback before navigation
 * kicks in) but long enough that the cross-fade reads as deliberate
 * rather than a flicker.
 */
const FADE_MS = 150;

/**
 * Wraps `<Routes>` and cross-fades between matched route trees on
 * location change. Renders the previous children for FADE_MS at
 * `opacity: 0` before swapping to the new children, which then fade in
 * for FADE_MS. Honors `prefers-reduced-motion` by short-circuiting both
 * phases — children render synchronously without any opacity animation.
 *
 * Implementation notes:
 *   - We track the rendered children (`displayed`) and the route key
 *     (`displayedKey`) separately from `useLocation()`. When the live
 *     location key changes, we kick the wrapper into a fade-out phase
 *     and only swap the children once that phase finishes.
 *   - `key` on the inner wrapper is the route key — React reuses the
 *     same DOM, so the CSS transition fires on opacity changes alone.
 *     Once swapped, a fresh inner wrapper mounts with the new key,
 *     starting from `opacity: 0` and immediately transitioning to 1.
 *   - We only consider `location.pathname` (not search/hash) so that
 *     in-page filter / query updates don't trigger a fade.
 */
export function RouteTransition({ children }: { children: ReactNode }): JSX.Element {
  const location = useLocation();
  const pathKey = location.pathname;

  // The pathname currently rendered. Updated only after the fade-out
  // completes so the outgoing tree stays visible during the first phase.
  const [displayedKey, setDisplayedKey] = useState(pathKey);
  const [displayed, setDisplayed] = useState<ReactNode>(children);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  // Latest `children` always available — needed because the swap
  // happens on a timeout, after which we want the freshest tree.
  const latestChildren = useRef<ReactNode>(children);
  latestChildren.current = children;

  // Detect reduced-motion at hook time. We re-read on every effect so
  // late-flipping the OS preference is honored without remounting.
  const prefersReduced = (): boolean => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  // Record the route change for the local analytics ring buffer. We fire
  // before the cross-fade kicks in so the timeline reflects intent, not
  // the post-transition settle moment.
  useEffect(() => {
    track("route.change", { path: pathKey });
  }, [pathKey]);

  useEffect(() => {
    if (pathKey === displayedKey) {
      // Same route, just a re-render with new children — keep them in
      // sync without animating.
      setDisplayed(children);
      return;
    }
    if (prefersReduced()) {
      setDisplayed(children);
      setDisplayedKey(pathKey);
      setPhase("idle");
      return;
    }
    // Begin fade-out of the old tree; after FADE_MS swap to the new
    // tree and let the mount handler trigger the fade-in.
    setPhase("out");
    const out = window.setTimeout(() => {
      setDisplayed(latestChildren.current);
      setDisplayedKey(pathKey);
      setPhase("in");
      // Immediately schedule end of the fade-in phase so subsequent
      // children updates fall back to the steady "idle" state.
      const inT = window.setTimeout(() => setPhase("idle"), FADE_MS);
      // Stash so cleanup can clear it.
      cleanup.current = () => window.clearTimeout(inT);
    }, FADE_MS);
    cleanup.current = () => window.clearTimeout(out);
    return () => {
      cleanup.current?.();
      cleanup.current = null;
    };
    // We intentionally depend on `pathKey` only — `children` changes
    // every render and would re-trigger the timeout chain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey]);

  const cleanup = useRef<(() => void) | null>(null);

  // While "out", hold opacity at 0. While "in", we want a transition
  // from 0 → 1; mounting with `is-entering` and removing it next frame
  // would require an extra effect, but a CSS animation keyed on the
  // wrapper's `key` (route path) gives us the same result for free.
  const className = `route-transition route-transition--${phase}`;

  return (
    <div className={className} data-route-phase={phase}>
      <div key={displayedKey} className="route-transition-inner">
        {displayed}
      </div>
    </div>
  );
}

export default RouteTransition;
