import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2437 — focused coverage of the Gameplay section heading element's raw
// `tagName`. SettingsPage.tsx renders
// `<h2 id="settings-gameplay-heading">Gameplay</h2>` inside the Gameplay
// card's section toggle. W893 pins the heading by role/level/name
// (`getByRole("heading", { level: 2, name: "Gameplay" })`) and W1830 pins
// the parent <section>'s aria-labelledby wiring + heading-id presence — but
// nothing asserts the heading element's literal `tagName` via its id. A
// regression that swapped the <h2> for a `<div role="heading"
// aria-level="2">` (or a <p> styled as a heading) would still satisfy the
// role/level/name lookup and the aria-labelledby wiring, while silently
// breaking the document outline. Mirror of W1844 (Appearance) for the
// Gameplay heading. Pin the tagName directly off the id selector to lock
// the production element type.
describe("SettingsPage Gameplay heading tagName (W2437)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the #settings-gameplay-heading element as an <h2>", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-gameplay-heading");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
  });
});
