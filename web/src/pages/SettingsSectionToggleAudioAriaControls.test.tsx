import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1693 — focused coverage of the `aria-controls` attribute on the
// Audio section accordion toggle. SettingsPage.tsx wires the
// `settings-section-toggle-audio` button to its body via
// aria-controls="settings-audio-body" so screen readers can jump
// from the toggle to the disclosed panel. The Appearance (W1682) and
// Data (W1365) siblings have their own pinned tests; this mirrors them
// for the Audio section so a rename or drop of the body id can't sneak
// past the suite.
describe("SettingsPage Audio section toggle aria-controls (W1693)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wires the Audio accordion toggle to its body via aria-controls", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const toggle = screen.getByTestId("settings-section-toggle-audio");
    expect(toggle).toHaveAttribute("aria-controls", "settings-audio-body");
  });
});
