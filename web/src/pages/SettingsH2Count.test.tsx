import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1971 — focused coverage of the SettingsPage <h2> heading count. The
// page renders exactly four section cards (Appearance, Audio, Gameplay,
// Your data) and each card uses a single <h2> tucked inside its toggle
// header that doubles as the aria-labelledby target for the surrounding
// <section>. Existing tests pin each h2's text and tag individually
// (W885/W891/W893/W894 + SettingsAppearanceHeadingTag) and W1762 pins
// the <section> count, but nothing asserts the total <h2> count on the
// rendered page. A regression that demoted one heading to a <div>, or
// added a stray <h2> in a sub-panel, would silently slip past today's
// suite while breaking the document outline + screen-reader landmark
// navigation. Pinning the count to 4 is the load-bearing structural
// invariant of the heading hierarchy.
describe("SettingsPage h2 heading count (W1971)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly four <h2> elements", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const headings = container.querySelectorAll("h2");
    expect(headings).toHaveLength(4);
  });
});
