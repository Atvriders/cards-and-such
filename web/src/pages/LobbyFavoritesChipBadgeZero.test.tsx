import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1158 — the `chip-favorites` badge count surfaces `favSet.size` per
 * the Chip wiring at LobbyPage.tsx ~L1946. With an empty / missing
 * `cards-favorites` localStorage blob, `readFavorites()` (see
 * platform/userdata.ts ~L408) returns an empty Set, so the count MUST
 * be 0 and the chip's `.lobby-chip-count` badge MUST render the
 * literal string "0".
 *
 * Sibling coverage:
 *   - W1139 (LobbyTopRatedChipBadgeZero.test.tsx) pins the analogous
 *     zero-state for `chip-top-rated`.
 *   - The chip-strip count audit (LobbyPage.test.tsx ~L2333) only
 *     checks the badge matches `/^\d[\d,]*$/` — it accepts ANY digit
 *     string, so a regression that miscounted favorites would slip.
 *   - LobbyPageMenuFav.test.tsx exercises the favorite-toggle menu
 *     path but doesn't assert the chip badge text on a fresh mount.
 *
 * A regression that mis-initialised `favSet` (e.g. seeded from
 * `GAMES.length`, forgot the empty-Set fallback in `readFavorites`,
 * or threw on missing storage) would either render a non-zero badge
 * or crash before render. This pins the exact "0" text on a fresh,
 * favorites-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1139 / W874 / W908 / W932 / W951 / W965: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-favorites badge reads 0 on empty favorites (W1158)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-favorites count badge as '0' when cards-favorites is empty", () => {
    // Sanity: the canonical favorites blob is absent so readFavorites()
    // resolves to an empty Set via the `!raw` short-circuit at
    // userdata.ts ~L412, driving favSet.size = 0.
    expect(localStorage.getItem("cards-favorites")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid the chip when its count is zero.
    const chip = screen.getByTestId("chip-favorites");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, so
    // the literal string "0" is the contract here.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("0");
  });
});
