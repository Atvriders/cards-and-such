import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2319 — the main games-grid container (`.lobby-grid`, the non-featured
 * variant rendered around LobbyPage.tsx ~L2331) MUST initialise its
 * `data-view` attribute to the literal string "grid" when no persisted
 * view-mode is present in localStorage. This is the default branch of
 * `readPersistedView()` (LobbyPage.tsx ~L202): when localStorage is empty
 * (or missing), the `useState<ViewMode>(() => readPersistedView())`
 * initializer at ~L701 falls through to `return "grid"`.
 *
 * Sibling pins on the same wrapper:
 *   - LobbyPage.test.tsx W771 (~L3253) pins the REHYDRATE branch:
 *     pre-seeded `cards-lobby-view=list` → `data-view="list"`.
 *   - LobbyPage.test.tsx W783 pins the WRITE-side click→storage round-trip.
 *   - LobbyGridNoId / LobbyGridDiv / LobbyGridNoStyle pin shape (DIV,
 *     no id, no inline style) of the same container.
 *
 * What none of those cover is the DEFAULT INITIAL value of `data-view`
 * when `cards-lobby-view` is absent from localStorage. A regression that
 * silently changed the default ViewMode (e.g. "grid" → "list", or
 * dropped the `data-view` attribute altogether on first paint) would
 * pass W771's rehydrate test (which pre-seeds "list") and W783's click
 * test (which only asserts the post-click value), yet would flip the
 * default lobby layout for every new visitor — a load-bearing visual
 * default.
 *
 * One focused assertion: with localStorage cleared, the main `.lobby-grid`
 * container's `data-view` attribute MUST equal "grid".
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2084 / W1362 / W1908 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — main games-grid initial data-view defaults to \"grid\" (W2319)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("with no persisted cards-lobby-view, the main `.lobby-grid` carries data-view=\"grid\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to finish mounting — the search input is the
    // canonical "lobby is ready" anchor used by sibling tests
    // (LobbyGridNoId.test.tsx / LobbyGridDiv.test.tsx use the same).
    await screen.findByPlaceholderText(/search/i);

    // Multiple `.lobby-grid` nodes can co-render (featured strip + main
    // grid), so target the main grid explicitly via
    // `:not(.lobby-grid--featured)` — same selector strategy as W771,
    // W2084, and the density-mirror tests.
    const grid = document.querySelector<HTMLElement>(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    expect(grid).not.toBeNull();

    // Sanity guards so a future restructure can't satisfy the assertion
    // vacuously by matching an unrelated `.lobby-grid` clone.
    expect(grid!.tagName).toBe("DIV");
    expect(grid!.classList.contains("lobby-grid")).toBe(true);
    expect(grid!.classList.contains("lobby-grid--featured")).toBe(false);

    // The actual contract: the initial `data-view` value is exactly the
    // literal string "grid". Use `getAttribute` (not `toHaveAttribute`)
    // and `===` to make the exact-string requirement load-bearing —
    // a regression to e.g. `data-view=""` or omitting the attribute
    // entirely (== null) must trip this pin.
    expect(grid!.getAttribute("data-view") === "grid").toBe(true);
  });
});
