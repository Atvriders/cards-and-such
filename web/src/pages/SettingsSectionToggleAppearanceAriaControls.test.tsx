import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1682 — focused coverage of the `aria-controls` attribute on the
// Appearance section accordion toggle. SettingsPage.tsx wires the
// `settings-section-toggle-appearance` button to its body via
// aria-controls="settings-appearance-body" so screen readers can jump
// from the toggle to the disclosed panel. The Data sibling has its own
// pinned test; this mirrors it for the Appearance section so a rename
// or drop of the body id can't sneak past the suite.
describe("SettingsPage Appearance section toggle aria-controls (W1682)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wires the Appearance accordion toggle to its body via aria-controls", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const toggle = screen.getByTestId("settings-section-toggle-appearance");
    expect(toggle).toHaveAttribute("aria-controls", "settings-appearance-body");
  });
});
