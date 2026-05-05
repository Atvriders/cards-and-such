import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2161 — pin the ABSENCE of an inline `style` attribute on the
 * lobby tile's `.tile-chips` wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2734) wraps the
 * eta + difficulty pills in a `<div class="tile-chips" aria-hidden="false">`.
 * The wrapper relies entirely on CSS for layout/spacing — adding
 * an inline `style` (even an empty one) would override theme
 * stylesheets, defeat user-agent / dark-mode CSS, and create a
 * specificity-war hazard for any future skin or accessibility
 * override.
 *
 * Sibling tile-chips tests pin the className (LobbyTileChipsClassEq),
 * the aria-hidden value (LobbyTileChipsAria), the child count
 * (LobbyTileChipsChildCount), and the absence of `id`
 * (LobbyTileChipsNoId). The `style`-absence invariant — equally
 * load-bearing because inline styles override theme CSS — had no
 * dedicated coverage: grepping `Lobby*.test.tsx` for `tile-chips`
 * paired with `style` returns nothing.
 *
 * Lives in a NEW SIBLING file per the same rationale as the
 * other W-series Lobby tests: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits
 * to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper has no style attribute (W2161)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least one tile-chips wrapper without a `style` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tile-chips tests.
    await screen.findByPlaceholderText(/search/i);

    const wrappers = document.querySelectorAll<HTMLElement>(
      "div.tile-chips",
    );
    expect(wrappers.length).toBeGreaterThan(0);

    // The wrapper must NOT carry an inline `style` — any inline
    // declaration would override theme CSS and break dark-mode /
    // user-stylesheet overrides for the chip row.
    const wrapper = wrappers[0]!;
    expect(wrapper.hasAttribute("style")).toBe(false);
  });
});
