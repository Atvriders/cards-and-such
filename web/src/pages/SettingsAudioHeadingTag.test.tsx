import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2428 — focused coverage of the Audio section heading element's raw
// `tagName`. SettingsPage.tsx renders
// `<h2 id="settings-audio-heading">Audio</h2>` inside the Audio card's
// section toggle. W885 pins the heading by role/level/name
// (`getByRole("heading", { level: 2, name: "Audio" })`), W909 pins the
// parent <section>'s resolved region name, and W1820 pins the section's
// aria-labelledby attribute + heading-id presence — but nothing asserts
// the heading element's literal `tagName` via its id. A regression that
// swapped the <h2> for a `<div role="heading" aria-level="2">` (or a
// <p> styled as a heading) would still satisfy the role/level/name lookup
// and the aria-labelledby wiring, while silently breaking the document
// outline. Pin the tagName directly off the id selector to lock the
// production element type. Mirror of W1844 (Appearance heading tagName).
describe("SettingsPage Audio heading tagName (W2428)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the #settings-audio-heading element as an <h2>", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const heading = container.querySelector("#settings-audio-heading");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
  });
});
