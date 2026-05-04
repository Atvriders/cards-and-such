import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1607 — focused coverage of the `type` attribute on the SettingsPage
// header search input. SettingsPage.tsx renders the filter control as
// `<input type="search" ... data-testid="settings-search-input">` inside
// `.settings-search`. W1247 (SettingsSearchPlaceholder) pins the literal
// placeholder copy and W835 exercises the onChange / matchesQuery wiring,
// but nothing asserts the `type="search"` attribute itself. Pinning it
// matters because `type="search"` is what gives the input the native
// browser clear-button affordance and the implicit role="searchbox" that
// SR users rely on — a regression that switched the input back to a
// generic `type="text"` (e.g. while standardizing on a shared TextField
// component) would silently lose those affordances without breaking the
// placeholder copy or the testid. Use getAttribute (not the .type DOM
// property) so the assertion fails on a value drift instead of being
// quietly coerced back to "text" by the HTMLInputElement reflection rules.
describe("SettingsPage header search input type attribute (W1607)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the header search input with type=\"search\"", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const search = screen.getByTestId(
      "settings-search-input",
    ) as HTMLInputElement;
    expect(search.getAttribute("type")).toBe("search");
  });
});
