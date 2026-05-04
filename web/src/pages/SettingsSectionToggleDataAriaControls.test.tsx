import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1365 — focused coverage of the `aria-controls` attribute on the Data
// section accordion toggle. SettingsPage.tsx wires the
// `settings-section-toggle-data` button to its body via
// aria-controls="settings-data-body" so screen readers can jump from the
// toggle to the disclosed panel. Sibling tests exercise the toggle's
// click behavior (open/close persistence) and the testid plumbing, but
// nothing pins the literal aria-controls relationship. A regression that
// dropped or renamed the body id would otherwise sneak past the suite.
describe("SettingsPage Data section toggle aria-controls (W1365)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wires the Data accordion toggle to its body via aria-controls", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const toggle = screen.getByTestId("settings-section-toggle-data");
    expect(toggle).toHaveAttribute("aria-controls", "settings-data-body");
  });
});
