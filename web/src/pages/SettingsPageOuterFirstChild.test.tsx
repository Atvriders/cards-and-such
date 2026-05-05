import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1675 — focused coverage of the SettingsPage outer wrapper's
// first element child. SettingsPage.tsx renders `<div className=
// "settings-page" data-testid="settings-page">` whose first rendered
// element is the `<header className="settings-header">` block (the
// confirmDialog returns null when closed). Existing tests pin the
// outer className+tagName (W1655), the classList length (W1663),
// the attribute count (W1671), and the header className+tagName
// (W1634) — but nothing pins the *structural relationship* that the
// header is the outer wrapper's firstElementChild. A regression that
// reordered the children (e.g. moving a section above the header,
// or wrapping the header in an extra div) would silently break the
// page's reading order without tripping any existing assertion.
describe("SettingsPage outer wrapper firstElementChild (W1675)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the header as the outer wrapper's first element child", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const outer = screen.getByTestId("settings-page");
    const first = outer.firstElementChild;
    expect(first).not.toBeNull();
    expect(first?.tagName).toBe("HEADER");
    expect(first).toHaveClass("settings-header");
  });
});
