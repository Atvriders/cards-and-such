import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1194 — the `chip-hidden` badge count surfaces `hiddenCount` per the
 * Chip wiring at LobbyPage.tsx ~L1960. That value is `hiddenSet.size`
 * (LobbyPage.tsx ~L1688), and `hiddenSet` is seeded from
 * `readHiddenGames()` (LobbyPage.tsx ~L742). With an empty / missing
 * `cards-hidden-games` localStorage blob, `readHiddenGames()` (see
 * platform/userdata.ts ~L497) returns an empty Set via the `!raw`
 * short-circuit at userdata.ts ~L501, so the count MUST be 0 and the
 * chip's `.lobby-chip-count` badge MUST render the literal string "0".
 *
 * Sibling coverage:
 *   - W1139 (LobbyTopRatedChipBadgeZero.test.tsx) pins the analogous
 *     zero-state for `chip-top-rated`.
 *   - W1158 (LobbyFavoritesChipBadgeZero.test.tsx) pins the analogous
 *     zero-state for `chip-favorites`.
 *   - W1175 (LobbyRecentlyPlayedChipBadgeZero.test.tsx) pins the
 *     analogous zero-state for `chip-recently-played`.
 *   - LobbyPageHide.test.tsx exercises the hide-tile menu path and the
 *     `cards-hidden-games` storage listener but doesn't assert the
 *     chip badge text on a fresh, nothing-hidden mount.
 *   - The chip-strip count audit (LobbyPage.test.tsx ~L2333) only
 *     checks the badge matches `/^\d[\d,]*$/` — it accepts ANY digit
 *     string, so a regression that miscounted hidden ids would slip.
 *
 * A regression that mis-initialised `hiddenSet` (e.g. seeded from
 * `GAMES.length`, forgot the empty-Set fallback in `readHiddenGames`,
 * or threw on missing storage) would either render a non-zero badge
 * or crash before render. This pins the exact "0" text on a fresh,
 * hidden-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1139 / W1158 / W1175 / W874 / W908 / W932 / W951 /
 * W965: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-hidden badge reads 0 on empty cards-hidden-games (W1194)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-hidden count badge as '0' when cards-hidden-games is empty", () => {
    // Sanity: the canonical hidden-games blob is absent so
    // readHiddenGames() resolves to an empty Set via the `!raw`
    // short-circuit at userdata.ts ~L501, driving hiddenSet.size = 0.
    expect(localStorage.getItem("cards-hidden-games")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid the chip when its count is zero.
    const chip = screen.getByTestId("chip-hidden");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, so
    // the literal string "0" is the contract here.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("0");
  });
});
