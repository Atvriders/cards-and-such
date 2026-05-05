import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1818 — focused coverage of the `className="settings-range"` on the
// SettingsPage Audio → Volume range input. SettingsPage.tsx renders the
// slider with `className="settings-range"` so the SettingsPage.css
// `.settings-range` rules (track height, thumb fill, focus ring) apply.
// Existing tests pin the label htmlFor (W1807), aria-valuetext (W1218),
// and min/max/step (W1234), but nothing asserts the visual styling hook.
// A regression that dropped the class (or replaced it with the generic
// browser default) would silently change the slider's appearance to the
// platform default while keeping every behavioral assertion green —
// users would see an inconsistent, browser-styled control. Pinning the
// className keeps the visual contract explicit.
describe("SettingsPage volume input range class (W1818)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the volume range input with the settings-range class", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider).toHaveClass("settings-range");
  });
});
