import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2099 — focused coverage of the SettingsPage page-title <h1> NOT having
// a `class` attribute at all. SettingsPage.tsx renders
// `<h1>{t("settings.title")}</h1>` with no className prop, so React never
// emits a `class` attribute on the rendered element. The sibling W2008
// test pins `h1.className === ""` (the IDL property), but the empty-string
// invariant also matches a hypothetical refactor that does
// `<h1 className="">` — both produce `className === ""`. The DOM
// distinguishes between the two: `hasAttribute("class")` returns `false`
// only when no class attribute was emitted, and `true` (with an empty
// string value) when one was passed but empty. Pin
// `h1.hasAttribute("class") === false` so any drive-by edit that adds a
// `className` prop — even an empty one or a templated one that resolves
// to "" — is caught loudly, and so the rendered markup remains free of
// the noisy `class=""` token.
describe("SettingsPage h1 has no class attribute (W2099)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the page-level <h1> without a class attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.hasAttribute("class")).toBe(false);
  });
});
