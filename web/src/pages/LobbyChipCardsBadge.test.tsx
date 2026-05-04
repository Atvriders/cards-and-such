import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1424 — the `chip-cards` badge count surfaces the number of GAMES
 * whose category is `"cards"` per the Chip wiring at LobbyPage.tsx
 * ~L1969 (`count={categoryCounts[cat]}`). The `categoryCounts` map is
 * built at LobbyPage.tsx ~L1003 by iterating over `GAMES` and bumping
 * `counts[g.category]` per entry, so for the `cards` category the
 * literal contract is the count of registry entries with
 * `g.category === "cards"`.
 *
 * Sibling coverage:
 *   - W1208 (LobbyAllChipBadge.test.tsx) pins `chip-all` against
 *     `GAMES.length`.
 *   - W1229 (LobbySolitaireChipBadge.test.tsx) pins `chip-solitaire`.
 *   - W1139 / W1158 / W1175 / W1194 pin zero-state for the
 *     user-data-driven chips (`chip-top-rated`, `chip-favorites`,
 *     `chip-recently-played`, `chip-hidden`).
 *
 * Among the registry-driven category chips (`chip-cards`, `chip-board`,
 * `chip-dice`, `chip-arcade`), only `chip-solitaire` was previously
 * pinned per-chip. The chip-strip count audit at LobbyPage.test.tsx
 * ~L2333 only checks each badge matches `/^\d[\d,]*$/`, so a regression
 * that mis-wired the `cards` category (e.g. iterating over `families`
 * instead of GAMES, or pulling `filteredGames` after the search filter)
 * would still satisfy the digit-shape audit but disagree with the
 * registry truth.
 *
 * This pins the `chip-cards` badge against the live registry on a
 * fresh, unfiltered mount. We compute the expected count directly from
 * `GAMES` (filtering nulls per the production guard at LobbyPage.tsx
 * ~L1008) so the assertion stays accurate as games are added/removed.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1229 / W1208: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-cards badge counts cards games (W1424)", () => {
  it("renders the chip-cards count badge as the registry's cards count", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Compute the expected count from the registry the same way the
    // production `categoryCounts` memo does (LobbyPage.tsx ~L1003):
    // skip nulls, then bucket by `g.category`.
    const expected = GAMES.filter((g) => g != null && g.category === "cards").length;

    // The chip itself MUST exist — guards against a regression that
    // accidentally hid or renamed the cards category chip.
    const chip = screen.getByTestId("chip-cards");
    expect(chip).toBeInTheDocument();

    // Pin the badge text. The Chip component (LobbyPage.tsx ~L2664)
    // renders `count.toLocaleString()` inside `.lobby-chip-count`, and
    // the count source is `categoryCounts.cards`, so the contract is
    // the localized count of cards entries in `GAMES`.
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe(expected.toLocaleString());
  });
});
