import { describe, expect, it, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

/**
 * W1228 — companion to W1213 (LobbyLoadMoreClick.test.tsx).
 *
 * The lobby's infinite-scroll mode renders a manual fallback button
 *   <button data-testid="lobby-load-more">Load more · <N> remaining</button>
 * gated by `hasMore = visibleCount < filtered.length`. Once the user
 * (or sentinel) has loaded every entry the gate flips to false and the
 * button is unmounted entirely — there is no end-state "0 remaining"
 * label hanging around. W1213 covers a single click; this test pins
 * the *terminal* condition: clicking until exhausted hides the button.
 *
 * Sibling-file placement (LobbyLoadMoreEnd.test.tsx) keeps it on the
 * `src/pages/Lobby` vitest path filter without touching LobbyPage.tsx
 * or the existing W1213 test.
 */
describe("LobbyPage — load-more hides at end (W1228)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Without infinite mode the load-more branch never renders;
    // pagination uses Prev/Next instead.
    localStorage.setItem("cards-lobby-list-mode", "infinite");
  });

  it("clicking lobby-load-more until exhausted unmounts the button (no 'remaining' left)", () => {
    // Only meaningful when the registry exceeds the initial 80-tile
    // window — otherwise hasMore is false from the start and there is
    // no terminal transition to observe.
    expect(GAMES.length).toBeGreaterThan(80);

    const { getByTestId, queryByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: initial load-more is present and labelled with a
    // remaining count (the W1213 shape).
    const initial = getByTestId("lobby-load-more");
    expect(initial.textContent).toMatch(/^Load more · [\d,]+ remaining$/);

    // Click load-more until it disappears. PAGE_SIZE is 80 and the
    // registry has GAMES.length entries, so ceil((N-80)/80) clicks
    // is the upper bound. Add a generous safety margin and bail if
    // we somehow exceed it — the assertion below will fail loudly
    // rather than spinning forever.
    const maxClicks = Math.ceil(GAMES.length / 80) + 4;
    let clicks = 0;
    while (clicks < maxClicks) {
      const btn = queryByTestId("lobby-load-more");
      if (!btn) break;
      fireEvent.click(btn);
      clicks += 1;
    }

    // Terminal state: the button is gone (not just disabled, not just
    // showing "0 remaining"). The hasMore guard unmounts the wrapper
    // entirely so queryByTestId returns null.
    expect(queryByTestId("lobby-load-more")).toBeNull();
    // The sentinel wrapper is gated by the same hasMore flag, so it
    // should also be gone — pinning this prevents a regression where
    // hasMore moves but the empty wrapper lingers.
    expect(queryByTestId("lobby-sentinel")).toBeNull();
  });
});
