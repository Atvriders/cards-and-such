/**
 * DevErrorTestPage — hidden dev-only surface that intentionally throws
 * during render so we can verify the per-page <ErrorBoundary> in the
 * production build pipeline. Wrapped by App.tsx's top-level boundary; if
 * everything is wired correctly the boundary's fallback card appears.
 *
 * Two ways to trigger:
 *   1) Navigate to /dev/error-test directly — always throws.
 *   2) Set `window.__cardsForceError = true` from anywhere (the Settings
 *      "Show dev tools" panel does this) and reload — any visit to this
 *      route throws while the flag is set. The flag is consumed (cleared)
 *      on read so a single Reload from the boundary recovers cleanly.
 *
 * This module is import-cheap (no game registry) and the route is only
 * mounted in development builds (gated behind import.meta.env.DEV in
 * App.tsx), so there's nothing for users to discover in production.
 */

import { Link } from "react-router-dom";

const FLAG_KEY = "__cardsForceError";

type FlagWindow = Window & { [FLAG_KEY]?: boolean };

/** Read + clear the one-shot fault-injection flag. */
function consumeForceErrorFlag(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as FlagWindow;
  const set = w[FLAG_KEY] === true;
  if (set) {
    try {
      delete w[FLAG_KEY];
    } catch {
      w[FLAG_KEY] = false;
    }
  }
  return set;
}

export default function DevErrorTestPage(): JSX.Element {
  // Throw synchronously during render — this is exactly the failure mode
  // the per-page boundary is designed to catch. The flag-driven path lets
  // a user trigger the boundary from Settings without typing in the URL.
  consumeForceErrorFlag();
  throw new Error(
    "DevErrorTestPage: intentional fault for ErrorBoundary verification.",
  );
  // Unreachable, but keeps the inferred return type honest if the throw is
  // ever wrapped in a guard.
  // eslint-disable-next-line no-unreachable
  return (
    <div>
      <Link to="/">Back to lobby</Link>
    </div>
  );
}
