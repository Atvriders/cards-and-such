import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { JSX } from "react";
import LobbyPage from "./LobbyPage.js";

/**
 * W874 — clicking a standalone game tile's `<Link>` body navigates the
 * router to `/play/<id>`.
 *
 * Existing coverage pins the *right-click menu* play action
 * (LobbyPageHide.test.tsx W248 → `tile-menu-play` → `navigate("/play/<id>")`)
 * and the surprise-me button (LobbyPage.test.tsx W579/W604), but no test
 * exercises the canonical primary affordance: a plain left-click on the
 * tile's outer `<Link to={`/play/${g.id}`}>` (LobbyPage.tsx L2970-L2973).
 *
 * The GameCard wrapper installs an `onClick` (LobbyPage.tsx L2902) that
 * `preventDefault()`s the navigation if a long-press or swipe gesture has
 * fired since the last reset — a fresh `fireEvent.click` carries neither,
 * so the underlying Link should route normally.
 *
 * `texas-holdem` is the canonical standalone (non-family) id reused by
 * sibling W248/W766/W789/W803 tests — its `tile-texas-holdem` testid
 * resolves to a plain `GameCard` whose root is the `<Link>` we click.
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx so
 * it shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the main test module — mirrors W766/W789/W803.
 */
describe("LobbyPage — tile <Link> click navigates to /play/<id> (W874)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking a standalone tile updates the router location to /play/<id>", async () => {
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

    // Default sort is alphabetical and the lobby paginates at PAGE_SIZE=80
    // entries; "Texas Hold'em" sits past the first page in some configs,
    // so we narrow the visible grid via search to a deterministic, well-
    // inside-bounds tile. Mirrors the W766/W789/W803 sibling approach.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // Pre-condition: still on the lobby route. A regression that
    // pre-navigates on render would surface here before any user input.
    expect(screen.getByTestId("loc-probe").textContent).toBe("/");

    // The GameCard's outer node is `<Link to="/play/<id>">`; clicking it
    // routes via React Router's anchor handler. No long-press / swipe
    // has fired, so the wrapper's `onTileClick` does NOT preventDefault.
    fireEvent.click(tile);

    // Outcome: the router location flipped to /play/<id>. Asserting on
    // the LocationProbe rather than a navigate() spy avoids coupling to
    // a particular call shape (Link uses a synthesized history.push that
    // bypasses the useNavigate hook entirely on some RR versions) — we
    // pin only the user-visible URL change.
    await waitFor(() => {
      expect(screen.getByTestId("loc-probe").textContent).toBe(
        `/play/${STANDALONE_ID}`,
      );
    });
  });
});
