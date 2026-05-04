import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1150 — the horizontal chip strip wrapping the lobby category filters
 * exposes the literal accessible name "Filter by category" via
 * `aria-label`, distinct from the drawer's "Filter by category (drawer)".
 *
 * Why this needs its own pin:
 *  - The chip strip lives in `<div class="lobby-chips" role="tablist">`
 *    and is the *visible* category filter on every viewport (the drawer
 *    tablist is hidden on small breakpoints). Existing coverage in
 *    LobbyPage.test.tsx pins the *drawer* tablist's aria-label
 *    ("Filter by category (drawer)") at lines 331 and 350, but no test
 *    in this directory inspects the chip strip's own aria-label.
 *  - A regression that drops or renames the chip strip's aria-label
 *    (e.g. switching to "Categories", or removing it in favour of a
 *    visually-hidden heading) would still leave the role="tablist" in
 *    the tree — but assistive tech would announce an unnamed tablist,
 *    or worse, two tablists with identical names if the suffix logic
 *    accidentally collapses.
 *  - The two tablists having *distinct* accessible names is what lets
 *    screen-reader users disambiguate the drawer copy from the chip
 *    strip copy when both are in the tree.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1143/W901/W912 sibling pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the main spec.
 */
describe("LobbyPage — chip strip aria-label (W1150)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the chip-strip tablist with aria-label=\"Filter by category\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className rather than the accessible name
    // so the lookup itself is independent of the attribute under test.
    // querySelector is used instead of getByRole to avoid ambiguity
    // with the sibling drawer tablist that shares role="tablist".
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Pin the literal attribute value. `getAttribute` (rather than a
    // property accessor) guarantees we read what was rendered into the
    // DOM, with no normalisation by the React property bridge. The
    // exact-match assertion also implicitly enforces the *absence* of
    // the "(drawer)" suffix, keeping the two tablists distinguishable.
    expect(strip!.getAttribute("aria-label")).toBe("Filter by category");
    expect(strip!.getAttribute("role")).toBe("tablist");
  });
});
