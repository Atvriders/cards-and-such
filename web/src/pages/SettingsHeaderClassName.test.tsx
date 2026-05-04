import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1634 — focused coverage of the SettingsPage <header> element's className.
// SettingsPage.tsx wraps the H1, subtitle paragraph, and search input inside
// a `<header className="settings-header">` block. Existing tests pin the
// subtitle paragraph (W1575/W1586), the back-to-lobby link (W1595), and the
// search input attributes (W1607/W1615/W1625/W1247) — but nothing pins the
// className on the wrapping <header> element itself. A regression that
// dropped or renamed `settings-header` would silently break the header
// layout / spacing wired up in SettingsPage.css. Pin the class explicitly.
describe("SettingsPage header element className (W1634)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the heading + subtitle + search in a <header> with the settings-header class", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    // Anchor on the H1 — its closest <header> ancestor is the wrapper we
    // care about. Avoids relying on a test id, since the production code
    // doesn't put one on the <header> itself.
    const h1 = screen.getByRole("heading", { level: 1 });
    const headerEl = h1.closest("header");
    expect(headerEl).not.toBeNull();
    expect(headerEl).toHaveClass("settings-header");
    expect(headerEl?.tagName).toBe("HEADER");
  });
});
