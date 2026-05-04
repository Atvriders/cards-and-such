import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1451 — the lobby search clear-x button is rendered with the literal
 * `type="button"` attribute, pinning the explicit non-submit type on
 * the conditionally-mounted `<button className="lobby-search-clear">`
 * affordance that sits inside the `.lobby-search` wrapper.
 *
 * Why this needs its own pin:
 *  - The clear button lives inline next to the lobby `<input
 *    type="search">`. HTML's default `<button>` type inside a form
 *    context is `submit`. The lobby today is not wrapped in a `<form>`,
 *    so the practical impact is masked — but a future refactor that
 *    wraps the search row in a `<form>` for "press Enter to focus
 *    first match" semantics would, without an explicit `type="button"`,
 *    cause a click on the × to trigger an implicit form submission /
 *    page navigation rather than only resetting the controlled
 *    `query` state. Pinning the literal attribute today guarantees that
 *    refactor is type-safe at the CI level.
 *  - Existing sibling pins cover orthogonal contracts on the same
 *    button:
 *      W608  → conditional mount + className="lobby-search-clear"
 *      W1154 → mount/unmount roundtrip via aria-label="Clear search"
 *    Neither inspects the `type` attribute, so a regression that drops
 *    `type="button"` (or downgrades it to `type="submit"`) slips
 *    through CI today.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W901/W912/W1143/W1248/W1339 sibling-file pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the main lobby suite.
 */
describe("LobbyPage — search clear button type attribute (W1451)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the clear-x button with the literal type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The clear button is conditionally mounted on a non-empty query,
    // so we must first type into the search input to make it appear.
    // We use `fireEvent.change` (matching the W1154 / W608 sibling
    // tests) because the controlled `onChange` reads `e.target.value`
    // synchronously — a single change event is the minimal trigger
    // that exercises the conditional render. The text "klondike"
    // mirrors the canonical query the sibling W608/W1154 tests use;
    // the exact characters are not load-bearing, only that the value
    // is non-empty so the `query &&` guard becomes truthy.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    // Resolve the button via its accessible name (the same selector
    // the W608/W1154 sibling pins use) so the lookup is independent
    // of the attribute under test. `getAttribute("type")` reads the
    // raw rendered DOM attribute, bypassing the HTMLButtonElement
    // `.type` property bridge (which normalises a missing/invalid
    // attribute to the string "submit"). A regression that drops
    // `type="button"` from the JSX would therefore yield `null` here
    // — and a regression that flips it to `submit` would yield
    // "submit" — both of which fail this assertion, while the
    // property-bridge alternative would mask the dropped-attribute
    // case as "submit" and only catch the explicit-flip case.
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    expect(clearBtn.getAttribute("type")).toBe("button");
  });
});
