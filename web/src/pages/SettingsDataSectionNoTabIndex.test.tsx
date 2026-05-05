import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2405 — focused coverage that the Data <section> on SettingsPage does NOT
// render a `tabindex` attribute. The outer card is a plain semantic landmark
// (a <section> wired to an inner heading via `aria-labelledby`) and is not
// itself an interactive element — the toggle button inside the card head is
// what receives keyboard focus. Adding `tabindex="0"` (or any other value)
// to the outer section would inject a phantom tab stop into the Settings
// page's focus order, breaking the established left-to-right / top-to-bottom
// flow between the Appearance/Gameplay/Data/Audio cards' actual controls.
// Existing pins on this element cover className, aria-labelledby,
// data-section-open, modifier class, no-id, and no-style — but none assert
// the absence of `tabindex` on the section element. This test pins that
// negative shape so a regression that introduces an outer-section tabindex
// trips immediately.
describe("SettingsPage data section no tabindex attribute (W2405)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Data <section> without a `tabindex` attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.hasAttribute("tabindex")).toBe(false);
  });
});
