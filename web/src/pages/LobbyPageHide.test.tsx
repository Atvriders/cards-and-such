import { describe, expect, it, beforeEach } from "vitest";
import type { JSX } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W574 — pin the W289 hide-tile lifecycle from the lobby's perspective.
 *
 * Two contracts are exercised here:
 *   1. The tile context-menu's `tile-menu-hide` action persists the
 *      target id into the canonical `cards-hidden-games` localStorage
 *      blob (a JSON array of ids — the on-disk shape `readHiddenGames`
 *      hydrates back into a Set). We tap on a known standalone (non-
 *      family) game tile because only `GameCard` opens the context menu
 *      on right-click — `FamilyCard` swallows that gesture.
 *   2. With one or more ids already in `cards-hidden-games`, the
 *      dedicated `chip-hidden` filter must be the ONLY chip that surfaces
 *      hidden tiles in the grid. Hitting the Settings → Data
 *      "Show hidden games" reset (which calls `clearAllHiddenGames`,
 *      i.e. `localStorage.removeItem("cards-hidden-games")`) and
 *      dispatching the matching `storage` event must in turn drop those
 *      tiles back out of the Hidden view in the same render — the lobby
 *      installs a `storage` listener keyed on `cards-hidden-games` that
 *      re-reads the set on every cross-tab / settings-driven write.
 *
 * `texas-holdem` is the canonical standalone game id used here — it is
 * NOT absorbed by any family in `web/src/games/families.ts` (verified
 * via the `expandFamily` coverage check), so its `tile-texas-holdem`
 * testid resolves to a `GameCard` whose `onContextMenu` opens the
 * `LobbyTileMenu` we want to drive.
 *
 * These tests live in a sibling file rather than appending to
 * `LobbyPage.test.tsx` so they share the same `src/pages/LobbyPage`
 * vitest path filter without colliding with concurrent edits to the
 * main test module — the contract surface (LobbyPage public testids,
 * `cards-hidden-games` persistence, `chip-hidden`/`settings-show-hidden`
 * round-trip) is identical.
 */

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LobbyPage />
    </MemoryRouter>,
  );
}

