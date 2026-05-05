import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2054 — focused coverage that the Data <section> intentionally does NOT
// render a top-level `id` attribute. Sibling settings cards (Appearance,
// Gameplay, Data, Audio) pass accessible-name plumbing through
// `aria-labelledby` pointing at their inner heading id ("settings-data-heading"),
// and the section's expandable body uses its own dedicated id
// ("settings-data-body"). The outer <section> itself does not need an id,
// and adding one risks colliding with the heading/body ids or anchoring
// stylesheet/JS selectors at the wrong element. Existing tests pin the
// class, aria-labelledby, the data-section-open flag, modifier class, and
// the outer card child count — but none assert the absence of `id` on the
// section element. This test pins that negative shape so a regression that
// introduces `id="settings-data"` (or similar) on the outer section trips
// immediately. Mirrors the W2045 audio-no-id and appearance-no-id pins.
describe("SettingsPage data section no id attribute (W2054)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Data <section> without an `id` attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.hasAttribute("id")).toBe(false);
  });
});
