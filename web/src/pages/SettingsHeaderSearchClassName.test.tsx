import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1625 — focused coverage of the `className="settings-search-input"`
// attribute on the SettingsPage header search input. SettingsPage.tsx
// renders the filter control as `<input type="search"
// className="settings-search-input" ... data-testid="settings-search-input">`
// inside `.settings-search`. W1247 (SettingsSearchPlaceholder) pins the
// literal `placeholder="Search settings…"` copy, W1607
// (SettingsHeaderSearchType) pins `type="search"`, and W1615
// (SettingsHeaderSearchAriaLabel) pins `aria-label="Search settings"`,
// but nothing asserts the literal `settings-search-input` class string on
// the input element itself. Pinning it matters because that exact class
// is the CSS hook the page stylesheet uses to size, pad, and theme the
// search box — a regression that renames it (e.g. while migrating to a
// shared TextField primitive that swaps in `text-input` or `field-input`)
// would silently strip the visual styling without breaking any other
// test, leaving an unstyled input in the header. Use getAttribute("class")
// so the assertion fails on any value drift instead of just the absence
// of a single token.
describe("SettingsPage header search input className (W1625)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tags the header search input with className=\"settings-search-input\"", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const search = screen.getByTestId(
      "settings-search-input",
    ) as HTMLInputElement;
    expect(search.getAttribute("class")).toBe("settings-search-input");
  });
});
