import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W803 — LobbyTileMenu Add/Remove-favorite action toggles the
 * `cards-favorites` localStorage set via the right-click menu.
 *
 * The right-click context menu's third item (`tile-menu-fav`) must
 * invoke `onMenuFav` (LobbyPage.tsx ~L2933) which forwards to the
 * shared `onToggleFavorite` callback. That callback writes through
 * to `toggleFavoritePersist` from `platform/userdata.ts`, which
 * persists the canonical JSON-array blob under the `cards-favorites`
 * key (LobbyPage.tsx imports it as `toggleFavoritePersist`,
 * userdata.ts L405/L450).
 *
 * Sibling tests already pin the related menu actions:
 *   - W248 (LobbyPageHide.test.tsx)        — `tile-menu-play`
 *   - W574/W697 (LobbyPageHide.test.tsx)   — `tile-menu-hide`
 *   - W766 (LobbyPageMenuCopy.test.tsx)    — `tile-menu-copy`
 *   - W789 (LobbyPageMenuFriend.test.tsx)  — `tile-menu-friend`
 *
 * The W570 hearts suite (LobbyPageHearts.test.tsx) covers the
 * separate heart-icon `tile-fav-toggle-<id>` button on each tile —
 * this menu-driven path was last covered only at the unit level in
 * LobbyTileMenu.test.tsx (which stubs `onToggleFavorite`) and never
 * exercised through the real LobbyPage wiring + persistence layer.
 *
 * `texas-holdem` is the canonical standalone game id reused from the
 * sibling W248/W574/W697/W766/W789 tests — it's NOT absorbed by any
 * family in `web/src/games/families.ts`, so its `tile-texas-holdem`
 * testid resolves to a `GameCard` whose `onContextMenu` opens the
 * LobbyTileMenu we want to drive.
 *
 * Lives in a sibling file rather than appending to
 * `LobbyPage.test.tsx` so it shares the same `src/pages/LobbyPage`
 * vitest path filter without colliding with concurrent edits to the
 * main test module — mirrors W766/W789.
 */
describe("LobbyPage — LobbyTileMenu fav action toggles cards-favorites (W803)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("right-click then tile-menu-fav adds the id, then a second invocation removes it", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default sort is alphabetical and the lobby paginates at
    // PAGE_SIZE=80 entries; "Texas Hold'em" sits past the first page,
    // so we type a unique substring to narrow the visible grid down
    // to a deterministic, well-inside-bounds tile. Mirrors the W766
    // / W789 approach.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // Pre-condition: the favorites blob hasn't been written yet — the
    // key is created lazily on first toggle, so a clean localStorage
    // surfaces as `null` (matches the W570 hearts test pre-condition).
    expect(localStorage.getItem("cards-favorites")).toBeNull();

    // First invocation: right-click → click "Add to favorites".
    // fireEvent.contextMenu forwards a MouseEvent whose clientX/Y
    // default to 0 — fine, the popover anchors at (0,0) but is still
    // in the DOM and the menu items resolve by testid.
    fireEvent.contextMenu(tile);
    const favItem = await screen.findByTestId("tile-menu-fav");
    expect(favItem).toHaveTextContent("Add to favorites");
    fireEvent.click(favItem);

    // The menu auto-closes after run() — confirms the click flowed
    // through the menu's command-runner rather than a stray handler.
    await waitFor(() => {
      expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
    });

    // Persistence contract: the id is written verbatim into the
    // canonical JSON array blob under `cards-favorites`. We don't
    // pin the exact serialisation byte-for-byte — instead we parse
    // and assert membership so a future tweak (e.g. trailing
    // whitespace, ordering, or wrapping in an object) that still
    // preserves the read-side contract via `readFavorites()` doesn't
    // fail this test, while a regression that drops the write or
    // routes through a different key is caught.
    const afterAdd = localStorage.getItem("cards-favorites");
    expect(afterAdd).not.toBeNull();
    const addedSet = new Set<string>(JSON.parse(afterAdd as string));
    expect(addedSet.has(STANDALONE_ID)).toBe(true);

    // Second invocation: re-open menu and click again. The label now
    // reflects the live state ("Remove from favorites") — that flip
    // also confirms the in-memory `favSet` was updated, since the
    // label reads off the same `isFavorite` prop the heart toggle
    // uses.
    fireEvent.contextMenu(tile);
    const favItem2 = await screen.findByTestId("tile-menu-fav");
    expect(favItem2).toHaveTextContent("Remove from favorites");
    fireEvent.click(favItem2);

    await waitFor(() => {
      expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
    });

    // After remove: the blob still exists (toggleFavoritePersist
    // writes an empty array rather than removing the key), but the
    // id is no longer a member. Either shape (`null` or an array
    // without the id) is valid per the read-side contract, so we
    // assert membership via `readFavorites()`-equivalent parsing.
    const afterRemove = localStorage.getItem("cards-favorites");
    if (afterRemove !== null) {
      const removedSet = new Set<string>(JSON.parse(afterRemove));
      expect(removedSet.has(STANDALONE_ID)).toBe(false);
    }
  });
});
