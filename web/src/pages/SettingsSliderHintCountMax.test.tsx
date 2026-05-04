import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1274 — the "Hints per game" slider in the Gameplay section is bounded
// at the top by max=10. This is the contract the hint-replenishment logic
// relies on (Klondike + friends cap their per-game hint budget here), so a
// silent regression that lifts the cap or removes the attribute would let
// users dial in arbitrary hint counts that overflow the persisted integer
// range. W1218 already covered the volume slider's aria-valuetext; this
// test pins down a separate, structurally distinct attribute on a
// different slider so the suite catches drift on either control.
describe("SettingsPage hint-count slider max attribute (W1274)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders max=10 on the hints-per-game range input", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-hint-count");
    // Use the DOM attribute (not the property) so we assert the rendered
    // markup verbatim — properties can mask omitted attributes by falling
    // back to the HTML range default of 100.
    expect(slider.getAttribute("max")).toBe("10");
  });
});