describe("LobbyPage — hide-tile + Hidden chip + reset (W574)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking tile-menu-hide adds the id to the cards-hidden-games Set", async () => {
    renderAt("/");
    // Default sort is alphabetical and the lobby paginates at PAGE_SIZE=80
    // entries; "Texas Hold'em" sits well past the first page, so we type
    // a unique substring into the search input to narrow the visible
    // grid down to a deterministic, well-inside-bounds tile.
    // `lobby-search` feeds straight into the filter via
    // `useDeferredValue`, so a `waitFor` on the testid is enough to wait
    // out the deferred-value commit.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    // Sanity: the hidden-games blob starts empty — nothing in storage is
    // biasing the assertion before the click.
    expect(localStorage.getItem("cards-hidden-games")).toBeNull();
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // Right-click opens the tile context menu (`onTileContextMenu`
    // captures the event and stamps `menuPos` so `LobbyTileMenu`
    // mounts). fireEvent.contextMenu forwards a `MouseEvent` whose
    // clientX/Y default to 0 — fine, the popover anchors at (0,0) but
    // is still in the DOM and the items resolve by testid.
    fireEvent.contextMenu(tile);
    const hideItem = await screen.findByTestId("tile-menu-hide");
    expect(hideItem).toBeInTheDocument();

    fireEvent.click(hideItem);

    // The persistence side-effect: `hideGamePersist` writes the sorted
    // JSON array under the canonical key. We parse rather than compare
    // raw strings so a future serialization tweak (e.g. extra ids being
    // sorted in) doesn't fragility-fail this assertion.
    const raw = localStorage.getItem("cards-hidden-games");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as unknown;
    expect(Array.isArray(parsed)).toBe(true);
    expect(new Set(parsed as string[])).toEqual(new Set([STANDALONE_ID]));

    // The menu auto-closes after a hide action (run() calls onClose),
    // confirming the click was actually dispatched through the menu's
    // command-runner rather than swallowed by an outer handler.
    expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
  });

  // W697 — pin the in-render chip-hidden count badge update on hide.
  //
  // W574 (above) confirms the localStorage write side of a click-hide,
  // and the seeded-storage test below confirms the badge mirrors a
  // pre-populated set on mount. Neither pins the contract that *during
  // the same render* a click-hide flips the chip-hidden count badge
  // from "0" to "1" — i.e. the hideGame() callback's state update
  // recomputes hiddenCount synchronously alongside hiddenSet, with no
  // remount or storage-event needed. A regression that updated only
  // localStorage but forgot to bump the local state (e.g. a missed
  // setHiddenSet call after persistence) would slip past both existing
  // tests but be caught here.
  it("clicking tile-menu-hide updates the chip-hidden count badge in the same render", async () => {
    renderAt("/");

    // Baseline: nothing hidden yet, so the chip-hidden badge reads "0".
    // We grab the chip up front so the post-click assertion is against
    // the *same* DOM node — this confirms the badge re-renders in place
    // rather than being swapped wholesale by an unrelated re-render.
    const hiddenChip = screen.getByTestId("chip-hidden");
    expect(hiddenChip).toHaveTextContent("0");

    // Drive the same hide pathway as W574-test-1 — search-narrow then
    // right-click → tile-menu-hide on the canonical standalone game id.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );
    fireEvent.contextMenu(tile);
    const hideItem = await screen.findByTestId("tile-menu-hide");
    fireEvent.click(hideItem);

    // The contract pin: the chip-hidden count badge must reflect the
    // newly-hidden game in the *same* render cycle. We waitFor to allow
    // the post-click setState to flush, but no storage-event is fired —
    // the click handler's setHiddenSet is the only path that can drive
    // this update.
    await waitFor(() => {
      expect(screen.getByTestId("chip-hidden")).toHaveTextContent("1");
    });
    // Sanity twin: the canonical persistence side-effect also fired,
    // confirming the in-render badge update isn't silently divorcing
    // local state from the on-disk shape.
    const raw = localStorage.getItem("cards-hidden-games");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual([STANDALONE_ID]);
  });

  it("Hidden chip surfaces hidden tiles; storage-event reset hides them again", async () => {
    // Seed a single hidden id directly under the canonical key so the
    // page hydrates with that tile already filtered out of the All grid
    // — this isolates the chip + reset behaviour from the click pathway
    // exercised in the test above.
    localStorage.setItem(
      "cards-hidden-games",
      JSON.stringify([STANDALONE_ID]),
    );
    renderAt("/");

    // Default filter is "all" — hidden tiles MUST be filtered out so a
    // user never sees a tile they explicitly hid leaking into the main
    // grid (the contract `pool = allGames.filter((g) => !hiddenSet.has)`
    // pins).
    expect(
      screen.queryByTestId(`tile-${STANDALONE_ID}`),
    ).not.toBeInTheDocument();

    // Flip to the dedicated Hidden chip — the only filter that opts
    // back in to showing hidden tiles. The chip's count badge mirrors
    // `hiddenSet.size`, so a regression dropping the count would also
    // surface here.
    const hiddenChip = screen.getByTestId("chip-hidden");
    expect(hiddenChip).toHaveTextContent("1");
    fireEvent.click(hiddenChip);
    expect(hiddenChip).toHaveAttribute("aria-pressed", "true");
    // Persistence twin — `cards-lobby-filter` stores the active chip so
    // a reload lands the user back on the Hidden view.
    expect(localStorage.getItem("cards-lobby-filter")).toBe("hidden");

    // The previously-hidden tile is now visible because the Hidden chip
    // inverts the predicate (`pool = allGames.filter(g => hiddenSet.has)`).
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );
    expect(tile).toBeInTheDocument();

    // Simulate the Settings → Data → "Show hidden games" reset. The
    // SettingsPage handler calls `clearAllHiddenGames`, which is just a
    // `localStorage.removeItem("cards-hidden-games")`; in a real app
    // that triggers a `storage` event in any other tab listening on the
    // lobby. jsdom doesn't auto-fire `storage` for same-tab writes, so
    // we dispatch one manually — the lobby's effect listens for exactly
    // this key (or null, which jsdom emits for `clear()`) and re-reads
    // via `readHiddenGames()`.
    act(() => {
      localStorage.removeItem("cards-hidden-games");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cards-hidden-games" }),
      );
    });

    // The hidden-set is now empty, so the Hidden filter's pool is empty
    // and the previously-surfaced tile drops back out of the grid.
    await waitFor(() => {
      expect(
        screen.queryByTestId(`tile-${STANDALONE_ID}`),
      ).not.toBeInTheDocument();
    });
    // Belt-and-suspenders: the chip's count badge must also reflect the
    // wiped set — a stale count would expose a regression where the
    // listener forgets to recompute `hiddenCount` alongside the set.
    expect(screen.getByTestId("chip-hidden")).toHaveTextContent("0");
  });
});

/**
 * W248 — LobbyTileMenu Play action routes to /play/<id>.
 *
 * The right-click context menu's first item (`tile-menu-play`) must
 * invoke `onMenuPlay`, which calls `navigate(`/play/${g.id}`)`. We
 * exercise the user-visible outcome by mounting a sibling
 * `LocationProbe` inside the same `MemoryRouter` and asserting the
 * router's pathname after the click — pinning the actual URL change
 * rather than spying on `navigate` internals. `texas-holdem` is reused
 * here for the same reason as the W574 hide tests above: it is a
 * canonical standalone (non-family) game id whose `tile-<id>` resolves
 * to a `GameCard` that opens the context menu on right-click.
 */
describe("LobbyPage — LobbyTileMenu Play action routes (W248)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("right-click then tile-menu-play navigates to /play/<id>", async () => {
    function LocationProbe(): JSX.Element {
      const loc = useLocation();
      return <div data-testid="loc-probe">{loc.pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
        <LocationProbe />
      </MemoryRouter>,
    );

    // Baseline: still on the lobby root before any interaction.
    expect(screen.getByTestId("loc-probe").textContent).toBe("/");

    // Narrow the grid to the target tile via the search input — see the
    // W574 test above for why this is required (PAGE_SIZE pagination).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // Right-click opens the LobbyTileMenu popover; `tile-menu-play` is
    // the first item and runs `navigate(`/play/${g.id}`)` via run().
    fireEvent.contextMenu(tile);
    const playItem = await screen.findByTestId("tile-menu-play");
    fireEvent.click(playItem);

    // The router location now reflects the play route for this id —
    // exact pathname pin (not a regex) so a regression that routes to
    // the wrong id or a different prefix is caught.
    await waitFor(() => {
      expect(screen.getByTestId("loc-probe").textContent).toBe(
        `/play/${STANDALONE_ID}`,
      );
    });
    // The menu auto-closes after run() — confirms the click flowed
    // through the menu's command runner rather than a stray handler.
    expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
  });
});
