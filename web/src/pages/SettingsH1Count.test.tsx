import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2012 — focused coverage of the SettingsPage <h1> heading count. The
// page renders exactly one page-level <h1> inside the .settings-header
// (`<h1>{t("settings.title")}</h1>`) and every section card below uses
// <h2> for its sub-headings so the document outline stays single-rooted.
// Existing tests pin the h1's tagName (W1912), its lack of an id (W2005),
// and its empty className (W2008) — but every one of those uses
// `document.querySelector("h1")` (singular) which would happily survive
// a regression that promoted a section <h2> to a second <h1>, fracturing
// the outline and confusing screen-reader landmark navigation. Pinning
// `document.querySelectorAll("h1").length === 1` is the load-bearing
// structural invariant nothing else asserts.
describe("SettingsPage h1 heading count (W2012)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly one <h1> element", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(document.querySelectorAll("h1").length === 1).toBe(true);
  });
});
