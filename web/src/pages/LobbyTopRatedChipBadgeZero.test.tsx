import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1139 — the `chip-top-rated` badge count surfaces the live count of
 * games whose stored rating meets `TOP_RATED_THRESHOLD` (= 4) per the
 * `topRatedCount` useMemo at LobbyPage.tsx ~L1665. With an empty
 * `cards-ratings` localStorage blob, every game's rating resolves to 0
 * via `ratings[g.id] ?? 0`, so the count MUST be 0 and the chip's
 * `.lobby-chip-count` badge MUST render the literal string "0".
 *
 * Sibling coverage:
 *   - W718 (LobbyPage.test.tsx ~L2682) pins the chip's persistence
 *     round-trip but doesn't read the badge text.
 *   - W932 (LobbyTopRatedFilter.test.tsx) pins the filter content
 *     contract once a rating is seeded, not the zero-rating boundary.
 *   - The chip-strip count audit (LobbyPage.test.tsx ~L2333) only
 *     checks the badge matches `/^\d[\d,]*$/` — it accepts ANY digit
 *     string, so a regression that miscounted would slip through.
 *
 * A regression that mis-initialised `topRatedCount` (e.g. seeded the
 * count from `GAMES.length` instead of filtering by threshold, or
 * forgot the `?? 0` fallback and crashed on `undefined >= 4`) would
 * either render a non-zero badge or no badge at all. This pins the
 * exact "0" text on a fresh, ratings-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W932 / W951 / W965: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-top-rated badge reads 0 on empty ratings (W1139)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-top-rated count badge as '0' when cards-ratings is empty", () => {
    // Sanity: the canonical ratings blob is absent so every game's
    // rating resolves to 0 via the `ratings[g.id] ?? 0` fallback at
    // LobbyPage.tsx ~L1669, driving topRatedCount = 0.
    expect(localStorage.getItem("cards-ratings")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid the chip when its count is zero.
    const chip = screen.getByTestId("chip-top-rated");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, so
    // the literal string "0" is the contract here.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("0");
  });
});
