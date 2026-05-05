import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2061 — pin the absence of the `id` attribute on the lobby tile's
 * `.tile-sheen` decorative span.
 *
 * Each tile renders `<span className="tile-sheen" aria-hidden="true" />`
 * (LobbyPage.tsx ~L2989) — purely decorative chrome styled by
 * `.tile:hover .tile-sheen` in LobbyPage.css. Because every lobby
 * tile clones this span, an `id` here would emit duplicate IDs across
 * the grid, violating the HTML uniqueness invariant and breaking any
 * `getElementById` / hash-link lookups that share the namespace.
 *
 * Sibling tests pin tile-sheen aria (W1389), tag (W1390), and class
 * (W1391), but none assert the `id` attribute is absent. Grepping
 * `Lobby*.test.tsx` for `tile-sheen` paired with an `id` assertion
 * returns no matches, leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other tile-sheen tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen has no id (W2061)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-sheen span without an `id` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount.
    await screen.findByPlaceholderText(/search/i);

    const sheen = document.querySelector<HTMLElement>(".tile-sheen");
    expect(sheen, "expected at least one .tile-sheen span").not.toBeNull();
    expect(sheen!.hasAttribute("id")).toBe(false);
  });
});
