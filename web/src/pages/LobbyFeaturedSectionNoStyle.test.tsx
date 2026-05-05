import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2169 — the Featured strip's outer `<section class="lobby-featured">`
 * element does NOT carry an inline `style` attribute.
 *
 * Why this needs its own pin:
 *  - The Featured section's visual presentation is owned entirely by the
 *    stylesheet rule on the `lobby-featured` class. Existing pinned
 *    tests lock the section's tag, class, aria-label, child grid
 *    wrapper, heading content, ordering, child count, and absence of an
 *    `id` — but none of them assert that the section itself has no DOM
 *    `style` attribute.
 *  - A regression that bolted an inline `style="..."` onto the section
 *    (e.g. a one-off layout hack, a debug colour, an A/B-test override
 *    or a JS-driven height calculation) would silently expand the
 *    lobby's styling surface and bypass the class-based theming
 *    contract without tripping any existing pin.
 *  - React touches this element only through `featuredRef`; no
 *    functional code needs to set inline styles on it. Pinning the
 *    absence of the attribute itself (not just an empty string value)
 *    catches even a `style={{}}` regression that React would normally
 *    serialise to an empty `style=""`.
 *
 * The Featured strip only renders when `query` is empty, `filter` is
 * "all", and `featured.length > 0`. The default lobby state satisfies
 * all three, so the section is expected to be present.
 */
describe("LobbyPage — Featured section has no style attribute (W2169)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders <section class=\"lobby-featured\"> without an inline `style` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    // The section is presented entirely via its `lobby-featured` class
    // rule; an inline `style` attribute would be a real behaviour
    // change worth catching. Pin the absence of the attribute itself
    // (not just an empty string value) so even a `style={{}}` JSX
    // regression — which React serialises to `style=""` — trips this
    // red.
    expect(featured!.hasAttribute("style")).toBe(false);
  });
});
