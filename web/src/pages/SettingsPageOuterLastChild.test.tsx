import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1689 — focused coverage of the SettingsPage outer wrapper's
// last element child. SettingsPage.tsx renders `<div className=
// "settings-page" data-testid="settings-page">` whose last rendered
// element is the `<section className="settings-card settings-card--data"
// data-testid="settings-section-data">` block. Existing tests pin the
// outer className+tagName (W1655), the classList length (W1663), the
// attribute count (W1671), and the firstElementChild relation (W1675)
// — but nothing pins the *trailing* structural relationship that the
// "Your data" section is the outer wrapper's lastElementChild. A
// regression that appended a sibling after the data section (or
// reordered the four section cards) would silently break the page's
// reading order without tripping any existing assertion.
describe("SettingsPage outer wrapper lastElementChild (W1689)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the data section as the outer wrapper's last element child", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const outer = screen.getByTestId("settings-page");
    const last = outer.lastElementChild;
    expect(last).not.toBeNull();
    expect(last?.tagName).toBe("SECTION");
    expect(last).toHaveAttribute("data-testid", "settings-section-data");
  });
});
