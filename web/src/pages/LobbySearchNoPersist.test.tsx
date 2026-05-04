import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1144 — the lobby search query is intentionally NOT persisted across
 * page reloads.
 *
 * LobbyPage holds two superficially similar pieces of toolbar state:
 *
 *   const [query, setQuery] = useState("");
 *   const [filter, setFilter] = useState<Filter>(() => readPersistedFilter());
 *
 * `filter` rehydrates from localStorage (FILTER_STORAGE_KEY =
 * "cards-lobby-filter") so a chip selection survives the next visit.
 * `query`, by contrast, initialises to the empty string with no lazy
 * initialiser — the search box is empty on every fresh mount, even if
 * the previous session left a query in the input.
 *
 * This asymmetry is deliberate: a saved query would silently hide most
 * of the catalogue on the next page load, which is a much worse default
 * than a saved chip (chips have a visible highlight + count badge that
 * advertises the filtered state, the search box has no such marker once
 * the input scrolls offscreen on small viewports).
 *
 * The risk is a copy-paste regression that mirrors the `filter`
 * persistence pattern onto `query` (e.g. adds a `cards-lobby-query` key
 * + `useState(() => readPersistedQuery())`). Because every existing
 * search test starts from a freshly-mounted lobby and types its own
 * query, none of them would catch a silent rehydration of a stale
 * value from a prior render.
 *
 * The test simulates a "reload" by typing into the search input,
 * unmounting the lobby (the React lifecycle equivalent of leaving the
 * page), and remounting it. A persisted query would resurface on the
 * second mount; the contract pinned here is that it does NOT.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * matches the W901/W912/W1143 sibling-file pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — search query is not persisted across reload (W1144)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("a query typed before unmount does not rehydrate on remount", () => {
    // First mount: type a non-empty query so the controlled `query`
    // state is truthy. We use "klondike" to mirror the canonical
    // search query used by the W566/W608 sibling tests; the exact
    // text is not load-bearing — only that it differs from the empty
    // string so a persisted value would be observable on remount.
    const first = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );
    const search1 = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search1, { target: { value: "klondike" } });
    expect(search1.value).toBe("klondike");

    // Sanity check: the `filter` slot DOES persist via localStorage
    // (FILTER_STORAGE_KEY), so a chip selection at this point would be
    // visible on remount. We deliberately do NOT touch `filter` here —
    // the contrast with `query` is the entire point of this test, and
    // mixing them would obscure which state slot the assertion targets.

    // Tear the page down. This is the unit-test equivalent of the user
    // navigating away or reloading: the React tree unmounts, all
    // useState slots are discarded, and the next mount runs the lazy
    // initialisers from scratch. Any state that survives must do so
    // via an external store (localStorage / sessionStorage) — which is
    // exactly what we are pinning the absence of.
    first.unmount();

    // Second mount, same router, same component. If a regression
    // wired `query` to a localStorage key (the obvious copy-paste of
    // the existing `filter` persistence), the input would mount with
    // value="klondike" here and this assertion would fail.
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );
    const search2 = screen.getByTestId("lobby-search") as HTMLInputElement;
    expect(search2.value).toBe("");

    // The conditionally-rendered clear-x button (see W608) is bound to
    // `query` being truthy, so its absence on remount is a second,
    // independent witness that the query state is empty. Asserting both
    // pins "the input visually shows nothing" AND "the React state
    // backing it is the empty string" without poking at internals.
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });
});
