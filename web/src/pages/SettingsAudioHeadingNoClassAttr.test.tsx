import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2436 — focused coverage of the Audio section heading <h2> NOT having
// a `class` attribute at all. SettingsPage.tsx renders
// `<h2 id="settings-audio-heading">Audio</h2>` with no className prop,
// so React never emits a `class` attribute on the rendered element.
// W2428 pins the heading's tagName ("H2"), W885 pins role/level/name,
// and W1820/W909 pin the parent <section>'s aria-labelledby wiring and
// resolved region name — but nothing pins the heading element's freedom
// from styling hooks. The DOM distinguishes between "no class attribute"
// and `class=""`: `hasAttribute("class")` returns `false` only when no
// class attribute was emitted at all. Pinning
// `h2.hasAttribute("class") === false` catches any drive-by edit that
// adds a `className` prop — even an empty or templated one that resolves
// to "" — and keeps the rendered markup free of noisy `class=""` tokens
// on this aria-labelledby target. Mirror of W2424 (Appearance heading).
describe("SettingsPage Audio heading has no class attribute (W2436)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Audio #settings-audio-heading <h2> without a class attribute", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-audio-heading");
    expect(heading).not.toBeNull();
    expect(heading!.hasAttribute("class")).toBe(false);
  });
});
