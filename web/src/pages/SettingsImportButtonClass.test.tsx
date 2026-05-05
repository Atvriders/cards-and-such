import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1881 — pin the exact `className` string on the data-section Import
// action button. SettingsPage.tsx renders the import action as
// `<button className="settings-action" data-testid="settings-import" ...>`
// — a single class with no modifiers. The sibling Clear button carries
// `settings-action settings-action--danger`, and the Export action carries
// the same single `settings-action` class. Sibling W1869 already pins the
// export button's exact className; this test does the equivalent for the
// import button so a refactor that adds an extra class (e.g. a layout
// helper or a "--neutral" modifier) trips a loud failure rather than
// silently shipping. Existing import tests cover type=button (W1712) and
// the file-input accept attribute, but none assert className equality.
describe("SettingsPage import button exact className (W1881)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-import with className exactly 'settings-action'", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const btn = screen.getByTestId("settings-import");
    expect(btn.className).toBe("settings-action");
  });
});
