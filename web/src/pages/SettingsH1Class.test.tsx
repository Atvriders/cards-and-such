import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2008 — focused coverage of the SettingsPage page-title <h1>'s exact
// `className`. SettingsPage.tsx renders `<h1>{t("settings.title")}</h1>`
// with no className prop, so the rendered DOM element has an empty
// `className` string. Sibling tests pin the tagName (W1912), the absence
// of an id (W2005), the wrapping <header>'s class (W1634), the subtitle
// paragraph class (W1575), and the back-to-lobby link class (W1595) — but
// nothing guards the page-title <h1>'s own className. A drive-by refactor
// that introduced `<h1 className="settings-title">` would shift CSS
// specificity (and could collide with section heading rules) without
// breaking any existing assertion. Pin `h1.className === ""` exactly so
// any class-name addition is caught loudly.
describe("SettingsPage h1 className equality (W2008)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the page-title <h1> with an empty className string", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.className === "").toBe(true);
  });
});
