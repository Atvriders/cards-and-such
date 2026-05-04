import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1307 — the lobby tile (the menu trigger that owns
 * `aria-haspopup="menu"` / toggles `aria-expanded` per W874/W1267)
 * advertises a rich `aria-label` that mirrors the visible chrome:
 * "<title>, <category>, <plays>, <fav-state>" (LobbyPage.tsx ~L2962-L2967).
 *
 * Existing coverage pins the trigger's `aria-haspopup="menu"` constant
 * (W874 in LobbyTileMenu.test.tsx ~L283) and the `aria-expanded` open/close
 * toggle (LobbyTileMenu.test.tsx ~L332). What no test pins is the tile's
 * accessible *name* — a regression that drops the favorite suffix, swaps
 * "no plays yet" for an empty string, or stops feeding `g.title` through
 * would silently degrade the screen-reader experience without breaking any
 * visual or interaction test.
 *
 * `texas-holdem` is the canonical standalone (non-family) id reused by
 * sibling W874 / W248 / W766 / W789 / W803 tests — its `tile-texas-holdem`
 * testid resolves to the plain `GameCard` whose root `<Link>` carries the
 * aria-label we pin. Title "Texas Hold'em" and category "cards" are
 * stamped at registration (web/src/games/texas-holdem/index.ts L71-L73);
 * fresh localStorage means playCount=0 ("no plays yet") and the id is not
 * favorited by default ("not favorited").
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx so
 * it shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the main test module — mirrors W874/W766/W789.
 */
describe("LobbyPage — tile-menu trigger aria-label format (W1307)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("tile aria-label mirrors title, category, plays, and favorite state", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default sort is alphabetical and the lobby paginates at PAGE_SIZE=80;
    // narrow the visible grid via search to reach Texas Hold'em
    // deterministically — same approach as W874.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // The four-part label is the load-bearing contract: regressing any
    // segment (e.g. dropping "no plays yet" when playCount is 0, or
    // omitting the favorite suffix) would silently change SR output.
    expect(tile).toHaveAttribute(
      "aria-label",
      "Texas Hold'em, Cards, no plays yet, not favorited",
    );
  });
});
