import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1899: StatsPage's page-level title "Your stats" must be rendered using
 * the `<h1>` element specifically — i.e. the DOM tagName is exactly "H1".
 *
 * The existing coverage (W823, W1570, W1580, W1893) all locate the heading
 * via `screen.getByRole("heading", { level: 1, name: "Your stats" })`,
 * which PRE-FILTERS by role + level before the assertion ever runs. That
 * selector returns the first matching heading regardless of tagName: in
 * a future refactor that swaps the literal `<h1>` for `<div role="heading"
 * aria-level={1}>Your stats</div>`, every existing `tagName === "H1"`
 * assertion would *still pass* (or, more precisely, would pick up a
 * different element that happens to be an h1, e.g. a hidden screen-reader
 * heading) without the actual rendered title regressing.
 *
 * Pin the contract via a selector that does NOT pre-filter by role/level:
 * find the first `<h1>` inside the `stats-page` container with a raw
 * `querySelector("h1")` and assert its tagName. This catches a downgrade
 * from `<h1>` → `<div role="heading">` (or `<h2>`, `<p>`, etc.) that the
 * role-based selector would silently mask.
 */
describe("StatsPage header — h1 tagName via non-role selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1899: page-level title is a real <h1> element (tagName === 'H1')", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const page = screen.getByTestId("stats-page");
    const h1 = page.querySelector("h1");
    expect(h1).not.toBeNull();
    // Pin tagName via a selector that does NOT pre-filter by role/level.
    expect(h1!.tagName).toBe("H1");
    // Sanity: the located h1 is the real page title, not some unrelated h1.
    expect(h1!.textContent).toBe("Your stats");
  });
});
