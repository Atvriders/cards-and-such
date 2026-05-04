import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1154 — the lobby search input has a conditionally-rendered "Clear
 * search" button (×) that mounts only when the controlled `query`
 * state is truthy and unmounts again as soon as the query goes back
 * to the empty string.
 *
 * The button is rendered inline next to the search `<input>` as:
 *
 *   {query && (
 *     <button
 *       type="button"
 *       className="lobby-search-clear"
 *       onClick={() => setQuery("")}
 *       aria-label="Clear search"
 *     >×</button>
 *   )}
 *
 * Two independent contracts are pinned here, neither of which is
 * covered by the existing `Lobby*` tests:
 *
 *  1. The button is conditional on a non-empty query. A regression
 *     that drops the `query &&` guard (e.g. always-render with a
 *     `disabled={!query}` instead) would leak an inert × glyph into
 *     the empty-state toolbar — visible to sighted users and read
 *     out by screen readers as "Clear search button" on the very
 *     first focus into the lobby. The W1144 sibling test asserts the
 *     button is absent at mount, but only as a second witness for
 *     a query-persistence regression; it never types into the input
 *     and never clicks the button, so the *roundtrip* (absent →
 *     present → click → absent) is not pinned anywhere.
 *
 *  2. Clicking the button fully resets the controlled state — both
 *     the DOM input value AND the React state backing the conditional
 *     render. A regression that wires `onClick` to e.g.
 *     `inputRef.current?.focus()` (a plausible refactor while adding
 *     a focus-after-clear behaviour) would leave the input visually
 *     non-empty and the button still mounted, which the existing
 *     coverage would not catch.
 *
 * The test deliberately uses `fireEvent.change` (matching the
 * sibling LobbySearchNoPersist / LobbySearchType tests) rather than
 * `userEvent.type`: the `query` state is updated synchronously from
 * the controlled `onChange`, so a single `change` event is the
 * minimal trigger that exercises the conditional render. Using
 * `userEvent` would add an async dependency without changing what
 * the assertion proves.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * matches the W901/W912/W1143/W1144 sibling-file pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the main lobby suite.
 */
describe("LobbyPage — search Clear button mount/unmount roundtrip (W1154)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mounts only while query is non-empty and resets the input on click", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Initial state: query is the empty string, so the conditional
    // `{query && <button …>}` short-circuits to `false` and React
    // never inserts the button into the DOM. `queryByRole` (vs
    // `getByRole`) is required here — `getByRole` would throw on a
    // missing element, which is the very thing we are asserting.
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();

    // Type into the search box. `fireEvent.change` synchronously
    // dispatches a single change event with the target value swapped
    // out, which is exactly what the controlled `onChange` handler
    // (`(e) => setQuery(e.target.value)`) reads. The text "klondike"
    // matches the canonical query used by the sibling W1144 test —
    // the exact characters are not load-bearing, only that they are
    // a non-empty string so the `query &&` guard becomes truthy.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });
    expect(search.value).toBe("klondike");

    // The button must now be in the DOM. We resolve via the ARIA
    // label rather than a class or test-id so the assertion pins the
    // user-visible accessibility contract, not an implementation
    // detail. The same role+name selector is used to query its
    // absence above and below, keeping all three checks symmetric.
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();

    // Click the button. The handler is `() => setQuery("")`, so this
    // single click must (a) reset the controlled input value back to
    // the empty string and (b) cause React to re-render with the
    // `query &&` guard short-circuiting again, unmounting the button.
    fireEvent.click(clearBtn);

    // (a) Input value reset. Reading `.value` off the same DOM node
    // we typed into (rather than re-querying) ensures we are
    // observing the post-click state of the very element the user
    // sees, not a stale reference.
    expect(search.value).toBe("");

    // (b) Button unmounted. A regression that only blanks the input
    // value but leaves the button visible (e.g. by stashing the
    // last query in a ref) would fail this assertion while passing
    // (a), so the two checks together pin the full conditional-
    // render contract rather than just the surface DOM value.
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });
});
