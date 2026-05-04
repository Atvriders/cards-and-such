import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1586 — focused coverage of the SettingsPage header subtitle's leading
// copy. SettingsPage.tsx renders a `<p className="settings-subtitle">` whose
// first text node — "Tune the look, sound, and feel — changes save
// automatically." — sets user expectations for the page (everything saves
// without an explicit submit). W1575 pins the className+tagName of that
// paragraph, and W1199 pins the inline Back-to-lobby link, but nothing
// asserts the descriptive sentence itself. A regression that swapped or
// dropped the copy (e.g. while refactoring i18n strings) would change the
// page's voice without breaking any other test. Pinning the leading text
// keeps the contract explicit.
describe("SettingsPage header subtitle leading text (W1586)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the descriptive leading copy in the settings-subtitle paragraph", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Back to lobby" });
    const subtitle = link.closest("p");
    expect(subtitle).not.toBeNull();
    // The leading text is a static string before the inline Back-to-lobby
    // link. Use textContent and a substring check so the assertion stays
    // resilient to incidental whitespace from JSX line breaks.
    expect(subtitle?.textContent).toContain(
      "Tune the look, sound, and feel — changes save automatically.",
    );
  });
});
