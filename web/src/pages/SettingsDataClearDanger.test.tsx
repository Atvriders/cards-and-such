import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1294 — focused coverage of the `settings-action--danger` class modifier
// on the "Clear all" data-management button. SettingsPage.tsx renders the
// destructive action with `className="settings-action settings-action--danger"`
// so the CSS rule that paints the row red (and pulls focus to it as a
// destructive control) actually applies. A regression that dropped the
// modifier would visually downgrade the button to look identical to Export
// and Import — users would lose the only visual cue that this row wipes
// every `cards-` key on the device. Pin the modifier here so a future
// data-section refactor can't quietly demote the danger styling.
describe("SettingsPage clear-all button danger modifier (W1294)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tags the clear-all action with the danger className modifier", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const clear = screen.getByTestId("settings-clear");
    expect(clear).toHaveClass("settings-action");
    expect(clear).toHaveClass("settings-action--danger");
    // Sibling Export button must NOT carry the danger modifier — otherwise
    // the regression-pin would silently allow danger styling to spread.
    const exportBtn = screen.getByTestId("settings-export");
    expect(exportBtn).toHaveClass("settings-action");
    expect(exportBtn).not.toHaveClass("settings-action--danger");
  });
});
