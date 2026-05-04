import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1200 — the main catalog `<section>` that holds the full game grid
 * (and the section head with the chip-strip / view / density controls)
 * exposes the accessible name "All games" via aria-label.
 *
 * Why this needs its own pin:
 *  - The Featured strip's `aria-label="Featured games"` landmark has
 *    explicit coverage in LobbyPage.test.tsx (W735), but the sibling
 *    "All games" landmark — which is the *primary* content region of
 *    the lobby — has no dedicated test pinning the literal aria-label.
 *  - A regression that drops or renames it (e.g. to "Games" or "Catalog")
 *    would silently weaken landmark navigation for screen-reader users
 *    without flipping any existing test red.
 *
 * Sibling-file placement keeps this test inside the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * LobbyPage.test.tsx.
 */
describe("LobbyPage — All games section aria-label (W1200)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the main catalog section with aria-label=\"All games\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the section via its accessible name and then pin the
    // literal attribute value with getAttribute so the assertion reads
    // exactly what was rendered into the DOM without property-bridge
    // normalisation.
    const section = document.querySelector<HTMLElement>(
      'section[aria-label="All games"]',
    );
    expect(section).not.toBeNull();
    expect(section!.tagName).toBe("SECTION");
    expect(section!.getAttribute("aria-label")).toBe("All games");
  });
});
