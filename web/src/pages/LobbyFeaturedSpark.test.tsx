import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1255 — the Featured strip's `<h2>` heading is decorated with a
 * leading sparkle glyph wrapped in `<span class="lobby-featured-spark"
 * aria-hidden="true">✦</span>` so the visual flourish is hidden from
 * assistive tech (screen readers announce the heading as just
 * "Featured" rather than "✦ Featured").
 *
 * Why this needs its own pin:
 *  - The outer `section.lobby-featured[aria-label="Featured games"]`
 *    landmark and its grid descendant both have explicit coverage in
 *    LobbyPage.test.tsx, but the inner sparkle span — both its class
 *    name and its `aria-hidden="true"` attribute — has no dedicated
 *    test. A regression that drops `aria-hidden` (causing the glyph to
 *    leak into the heading's accessible name) or renames the class
 *    (breaking the matching CSS selector at LobbyPage.css:580) would
 *    not flip any existing test red.
 *
 * Sibling-file placement keeps this test inside the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * LobbyPage.test.tsx.
 */
describe("LobbyPage — Featured strip sparkle span (W1255)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides the decorative sparkle glyph from assistive tech via aria-hidden", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the sparkle span scoped under the Featured strip's
    // landmark so we don't accidentally match the Recommended-for-you
    // strip's sparkle (which uses the same class but a "★" glyph).
    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    const spark = featured!.querySelector<HTMLSpanElement>(
      "h2 > span.lobby-featured-spark",
    );
    expect(spark).not.toBeNull();
    expect(spark!.tagName).toBe("SPAN");
    expect(spark!.getAttribute("aria-hidden")).toBe("true");
    expect(spark!.textContent).toBe("✦");
  });
});
