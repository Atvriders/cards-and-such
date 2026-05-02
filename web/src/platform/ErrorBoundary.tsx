/**
 * ErrorBoundary — class component that traps render-time errors thrown by
 * its children, logs the failure to the local analytics ring buffer
 * (`error.caught`), and shows a friendly fallback card so a single broken
 * game doesn't blank the whole app.
 *
 * Wrap individual game surfaces with `<ErrorBoundary>` so the lobby,
 * header, and footer survive a crash inside a plugin's component. A
 * second top-level boundary in `<App />` covers the route layer with a
 * slightly more generic message.
 *
 * Stable test ids: `error-boundary`, `error-reload`, `error-report`.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { track } from "./analytics.js";

const REPORT_URL = "https://github.com/Atvriders/cards-and-such/issues/new";

export interface ErrorBoundaryProps {
  /** Children to guard. */
  children: ReactNode;
  /** Optional title shown in the fallback card. Defaults to "Something broke". */
  title?: string;
  /**
   * Optional sub-line shown under the title to differentiate, e.g. between
   * a per-game boundary ("This game hit a snag…") and a top-level one
   * ("The app hit a snag…").
   */
  hint?: string;
  /**
   * Optional analytics scope tag (e.g. "play-surface", "app"). Forwarded
   * with the `error.caught` event so the dev panel can tell boundaries
   * apart.
   */
  scope?: string;
}

interface ErrorBoundaryState {
  /** The captured error, or null if the subtree is healthy. */
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Local-only analytics — `track()` is a ring buffer with zero network
    // calls. We log the error message + the React component stack (when
    // available) so the dev panel can show what blew up.
    track("error.caught", {
      message: error?.message ?? String(error),
      stack: error?.stack ?? info?.componentStack ?? "",
      scope: this.props.scope,
    });
  }

  private handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const title = this.props.title ?? "Something broke";
    const hint =
      this.props.hint ??
      "An unexpected error knocked this surface offline. The rest of the app is still working.";

    return (
      <div className="error-boundary" data-testid="error-boundary" role="alert">
        <div className="error-boundary-card">
          <h2 className="error-boundary-title">{title}</h2>
          <p className="error-boundary-hint">{hint}</p>
          <pre className="error-boundary-message" data-testid="error-message">
            {error.message || String(error)}
          </pre>
          <div className="error-boundary-actions">
            <button
              type="button"
              className="btn-primary"
              data-testid="error-reload"
              onClick={this.handleReload}
            >
              Reload
            </button>
            <a
              className="error-boundary-report"
              data-testid="error-report"
              href={REPORT_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Report bug
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
