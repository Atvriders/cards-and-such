import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPage from "./SettingsPage.js";

/**
 * W2333 — pin the SettingsPage's `<form>` element count at ZERO.
 *
 * SettingsPage emits a great deal of form-like UI (search input,
 * range sliders, color pickers, checkboxes, a hidden file input
 * for data-import, theme/animation radiogroups, etc.) but every
 * one of those controls lives directly inside `<section>` /
 * `<div>` / `<label>` containers — there is NO wrapping `<form>`
 * element anywhere on the page. Each control persists via
 * onChange handlers writing to localStorage; nothing is ever
 * submitted, so a `<form>` would only add an unnecessary
 * implicit-submit risk (Enter key on the search input, etc.).
 *
 * A regression that wraps any of these surfaces in a `<form>`
 * (e.g. someone refactors the data-import file input into a
 * `<form>` with an upload submit, or wraps the theme custom-
 * controls block in a form for "validation") would silently
 * change keyboard semantics. Existing per-feature tests pin
 * individual elements by data-testid, but NO existing test
 * asserts the AGGREGATE `<form>` cardinality of the page.
 *
 * The selector is tag-only — `querySelectorAll("form")` —
 * deliberately orthogonal to every existing data-testid based
 * pin. The contract under test is the literal absence of any
 * `<form>` tag emission, not any particular control's id
 * stamping.
 */
describe("SettingsPage — <form> element count is zero (W2333)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly 0 <form> elements on a fresh mount", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <SettingsPage />
      </MemoryRouter>,
    );

    const forms = document.querySelectorAll("form");
    expect(forms.length).toBe(0);
  });
});
