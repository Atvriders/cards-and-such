import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1912 — focused coverage of the SettingsPage page-title element's raw
// `tagName`. SettingsPage.tsx renders `<h1>{t("settings.title")}</h1>`
// inside `<header className="settings-header">` as the document's primary
// heading. Existing tests reach the title through `getByRole("heading", ...)`
// which would happily survive a regression that swapped the <h1> for a
// `<div role="heading" aria-level="1">` or a styled <p> — both of those
// would silently break the document outline (and screen-reader rotor) while
// keeping every role/level/name lookup green. Pin the tagName directly via
// `document.querySelector("h1").tagName === "H1"` so a tag-swap is caught
// loudly rather than slipping past the role-based assertions.
describe("SettingsPage h1 tagName (W1912)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the page title as a literal <h1> element", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName === "H1").toBe(true);
  });
});
