import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1366 — the tile-badge is wrapped in a `.tile-badge-slot` parent span
 * (LobbyPage.tsx ~L2996, L3236, L3384, L3443):
 *
 *     <span className="tile-badge-slot">
 *       <Badge kind={badgeKind} testId={`tile-badge-${g.id}`} />
 *     </span>
 *
 * The slot class is load-bearing: `Badge.css` (~L67) absolutely positions
 * the badge via `.tile-badge-slot` (top-right of the tile). Existing W784
 * (NEW), W806 (QUICK), W824 (CHALLENGING) tests pin the badge's testid,
 * textContent, aria-label, and `badge--<kind>` modifier class — but NONE
 * assert the wrapping slot's class or tagName. A regression that dropped
 * the wrapper, renamed it, or swapped it to a non-`<span>` element (e.g.
 * a `<div>` would change inline-flow semantics inside the tile <a>) would
 * silently pass every existing badge test.
 *
 * Uses `snap` (a curated QUICK_GAME_IDS member, stable head-of-registry)
 * because W806 already proved its `tile-badge-snap` testid is unambiguous
 * — the parent of that node is, by construction, the slot wrapper.
 *
 * Lives in a NEW SIBLING file (matches the `src/pages/Lobby` vitest path
 * filter) so concurrent edits to the LobbyPage.test.tsx mega-file don't
 * collide.
 */
describe("LobbyPage — tile-badge slot wrapper class (W1366)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("wraps tile-badge-snap in a span with class tile-badge-slot", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the visible pool to "Snap" so the lone `tile-badge-snap`
    // testid is reachable without being shadowed by a featured-strip
    // double (`feat-tile-badge-snap`).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Snap" } });

    const badge = await waitFor(() => screen.getByTestId("tile-badge-snap"));
    expect(badge).toBeInTheDocument();

    // Pin the wrapping slot's class — this is the only positioning hook
    // in Badge.css that puts the pill at the tile's top-right corner.
    // Pin tagName too: a `<div>` here would invalidate inline-flow inside
    // the tile <a> (anchors permit phrasing content only).
    const parent = badge.parentElement;
    expect(parent).not.toBeNull();
    expect(parent!.tagName).toBe("SPAN");
    expect(parent!.className).toContain("tile-badge-slot");
  });
});
