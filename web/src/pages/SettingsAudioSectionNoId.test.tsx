import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2045 — focused coverage that the Audio <section> intentionally does NOT
// render a top-level `id` attribute. Sibling settings cards (Appearance,
// Gameplay, Data, Audio) pass accessible-name plumbing through
// `aria-labelledby` pointing at their inner heading id, and the section's
// expandable body uses its own dedicated id ("settings-audio-body"). The
// outer <section> itself does not need an id, and adding one risks colliding
// with the heading/body ids or anchoring stylesheet/JS selectors at the wrong
// element. Existing W18xx/W909 tests pin class, aria-labelledby, the data
// section-open flag, and accessible name — but none assert the absence of
// `id` on the section element. This test pins that negative shape so a
// regression that introduces `id="settings-audio"` (or similar) on the
// outer section trips immediately.
describe("SettingsPage audio section no id attribute (W2045)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Audio <section> without an `id` attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const audioSection = screen.getByTestId("settings-section-audio");
    expect(audioSection.tagName).toBe("SECTION");
    expect(audioSection.hasAttribute("id")).toBe(false);
  });
});
