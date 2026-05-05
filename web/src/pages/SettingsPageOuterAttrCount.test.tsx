import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1671 — focused coverage of the SettingsPage outer wrapper's exact
// attribute set. SettingsPage.tsx renders `<div className="settings-
// page" data-testid="settings-page">` as its outermost element. Existing
// tests pin the className value + tagName (W1655), the classList length
// (W1663), the header className+tagName (W1634), the subtitle (W1575/
// W1586), the back-to-lobby link (W1595), the search wrapper class
// (W1644), and the search input attrs (W1247/W1607/W1615/W1625) — but
// nothing pins the *exact attribute count* on the outer <div>. A
// regression that silently appended an extra attribute (e.g. an inline
// `style` for debugging, a stray `role`, an `id`, or a `hidden` flag)
// would slip past every existing assertion. Lock the count to 2 — the
// only attributes the production code sets are `class` and
// `data-testid` — and verify there's no inline `style` attribute.
describe("SettingsPage outer wrapper attribute count (W1671)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the outer wrapper with exactly two attributes (class + data-testid) and no inline style", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const outer = screen.getByTestId("settings-page");
    // Exactly the two attributes the JSX sets — `class` + `data-testid`.
    expect(outer.attributes.length).toBe(2);
    // No inline style attribute should leak from the JSX.
    expect(outer.hasAttribute("style")).toBe(false);
    // No stray role/id/hidden — would bump the attribute count if added.
    expect(outer.hasAttribute("role")).toBe(false);
    expect(outer.hasAttribute("id")).toBe(false);
    expect(outer.hasAttribute("hidden")).toBe(false);
  });
});
