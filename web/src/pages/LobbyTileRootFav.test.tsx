import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1638 — the lobby tile root `<Link>` (LobbyPage.tsx ~L2970-L2976)
 * advertises an `aria-label` whose final segment toggles between
 * "favorited" and "not favorited" depending on the persisted
 * `cards-favorites` localStorage blob (see LobbyPage.tsx L2966:
 * `const favLabel = isFavorite ? "favorited" : "not favorited";`).
 *
 * Existing coverage (W1307 in LobbyTileMenuTriggerLabel.test.tsx) pins the
 * NEGATIVE branch — `playCount === 0` ("no plays yet") and
 * `!isFavorite` ("not favorited"). What no test pins is the POSITIVE
 * favorite branch: a regression that flipped the ternary, dropped the
 * "favorited" suffix, or stopped reading the favorites blob entirely
 * would silently degrade the screen-reader experience for any user with
 * a favorite — visual chrome (the heart marker) is gated separately so
 * a className-only test would not catch the aria-label drift.
 *
 * `texas-holdem` is the canonical standalone (non-family) id reused by
 * sibling W874 / W1307 tests — `tile-texas-holdem` resolves to the plain
 * `GameCard` whose root `<Link>` carries the aria-label we pin. Title
 * "Texas Hold'em" and category "cards" are stamped at registration
 * (web/src/games/texas-holdem/index.ts). Seeding `cards-favorites` with
 * the id BEFORE render flips `isFavorite` to true via the favorites
 * subscription (LobbyPage.tsx L893-L898 / userdata.ts FAVORITES_KEY).
 */
describe("LobbyPage — tile-root aria-label favorited branch (W1638)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("tile aria-label ends with 'favorited' when the id is in cards-favorites", async () => {
    // Seed the favorites blob BEFORE mount so the initial render already
    // sees `isFavorite=true` for Texas Hold'em — no toggle interaction
    // required, which keeps this test focused on the label format alone.
    localStorage.setItem(
      "cards-favorites",
      JSON.stringify([STANDALONE_ID]),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default sort is alphabetical and the lobby paginates at PAGE_SIZE=80;
    // narrow the visible grid via search to reach Texas Hold'em
    // deterministically — same approach as W874/W1307.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // The four-part label MUST end with the positive "favorited" suffix
    // when the id is persisted in `cards-favorites` — pinning the full
    // string also guards the other three segments against drift on the
    // favorited path (which W1307 only exercises on the NEGATIVE path).
    expect(tile).toHaveAttribute(
      "aria-label",
      "Texas Hold'em, Cards, no plays yet, favorited",
    );
  });
});
