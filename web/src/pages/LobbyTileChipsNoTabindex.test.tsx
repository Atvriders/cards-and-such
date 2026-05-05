import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2255 — pin the ABSENCE of a `tabindex` attribute on the lobby
 * tile's `.tile-chips` wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2734) wraps the
 * eta + difficulty pills in a `<div class="tile-chips">`. The
 * wrapper is purely presentational — it is not focusable, not
 * interactive, and renders N-times per lobby (once per tile).
 * Adding a `tabindex` (whether `0`, `-1`, or any value) would
 * either inject the wrapper into the keyboard tab order N times
 * (a major a11y/UX regression) or programmatically focusable but
 * skipped — both wrong for a static decorative container.
 *
 * Sibling W2074 (LobbyTileChipsNoId) pins the wrapper's
 * `id`-absence, LobbyTileChipsNoRole pins role-absence, and
 * LobbyTileChipsNoStyle pins inline-style-absence. The
 * `tabindex`-absence invariant — equally load-bearing because the
 * wrapper must NOT pollute the tab order — had no dedicated
 * coverage: grepping `Lobby*.test.tsx` for `tile-chips` + `tabindex`
 * returns nothing.
 *
 * Lives in a NEW SIBLING file per the same rationale as the
 * other W-series Lobby tests: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits
 * to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper has no tabindex (W2255)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least one tile-chips wrapper without a `tabindex` attribute", async () => {
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

    // The wrapper must NOT carry a `tabindex` — the chips wrapper is
    // decorative; injecting it into (or programmatically out of) the
    // tab order on every tile would be an a11y regression.
    const wrap = wrappers[0]!;
    expect(wrap.hasAttribute("tabindex")).toBe(false);
  });
});
