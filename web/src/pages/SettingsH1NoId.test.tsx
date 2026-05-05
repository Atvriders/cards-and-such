import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2005 — focused coverage of the SettingsPage page-title <h1> NOT having
// an `id` attribute. The four section cards each pair an `<h2 id="...">`
// with `<section aria-labelledby="...">` so screen readers announce a
// stable accessible name per section. The page-level <h1> intentionally
// has *no* id — it isn't referenced by any aria-labelledby and adding one
// would (a) make the SettingsPage title a fragment-link target by accident
// and (b) collide with section headings in deep-linking tooling that walks
// every id-bearing heading. Existing tests pin the tag (W1912) and
// role/level/name (W880) but none guard the absence of `id`. Without this
// pin a refactor could silently introduce `<h1 id="settings-title">` and
// every existing assertion would still pass. Pin
// `h1.hasAttribute("id") === false` directly so the regression is loud.
describe("SettingsPage h1 has no id attribute (W2005)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the page-level <h1> without an id attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.hasAttribute("id")).toBe(false);
  });
});
