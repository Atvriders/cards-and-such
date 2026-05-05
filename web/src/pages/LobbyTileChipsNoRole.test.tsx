import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2210 — pin the ABSENCE of a `role` attribute on the lobby
 * tile's `.tile-chips` wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2734) renders
 * `<div class="tile-chips" aria-hidden="false">` around the
 * eta + difficulty pills. The wrapper is intentionally a plain
 * `<div>` with NO explicit ARIA role — adding one (e.g.
 * `role="group"`, `role="list"`, `role="status"`) would inject
 * the wrapper into the accessibility tree per-tile and force AT
 * users to traverse a meaningless landmark before reaching the
 * tile's actual content.
 *
 * Sibling W1397 (LobbyTileChipsAria) pins `aria-hidden="false"`,
 * W2074 (LobbyTileChipsNoId) pins the absence of `id`,
 * LobbyTileChipsNoStyle pins the absence of inline `style`, and
 * LobbyTileChipsClassEq pins the exact className string. The
 * `role`-absence invariant — equally load-bearing because the
 * tile chips render N-times per lobby and the wrapper is
 * decorative grouping only — had no dedicated coverage:
 * grepping `Lobby*.test.tsx` for `tile-chips` + `role` returns
 * nothing.
 *
 * Lives in a NEW SIBLING file per the same rationale as the
 * other W-series Lobby tests: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits
 * to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper has no role (W2210)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least one tile-chips wrapper without a `role` attribute", async () => {
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

    // The wrapper must NOT carry an explicit `role` — adding one
    // injects the decorative grouping into the AT tree per-tile.
    const wrap = wrappers[0]!;
    expect(wrap.hasAttribute("role")).toBe(false);
  });
});
