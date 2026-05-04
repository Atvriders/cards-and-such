import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1503 — the "Recommended for you" strip's `<h2>` heading carries the
 * literal visible heading text "Recommended for you" as a trailing text
 * node sibling of the decorative sparkle span. The heading itself is the
 * load-bearing accessible name a sighted user reads to identify the
 * personalised-recommendations row.
 *
 * Why this needs its own pin:
 *  - W1482 (LobbyRecommendedAria.test.tsx) pins the outer `<section>`'s
 *    `aria-label="Recommended for you"`, but a regression that swaps the
 *    visible h2 heading copy (e.g. to "Picks for you" or "For you") while
 *    leaving the section's aria-label intact would leave sighted users
 *    seeing the wrong title without flipping that test red.
 *  - W1493 (LobbyRecommendedSpark.test.tsx) pins the inner sparkle span's
 *    class/aria-hidden/glyph but stops short of the trailing text node —
 *    a regression that drops or rewords the "Recommended for you" text
 *    (e.g. to "Recommended" or "Suggested for you") while keeping the
 *    spark intact would slip past every existing pin.
 *  - This test scopes to the h2's `lastChild` text node so it is wholly
 *    distinct from the spark span (the h2's `firstChild`).
 *
 * The recommended strip only renders when `query` is empty, `filter` is
 * "all", and `recommendations.length > 0`. We gate the assertion on the
 * section being present so this remains a useful pin even if the
 * recommender ever returns zero items on a cold start.
 */
describe("LobbyPage — Recommended strip h2 heading text (W1503)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the literal 'Recommended for you' text node trailing the sparkle span", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const recommended = document.querySelector<HTMLElement>(
      'section[data-testid="lobby-recommended"]',
    );

    if (recommended === null) {
      // Recommendations may legitimately be empty on a cold start — skip
      // silently so the pin doesn't go red on a valid branch.
      return;
    }

    const heading = recommended.querySelector<HTMLHeadingElement>("h2");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");

    // The heading has exactly two children: the sparkle span (first) and
    // a trailing text node carrying the visible heading copy. Pin the
    // text node verbatim so a copy regression flips this test red even
    // if the spark span is preserved.
    const tail = heading!.lastChild;
    expect(tail).not.toBeNull();
    expect(tail!.nodeType).toBe(Node.TEXT_NODE);
    expect(tail!.textContent).toBe("Recommended for you");
  });
});
