import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1595 — focused coverage of the className on the SettingsPage header
// "Back to lobby" link. SettingsPage.tsx renders the inline anchor as
// `<Link to="/" className="settings-link">Back to lobby</Link>` inside the
// header subtitle. W1204 (SettingsPageBackToLobbyLink) pins the link's role,
// accessible name, and href, and W1575 / W1586 pin the surrounding subtitle
// paragraph's className and copy, but nothing asserts the className that
// wires up the link's text-link styling in SettingsPage.css. A regression
// that dropped or renamed the class (e.g. while refactoring inline links to
// a new design-system token) would silently lose the header link's styling
// without breaking the visible href / accessible name. Pinning the className
// keeps the visual contract explicit.
describe("SettingsPage header Back to lobby link className (W1595)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Back to lobby link with the settings-link class", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Back to lobby" });
    expect(link).toHaveClass("settings-link");
  });
});
