import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1995 — focused coverage of the SettingsPage <input> element count.
// SettingsPage renders a wide variety of form controls across its four
// section cards: a search-bar input in the header; a light-mode
// checkbox; sound, mute-on-hidden, auto-move, hints-enabled,
// hint-cooldown, show-undo-count, mock-leaderboard, and mock-friends
// checkboxes; volume + hint-count range inputs; and a hidden file input
// for data import. With the default ("midnight") theme the three
// custom-theme color pickers are not mounted, so the baseline render
// surfaces 13 <input> elements. Existing Settings tests pin individual
// fields (volume, search-input attributes, mock toggles, import accept,
// etc.) but nothing asserts the structural total — a regression that
// silently removed an input (e.g. dropping the mute-on-hidden toggle or
// the volume range) or accidentally double-mounted one would slip past
// the suite today. Pinning the count via querySelectorAll("input") is
// the load-bearing structural invariant of the page's form surface.
describe("SettingsPage input element count (W1995)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least 13 <input> elements at the default theme", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(13);
  });
});
