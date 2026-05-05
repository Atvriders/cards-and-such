import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1807 — focused coverage of the `htmlFor` attribute on the SettingsPage
// Audio → Volume slider's <label>. SettingsPage.tsx renders the label as
// `<label className="settings-field-label" htmlFor="settings-volume">` so
// clicking the "Volume" copy focuses the range input (id="settings-volume").
// Existing tests pin the slider's testid, value, persistence, and aria
// attributes (W679 et al.), but nothing asserts the label↔input wiring via
// `for`. A regression that renamed the slider id or dropped the htmlFor
// would silently break click-to-focus and assistive-tech grouping without
// changing the visible label or slider behavior. Pinning the for/id pair
// keeps the accessibility contract explicit.
describe("SettingsPage volume label htmlFor (W1807)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wires the Volume label to the range input via htmlFor", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider).toHaveAttribute("id", "settings-volume");
    const label = slider.closest(".settings-field")?.querySelector("label");
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("for", "settings-volume");
  });
});
