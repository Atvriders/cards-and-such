import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2162 — pin the absence of an inline `style` attribute on the lobby
 * tile's `.tile-sheen` decorative span.
 *
 * Each tile renders `<span className="tile-sheen" aria-hidden="true" />`
 * (LobbyPage.tsx ~L2058, ~L2989, ~L3229, ~L3382, ~L3441) — purely
 * decorative chrome whose entire visual treatment lives in
 * LobbyPage.css under `.tile:hover .tile-sheen`. The element MUST
 * remain free of inline `style` so the cascade owns the look: any
 * inline `style` would override hover transitions and tile-state
 * classes, and would bypass the design system's themed variables.
 *
 * Sibling tests pin tile-sheen aria (W1389), tag (W1390), class
 * (W1391), and id-absence (W2061), but none assert the `style`
 * attribute is absent. Grepping `Lobby*.test.tsx` for `tile-sheen`
 * paired with a `style` assertion returns no matches (only a comment
 * mentioning CSS), leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other tile-sheen tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen has no inline style (W2162)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-sheen span without a `style` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount.
    await screen.findByPlaceholderText(/search/i);

    const sheen = document.querySelector<HTMLElement>(".tile-sheen");
    expect(sheen, "expected at least one .tile-sheen span").not.toBeNull();
    expect(sheen!.hasAttribute("style")).toBe(false);
  });
});
