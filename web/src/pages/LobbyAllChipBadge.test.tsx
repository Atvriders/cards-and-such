import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1208 — the `chip-all` badge count surfaces the full registry size per
 * the Chip wiring at LobbyPage.tsx ~L1935 (`count={GAMES.length}`). Unlike
 * the user-data-driven chips (`chip-hidden`, `chip-favorites`,
 * `chip-recently-played`, `chip-top-rated`) whose zero-state is pinned by
 * sibling tests (W1194 / W1158 / W1175 / W1139), `chip-all` is a STATIC
 * total drawn from the registry import (LobbyPage.tsx ~L3:
 * `import { GAMES } from "../games/registry.js"`). The Chip component
 * (LobbyPage.tsx ~L2664) renders `count.toLocaleString()` inside
 * `.lobby-chip-count`, so the literal contract is
 * `GAMES.length.toLocaleString()`.
 *
 * Sibling coverage:
 *   - W1139 (LobbyTopRatedChipBadgeZero.test.tsx) pins zero-state for
 *     `chip-top-rated`.
 *   - W1158 (LobbyFavoritesChipBadgeZero.test.tsx) pins zero-state for
 *     `chip-favorites`.
 *   - W1175 (LobbyRecentlyPlayedChipBadgeZero.test.tsx) pins zero-state
 *     for `chip-recently-played`.
 *   - W1194 (LobbyHiddenChipBadgeZero.test.tsx) pins zero-state for
 *     `chip-hidden`.
 *   - The chip-strip count audit (LobbyPage.test.tsx ~L2333) only checks
 *     each badge matches `/^\d[\d,]*$/` — it accepts any digit string,
 *     so a regression that miscounted the registry total (e.g. wired
 *     `count={filteredGames.length}` or hard-coded a stale literal) would
 *     slip through.
 *
 * A regression that mis-wired the `chip-all` count (passing the filtered
 * pool, the visible-after-search slice, or a hard-coded number) would
 * still satisfy the digit-shape audit but disagree with `GAMES.length`.
 * This pins the exact `GAMES.length.toLocaleString()` text on a fresh,
 * unfiltered mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1139 / W1158 / W1175 / W1194: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — chip-all badge reads GAMES.length on fresh mount (W1208)", () => {
  it("renders the chip-all count badge as GAMES.length.toLocaleString()", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid or renamed the all-games chip.
    const chip = screen.getByTestId("chip-all");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, and
    // the count source is the static `GAMES.length` import (LobbyPage.tsx
    // ~L1935), so the contract is `GAMES.length.toLocaleString()`.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe(GAMES.length.toLocaleString());
  });
});
