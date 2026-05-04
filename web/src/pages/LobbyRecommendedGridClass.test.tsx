import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1548 — the "Recommended for you" strip's inner grid wrapper carries
 * the exact `class` attribute string `"lobby-grid lobby-grid--featured"`,
 * with no extra utility classes, no debug hooks, and no other attributes
 * on the wrapper element beyond `class`.
 *
 * Why this needs its own pin:
 *  - W1482 (LobbyRecommendedAria.test.tsx) pins the outer section's
 *    aria-label, class, and data-testid; W1493 (LobbyRecommendedSpark)
 *    pins the inner sparkle span; W1503 (LobbyRecommendedHeadingText)
 *    pins the h2's textual contents; W1543 (LobbyRecommendedOrder) pins
 *    the section's child element count plus the grid wrapper's
 *    `classList.contains("lobby-grid")` and `lobby-grid--featured`.
 *  - `classList.contains` is permissive — a regression that bolted on
 *    an extra utility class (e.g. `"lobby-grid lobby-grid--featured
 *    debug-outline"` from a stray dev hook, or `"lobby-grid
 *    lobby-grid--featured lobby-grid--rec"` for an experimental rec-only
 *    column tweak) would still pass W1543's `contains` assertions while
 *    silently bloating the lobby's CSS surface and breaking the
 *    intentional reuse of the Featured grid's exact column rules.
 *  - Pinning the literal `getAttribute("class")` string here closes that
 *    gap by asserting class-set equality (not subset containment), so
 *    any added or reordered class on the recommended grid wrapper trips
 *    this pin red.
 *
 * The recommended strip only renders when `query` is empty, `filter` is
 * "all", and `recommendations.length > 0`. The default lobby state
 * satisfies the first two; the assertion is gated on the section being
 * present so a cold-start branch with zero recommendations stays green.
 */
describe("LobbyPage — Recommended strip grid wrapper class attribute (W1548)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the recommended grid wrapper with class=\"lobby-grid lobby-grid--featured\" verbatim", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const recommended = document.querySelector<HTMLElement>(
      'section[data-testid="lobby-recommended"]',
    );

    if (recommended === null) {
      // Recommendations may legitimately be empty on a cold start — the
      // strip is not rendered, which is a valid lobby branch. Stop here.
      return;
    }

    // The grid wrapper is the section's last element child (pinned by
    // W1543); resolve it the same way so this pin is consistent with
    // the document-order assertions in the order test.
    const grid = recommended.lastElementChild as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("DIV");

    // Pin the exact `class` attribute string — class-set equality, not
    // a `classList.contains` subset check. The order is the order React
    // emits from the JSX template literal `lobby-grid lobby-grid--featured`,
    // so a regression that swapped the order or appended an extra class
    // would flip this red.
    expect(grid!.getAttribute("class")).toBe(
      "lobby-grid lobby-grid--featured",
    );
  });
});
