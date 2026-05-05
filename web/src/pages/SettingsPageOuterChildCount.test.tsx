import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1698 — focused coverage of the SettingsPage outer wrapper's
// childElementCount. SettingsPage.tsx renders `<div className=
// "settings-page" data-testid="settings-page">` whose element
// children are the `<header className="settings-header">` plus the
// four section cards (appearance, audio, gameplay, data) — five in
// total. The `{confirmDialog}` slot is React's null when the dialog
// is closed, so it contributes no element child. Existing tests pin
// the outer className+tagName (W1655), the classList length (W1663),
// the attribute count (W1671), the firstElementChild (W1675 = header)
// and the lastElementChild (W1689 = settings-section-data) — but
// nothing pins the *count* of element children. A regression that
// dropped a section card or appended an extra sibling would silently
// keep the first/last assertions green without tripping any existing
// assertion. Mirrors W1675/W1689.
describe("SettingsPage outer wrapper childElementCount (W1698)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly five element children on the outer wrapper", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const outer = screen.getByTestId("settings-page");
    expect(outer.childElementCount).toBe(5);
  });
});
