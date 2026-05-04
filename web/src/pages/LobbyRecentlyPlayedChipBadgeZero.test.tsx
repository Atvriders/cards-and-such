import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1175 — the `chip-recently-played` badge count surfaces
 * `recentlyPlayedCount` per the Chip wiring at LobbyPage.tsx ~L1953.
 * That count walks `GAMES` and tallies entries whose
 * `lastPlayed[g.id]` is > 0 (LobbyPage.tsx ~L1676). With an empty /
 * missing `cards-last-played` localStorage blob, `readLastPlayed()`
 * (LobbyPage.tsx ~L3507) returns `{}`, so every lookup falls through
 * the `?? 0` guard and the count MUST be 0. The chip's
 * `.lobby-chip-count` badge MUST therefore render the literal "0".
 *
 * Sibling coverage:
 *   - W1139 (LobbyTopRatedChipBadgeZero.test.tsx) pins the analogous
 *     zero-state for `chip-top-rated`.
 *   - W1158 (LobbyFavoritesChipBadgeZero.test.tsx) pins the analogous
 *     zero-state for `chip-favorites`.
 *   - LobbyRecentlyPlayedOrder.test.tsx exercises the recency sort
 *     once stamps are seeded but doesn't assert the chip badge text on
 *     a fresh, never-played mount.
 *   - The chip-strip count audit (LobbyPage.test.tsx ~L2333) only
 *     checks the badge matches `/^\d[\d,]*$/` — it accepts ANY digit
 *     string, so a regression that miscounted recents would slip.
 *
 * A regression that mis-initialised `recentlyPlayedCount` (e.g.
 * seeded the count from `GAMES.length`, forgot the `?? 0` fallback
 * and crashed on `undefined > 0`, or swapped the predicate to `>= 0`)
 * would either render a non-zero badge or crash before render. This
 * pins the exact "0" text on a fresh, recents-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1139 / W1158 / W874 / W908 / W932 / W951 / W965:
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-recently-played badge reads 0 on empty cards-last-played (W1175)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-recently-played count badge as '0' when cards-last-played is empty", () => {
    // Sanity: the canonical last-played blob is absent so
    // readLastPlayed() resolves to `{}` via the `!raw` short-circuit
    // at LobbyPage.tsx ~L3510, driving recentlyPlayedCount = 0.
    expect(localStorage.getItem("cards-last-played")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid the chip when its count is zero.
    const chip = screen.getByTestId("chip-recently-played");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, so
    // the literal string "0" is the contract here.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("0");
  });
});
