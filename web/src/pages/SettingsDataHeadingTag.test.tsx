import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2438 — focused coverage of the Data section heading element's raw
// `tagName`. SettingsPage.tsx renders
// `<h2 id="settings-data-heading">Your data</h2>` inside the Data card's
// section toggle. W894 pins the heading by role/level/name
// (`getByRole("heading", { level: 2, name: "Your data" })`) and W1831 pins
// the parent <section>'s aria-labelledby wiring + asserts the referenced
// element exists by id — but nothing asserts the heading element's literal
// `tagName` via its id. A regression that swapped the <h2> for a
// `<div role="heading" aria-level="2">` (or a <p> styled as a heading)
// would still satisfy the role/level/name lookup and the aria-labelledby
// wiring, while silently breaking the document outline. Mirror of W1844
// (Appearance heading tagName). Pin the tagName directly off the id
// selector to lock the production element type.
describe("SettingsPage Data heading tagName (W2438)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the #settings-data-heading element as an <h2>", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-data-heading");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
  });
});
