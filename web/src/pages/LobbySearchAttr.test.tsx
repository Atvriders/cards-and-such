import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1143 — the lobby search input exposes the literal accessible name
 * "Search games" via the `aria-label` attribute.
 *
 * Why this needs its own pin:
 *  - The visible affordance hinting at the input's purpose is the
 *    placeholder copy ("Search 4,500+ games…", pinned by W901), but
 *    placeholder text is *not* a stable accessible name — screen
 *    readers vary on whether they announce it, and once a user starts
 *    typing the placeholder disappears. The `aria-label` is what
 *    assistive tech actually uses to label the control at every point
 *    in its lifecycle.
 *  - W912 pins `type="search"` (i.e. role="searchbox") but does NOT
 *    pin the accessible name. A regression that drops `aria-label`
 *    would still leave a searchbox role in the tree — just an unnamed
 *    one — which every existing test would happily ignore because
 *    they look the input up via `data-testid="lobby-search"`.
 *  - Existing coverage in this directory:
 *      W901 → placeholder copy
 *      W912 → type="search" / role="searchbox"
 *      W608 → clear-x button behavior
 *    None of these inspect the `aria-label` value, so a refactor that
 *    swaps the label string (e.g. "search" → "find", or removes it
 *    entirely in favour of the placeholder) would slip past CI.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W901/W912/W874/W766/W789/W803 sibling pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits.
 */
describe("LobbyPage — search input aria-label (W1143)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the lobby search input with aria-label=\"Search games\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id rather than the accessible name
    // so the lookup itself is independent of the attribute under test.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // Pin the literal attribute value. `getAttribute` (rather than
    // a property accessor) guarantees we read what was rendered into
    // the DOM, with no normalisation by the React property bridge.
    expect(search.getAttribute("aria-label")).toBe("Search games");
  });
});
