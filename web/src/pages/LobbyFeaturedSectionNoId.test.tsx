import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2088 — the Featured strip's outer `<section class="lobby-featured">`
 * element does NOT carry an `id` attribute.
 *
 * Why this needs its own pin:
 *  - The Featured section is intentionally identified for assistive
 *    technology via its `aria-label="Featured games"`, and pinned tests
 *    already lock its tag, class, child count, child grid wrapper, and
 *    heading content. None of those tests, however, assert that the
 *    section itself has no DOM `id` — a regression that bolted on an
 *    `id="lobby-featured"` (e.g. for an in-page anchor link, a CSS
 *    `:target` rule, or a test-only debug hook) would silently expand
 *    the lobby's stable ID surface without tripping any existing pin.
 *  - The section is referenced by React only through `featuredRef`, so
 *    no functional code needs an `id`. Adding one would be a real
 *    behaviour change worth catching.
 *
 * The Featured strip only renders when `query` is empty, `filter` is
 * "all", and `featured.length > 0`. The default lobby state satisfies
 * all three, so the section is expected to be present.
 */
describe("LobbyPage — Featured section has no id attribute (W2088)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders <section class=\"lobby-featured\"> without an `id` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    // The section is identified for AT via its aria-label; it has no
    // need for a DOM id, and adding one would be a real behaviour
    // change. Pin the absence of the attribute itself (not just an
    // empty string value) so a regression that wires up an in-page
    // anchor or :target rule would trip this red.
    expect(featured!.hasAttribute("id")).toBe(false);
  });
});
