import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1402 — the tile-badge element itself MUST be a `<span>` per the Badge
 * component (web/src/platform/Badge.tsx ~L42):
 *
 *     <span className={`badge badge--${kind}`} ... />
 *
 * Existing tile-badge coverage pins the badge's testid, textContent,
 * `aria-label`, and `badge--<kind>` modifier class:
 *   - W784  (LobbyPage.test.tsx ~L3375) — NEW path
 *   - W806  (LobbyPage.test.tsx ~L3446) — QUICK path
 *   - W824  (LobbyPage.test.tsx ~L3504) — CHALLENGING path
 *   - W1366 (LobbyTileBadgeSlotClass.test.tsx) — wrapping `.tile-badge-slot`
 *           span's tagName + class
 *
 * NONE of those assert the badge ELEMENT's own tagName. The wrapping
 * slot's tagName is locked by W1366, but a regression that swapped just
 * the inner Badge to a `<div>` (which would break inline-flow inside the
 * tile <a> — anchors permit phrasing content only) would silently pass
 * every existing tile-badge test.
 *
 * Uses `snap` (a curated QUICK_GAME_IDS member, stable head-of-registry)
 * because W806 already proved its `tile-badge-snap` testid is unambiguous
 * once the search filter narrows the visible pool — the same recipe is
 * reused here so this test does not depend on featured-strip ordering or
 * any unrelated lobby state.
 *
 * Lives in a NEW SIBLING file (matches the `src/pages/Lobby` vitest path
 * filter) so concurrent edits to the LobbyPage.test.tsx mega-file don't
 * collide.
 */
describe("LobbyPage — tile-badge element tagName (W1402)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the tile-badge-snap element as a SPAN", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow to "Snap" so `tile-badge-snap` resolves to the lone solo
    // tile (avoids any `feat-tile-badge-snap` featured-strip double).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Snap" } });

    const badge = await waitFor(() => screen.getByTestId("tile-badge-snap"));
    expect(badge).toBeInTheDocument();

    // Pin the element type: a `<div>` here would invalidate inline-flow
    // inside the tile <a> (anchors permit phrasing content only) and
    // could break the absolute-positioning rules in Badge.css that
    // assume a span layout context.
    expect(badge.tagName).toBe("SPAN");
  });
});
