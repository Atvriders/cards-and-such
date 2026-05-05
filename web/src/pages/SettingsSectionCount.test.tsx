import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1762 — focused coverage of the SettingsPage section card count. The
// page is composed of exactly four top-level <section> cards: Appearance,
// Audio, Gameplay, and Your data. The mobile-accordion CSS, the
// per-section reset wiring, and the data-section-open attribute (W1721 /
// W1733 / W1743 / W1753) all assume that exact count — adding a fifth
// section without wiring the accordion key, or accidentally dropping one
// during a refactor, would silently break the layout without tripping any
// existing assertion. Existing tests pin each section by testid and class
// individually, but nothing asserts that the total count is 4. A query for
// every <section> element directly under the .settings-page wrapper is
// the load-bearing structural invariant.
describe("SettingsPage section card count (W1762)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly four top-level <section> cards", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const sections = container.querySelectorAll(
      ".settings-page > section.settings-card",
    );
    expect(sections).toHaveLength(4);
  });
});
