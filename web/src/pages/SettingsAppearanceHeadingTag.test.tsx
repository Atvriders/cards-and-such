import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1844 — focused coverage of the Appearance section heading element's
// raw `tagName`. SettingsPage.tsx renders
// `<h2 id="settings-appearance-heading">Appearance</h2>` inside the
// Appearance card's section toggle. W891 pins the heading by role/level/name
// (`getByRole("heading", { level: 2, name: "Appearance" })`) and W1810 pins
// the parent <section>'s tagName + aria-labelledby wiring — but nothing
// asserts the heading element's literal `tagName` via its id. A regression
// that swapped the <h2> for a `<div role="heading" aria-level="2">` (or a
// <p> styled as a heading) would still satisfy the role/level/name lookup
// and the aria-labelledby wiring, while silently breaking the document
// outline. Pin the tagName directly off the id selector to lock the
// production element type.
describe("SettingsPage Appearance heading tagName (W1844)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the #settings-appearance-heading element as an <h2>", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-appearance-heading");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
  });
});
