import { afterEach, describe, expect, it, beforeEach, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W789 — LobbyTileMenu Share-with-friend action writes the friend
 * play URL to the clipboard.
 *
 * The right-click context menu's fourth item (`tile-menu-friend`)
 * must invoke `onMenuFriend`, which builds a
 * `${origin}/play/${id}?seed=<random>&friend=1` URL from the current
 * `window.location.origin` and forwards it to
 * `navigator.clipboard.writeText`. The Copy variant is pinned by
 * W766 in LobbyPageMenuCopy.test.tsx; this test pins the Friend
 * variant — a regression that dropped the `?seed=…&friend=1` query
 * string, swapped the `/play/` prefix, or routed the click to the
 * plain copy handler would slip past every existing test but be
 * caught here.
 *
 * `texas-holdem` is the canonical standalone game id reused from the
 * sibling W574/W248/W766 tests — it's NOT absorbed by any family in
 * `web/src/games/families.ts`, so its `tile-texas-holdem` testid
 * resolves to a `GameCard` whose `onContextMenu` opens the
 * LobbyTileMenu we want to drive.
 *
 * Lives in a sibling file rather than appending to
 * `LobbyPage.test.tsx` so it shares the same `src/pages/LobbyPage`
 * vitest path filter without colliding with concurrent edits to the
 * main test module.
 */
describe("LobbyPage — LobbyTileMenu Share-with-friend writes friend URL to clipboard (W789)", () => {
  const STANDALONE_ID = "texas-holdem";
  // Track the original clipboard descriptor so we can fully restore
  // it after each test — `navigator.clipboard` is non-writable in
  // jsdom by default, hence the defineProperty dance, mirroring the
  // pattern in LobbyPageMenuCopy.test.tsx.
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    localStorage.clear();
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
  });

  afterEach(() => {
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
    } else {
      // No descriptor existed prior — drop our stub so other tests
      // see an unstubbed navigator.
      // @ts-expect-error - allow delete for cleanup
      delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });

  it("right-click then tile-menu-friend writes /play/<id>?seed=<n>&friend=1 to navigator.clipboard", async () => {
    // Stub clipboard.writeText so we can inspect the exact string the
    // friend handler hands off — the user-visible side-effect (the
    // toast) is also fired, but the *contract* this test pins is the
    // URL shape (incl. seed + friend flag), not the toast copy.
    const writeText = vi.fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default sort is alphabetical and the lobby paginates at
    // PAGE_SIZE=80 entries; "Texas Hold'em" sits past the first page,
    // so we type a unique substring to narrow the visible grid down
    // to a deterministic, well-inside-bounds tile. Mirrors the W766
    // approach in LobbyPageMenuCopy.test.tsx.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // Right-click opens the LobbyTileMenu popover. fireEvent.contextMenu
    // forwards a MouseEvent whose clientX/Y default to 0 — fine, the
    // popover anchors at (0,0) but is still in the DOM and the menu
    // items resolve by testid.
    fireEvent.contextMenu(tile);
    const friendItem = await screen.findByTestId("tile-menu-friend");
    expect(friendItem).toBeInTheDocument();

    // The handler is async (awaits writeText), so wrap the click in
    // act() and let the promise microtask flush before asserting on
    // the spy — without this the assertion races the clipboard
    // resolve.
    await act(async () => {
      fireEvent.click(friendItem);
    });

    // The URL contract: origin + "/play/" + id + "?seed=<int>&friend=1",
    // exactly once. jsdom's default origin is "http://localhost:3000"
    // but we don't pin that — instead we pin the suffix shape so a
    // regression dropping the `?seed=…&friend=1` query string or
    // routing through the plain copy handler is caught regardless of
    // the test runner's origin or the random seed value.
    expect(writeText).toHaveBeenCalledTimes(1);
    const arg = writeText.mock.calls[0]?.[0] as string;
    expect(arg).toMatch(/\/play\/texas-holdem\?seed=\d+&friend=1$/);

    // The menu auto-closes after run() — confirms the click flowed
    // through the menu's command-runner rather than a stray handler.
    await waitFor(() => {
      expect(screen.queryByTestId("tile-menu")).not.toBeInTheDocument();
    });
  });
});
