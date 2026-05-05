import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2224 — focused coverage of the SettingsPage page-title <h1> NOT having
// a `role` attribute at all. SettingsPage.tsx renders
// `<h1>{t("settings.title")}</h1>` with no `role` prop, so React never
// emits a `role` attribute on the rendered element. Adding an explicit
// `role="heading"` would be redundant (the implicit role of <h1> is
// already "heading") and adding any other role would override it and
// silently break a11y tooling that walks the heading tree. Pin
// `h1.hasAttribute("role") === false` so any drive-by edit that introduces
// a role prop — even one that "matches" the implicit role — is caught
// loudly, and so the rendered markup remains free of an unnecessary
// `role` token on the page heading.
describe("SettingsPage h1 has no role attribute (W2224)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the page-level <h1> without a role attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.hasAttribute("role")).toBe(false);
  });
});
