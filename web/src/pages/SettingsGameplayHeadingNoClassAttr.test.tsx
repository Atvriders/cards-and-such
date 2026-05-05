import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2446 — focused coverage of the Gameplay section heading <h2> NOT
// having a `class` attribute at all. SettingsPage.tsx renders
// `<h2 id="settings-gameplay-heading">Gameplay</h2>` with no className
// prop, so React never emits a `class` attribute on the rendered element.
// W2437 pins the heading's tagName ("H2"), W893 pins role/level/name, and
// W1830 pins the parent <section>'s aria-labelledby wiring — but nothing
// pins the heading element's freedom from styling hooks. The DOM
// distinguishes between "no class attribute" and `class=""`:
// `hasAttribute("class")` returns `false` only when no class attribute was
// emitted at all. Pinning `h2.hasAttribute("class") === false` catches any
// drive-by edit that adds a `className` prop — even an empty or templated
// one that resolves to "" — and keeps the rendered markup free of noisy
// `class=""` tokens on this aria-labelledby target. Mirror of W2424
// (Appearance) for the Gameplay heading.
describe("SettingsPage Gameplay heading has no class attribute (W2446)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Gameplay #settings-gameplay-heading <h2> without a class attribute", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-gameplay-heading");
    expect(heading).not.toBeNull();
    expect(heading!.hasAttribute("class")).toBe(false);
  });
});
