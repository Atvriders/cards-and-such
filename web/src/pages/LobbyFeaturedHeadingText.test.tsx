import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1515 — the Featured strip's `<h2>` heading carries the literal
 * visible heading text "Featured" as a trailing text node sibling of
 * the decorative sparkle span. The heading itself is the load-bearing
 * accessible name a sighted user reads to identify the curated
 * featured-games row.
 *
 * Why this needs its own pin:
 *  - LobbyPage.test.tsx (W735) pins the outer `<section>`'s
 *    `aria-label="Featured games"` and the section's gating, but a
 *    regression that swaps the visible h2 heading copy (e.g. to
 *    "Highlights" or "Featured games" to match the aria-label) while
 *    leaving the section landmark intact would leave sighted users
 *    seeing the wrong title without flipping any existing test red.
 *  - W1255 (LobbyFeaturedSpark.test.tsx) pins the inner sparkle span's
 *    class/aria-hidden/glyph but stops short of the trailing text
 *    node — a regression that drops or rewords the "Featured" text
 *    (e.g. to "Featured games" or "Top picks") while keeping the spark
 *    intact would slip past every existing pin.
 *  - This test scopes to the h2's `lastChild` text node so it is wholly
 *    distinct from the spark span (the h2's `firstChild`), parallel to
 *    the W1503 pin on the Recommended strip.
 *
 * The featured strip only renders when `query` is empty, `filter` is
 * "all", and `featured.length > 0` — all true on a cold mount with the
 * non-empty FEATURED_IDS list, so the heading is reliably present.
 */
describe("LobbyPage — Featured strip h2 heading text (W1515)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the literal 'Featured' text node trailing the sparkle span", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    const heading = featured!.querySelector<HTMLHeadingElement>("h2");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");

    // The heading has exactly two children: the sparkle span (first) and
    // a trailing text node carrying the visible heading copy. Pin the
    // text node verbatim so a copy regression flips this test red even
    // if the spark span is preserved.
    const tail = heading!.lastChild;
    expect(tail).not.toBeNull();
    expect(tail!.nodeType).toBe(Node.TEXT_NODE);
    expect(tail!.textContent).toBe("Featured");
  });
});
