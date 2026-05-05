import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1663 — focused coverage of the SettingsPage outer wrapper classList
// length. SettingsPage.tsx renders `<div className="settings-page"
// data-testid="settings-page">` as its outermost element. Existing
// tests pin the className value + tagName (W1655), the header className
// +tagName (W1634), the subtitle (W1575/W1586), the back-to-lobby link
// (W1595), the search wrapper class (W1644), and the search input
// attrs (W1247/W1607/W1615/W1625). What's NOT pinned is the *exact*
// shape of the outer classList — `toHaveClass("settings-page")` only
// asserts that token is present, it doesn't catch a regression that
// silently appends an extra modifier class (e.g. "settings-page is-
// loading") that would shift CSS specificity. Lock the count to 1.
describe("SettingsPage outer wrapper classList length (W1663)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the outer wrapper with exactly one CSS class token", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const outer = screen.getByTestId("settings-page");
    expect(outer.classList.length).toBe(1);
    expect(outer.classList.contains("settings-page")).toBe(true);
  });
});
