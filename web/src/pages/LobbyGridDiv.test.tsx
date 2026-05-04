import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1362 — pin the main games-grid container's element type to `<div>`.
 *
 * The main games grid (LobbyPage.tsx ~L2331) is rendered as a
 * `<div className="lobby-grid" data-density data-view ref={gridRef}>`.
 * The element type is product-visible: the roving-tabindex, 2D arrow
 * navigation, drag-and-drop favorite handlers, and CSS grid layout
 * (`.lobby-grid { display: grid }`) all assume a generic block
 * container, NOT a list / table / nav element. Switching the element
 * to `<ul>` would inject implicit list semantics that conflict with
 * the per-tile `aria-label` strategy and would change which AT
 * announces it as a "list of N items"; switching to `<section>` would
 * inject a landmark.
 *
 * Sibling tests cover `data-density` and `data-view` attribute
 * mirroring (LobbyPage.test.tsx ~L3122, ~L3253) and the all-games
 * section's `aria-label` (LobbyAllGamesAria). The element type itself
 * had no dedicated assertion — grepping `Lobby*.test.tsx` for
 * `tagName.*lobby-grid` or `lobby-grid.*tagName` yields nothing.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1334 / W1244 / W965 / W951 / W932 / W908 / W874:
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — main games-grid container element type (W1362)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the main `.lobby-grid` (not the featured variant) as a <div>", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // The main grid is selected via `:not(.lobby-grid--featured)` so
    // the optional Featured / Recommended strips' grids don't leak in
    // — same selector strategy used elsewhere in LobbyPage.test.tsx
    // (~L645, ~L878, ~L921, ~L3145, ~L3276).
    const grid = document.querySelector<HTMLElement>(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("DIV");
  });
});
