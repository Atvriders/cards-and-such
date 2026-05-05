import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1703 — focused coverage of the `aria-controls` attribute on the
// Gameplay section accordion toggle. SettingsPage.tsx wires the
// `settings-section-toggle-gameplay` button to its body via
// aria-controls="settings-gameplay-body" so screen readers can jump
// from the toggle to the disclosed panel. The Data (W1365), Appearance
// (W1682), and Audio (W1693) siblings have their own pinned tests; this
// mirrors them for the Gameplay section so a rename or drop of the body
// id can't sneak past the suite.
describe("SettingsPage Gameplay section toggle aria-controls (W1703)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wires the Gameplay accordion toggle to its body via aria-controls", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const toggle = screen.getByTestId("settings-section-toggle-gameplay");
    expect(toggle).toHaveAttribute("aria-controls", "settings-gameplay-body");
  });
});
