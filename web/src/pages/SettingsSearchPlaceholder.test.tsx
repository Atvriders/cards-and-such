import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1247 — focused coverage of the placeholder copy on the SettingsPage
// header search input. SettingsPage.tsx renders a `<input type="search">`
// inside `.settings-search` with `placeholder="Search settings…"` so the
// empty-state hints at the filter behavior driven by `matchesQuery(label)`.
// Other Settings tests exercise the input's onChange + filtering (W835)
// and its `aria-label` via the testid lookup, but nothing pins the literal
// placeholder string. A regression that swapped the copy for a generic
// "Search…" placeholder (or dropped it entirely while leaving the testid
// in place) would otherwise slip through. Pin the attribute so the empty-
// state contract is explicit.
describe("SettingsPage search input placeholder (W1247)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the header search input with the Search settings placeholder", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const search = screen.getByTestId(
      "settings-search-input",
    ) as HTMLInputElement;
    expect(search).toHaveAttribute("placeholder", "Search settings…");
  });
});
