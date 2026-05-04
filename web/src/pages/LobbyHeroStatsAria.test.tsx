import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1165 — the hero stats row (the row of category-count buttons plus
 * the "Lucky / Surprise me" tile beneath the page-level <h1>) exposes
 * the accessible name "Catalog breakdown" via aria-label on its
 * `<div class="lobby-hero-stats">` wrapper.
 *
 * Why this needs its own pin:
 *  - The wrapper itself has no role and no visible heading; without an
 *    aria-label, the group of count buttons would announce as a flat
 *    sequence of buttons, losing the "this is a catalog summary"
 *    framing that pairs visually with the surrounding hero copy.
 *  - Existing Lobby coverage tests the *individual* per-category
 *    buttons inside this group (their own per-button aria-labels of
 *    the form "Filter by <Category> (<n> games)") and the sibling
 *    "Open a random game" button via data-testid="lobby-surprise" —
 *    but no test pins the *container* aria-label, so a regression
 *    that drops or renames it (e.g. to "Stats" or "Category counts")
 *    would silently slip through.
 *
 * Sibling-file placement mirrors the W1150 chip-strip pattern so this
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — hero stats aria-label (W1165)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the hero stats wrapper with aria-label=\"Catalog breakdown\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className rather than the accessible name
    // so the lookup itself is independent of the attribute under test.
    const stats = document.querySelector<HTMLElement>(".lobby-hero-stats");
    expect(stats).not.toBeNull();

    // Pin the literal attribute value with getAttribute so we read
    // exactly what was rendered into the DOM without any property
    // bridge normalisation.
    expect(stats!.getAttribute("aria-label")).toBe("Catalog breakdown");
  });
});
