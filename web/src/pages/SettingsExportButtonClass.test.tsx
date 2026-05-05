import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1869 — pin the exact `className` string on the data-section Export
// action button. SettingsPage.tsx renders the export action as
// `<button className="settings-action" data-testid="settings-export" ...>`
// — a single class with no modifiers. The sibling Clear button carries
// `settings-action settings-action--danger`, and the Import action carries
// the same single `settings-action` class as Export. Existing tests assert
// `toHaveClass("settings-action")` and `not.toHaveClass(...--danger)` but
// do not pin equality — so a refactor that *adds* an extra class (e.g.
// `settings-action settings-action--neutral` or a layout helper) would
// slip through. Pin exact equality here so the export button keeps its
// minimal, modifier-free className signature; if a future change needs an
// extra class, this test will fail loudly and force an explicit decision.
describe("SettingsPage export button exact className (W1869)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-export with className exactly 'settings-action'", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const btn = screen.getByTestId("settings-export");
    expect(btn.className).toBe("settings-action");
  });
});
