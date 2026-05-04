import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1575 — focused coverage of the SettingsPage header subtitle's className.
// SettingsPage.tsx renders a `<p className="settings-subtitle">` inside the
// `.settings-header` block to host the "Tune the look, sound, and feel..."
// copy plus the inline "Back to lobby" link. The Back-to-lobby anchor itself
// is pinned in W1199 (SettingsPageBackToLobbyLink), and the H1 above it is
// covered by SettingsPage.test.tsx's "renders the page heading" assertion,
// but nothing pins the className that the surrounding paragraph uses to wire
// up its layout / typography styling in SettingsPage.css. A regression that
// dropped the class (or swapped it for a generic name) would silently break
// the header's visual rhythm without changing the visible text. Pinning the
// className keeps the structural contract explicit.
describe("SettingsPage header subtitle className (W1575)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the header subtitle paragraph with the settings-subtitle class", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Back to lobby" });
    const subtitle = link.closest("p");
    expect(subtitle).not.toBeNull();
    expect(subtitle).toHaveClass("settings-subtitle");
    expect(subtitle?.tagName).toBe("P");
  });
});
