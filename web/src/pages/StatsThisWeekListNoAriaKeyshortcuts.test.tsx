import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2806: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a static, read-only summary
 * <ul> containing the three "this week" stats rows (plays / wins /
 * average time). It is not a focusable widget, has no associated
 * keyboard shortcut, and there are no window-level hotkeys that target
 * this list. Sibling pins already cover the absence of `id`, `role`,
 * `style`, `tabindex`, `dir`, `hidden`, `spellcheck`, `aria-busy`,
 * `aria-checked`, `aria-controls`, `aria-current`, `aria-describedby`,
 * `aria-expanded`, `aria-haspopup`, `aria-hidden`, `aria-label`,
 * `aria-labelledby`, `aria-modal`, `aria-pressed`, `aria-readonly`,
 * `aria-roledescription`, and `aria-selected` on this same <ul>, but
 * no existing test pins the absence of an `aria-keyshortcuts`
 * attribute. Adding `aria-keyshortcuts` to this passive list would
 * misleadingly advertise to assistive technology that pressing some
 * key combination interacts with the list, when in fact there is no
 * such binding. Pinning the absence of `aria-keyshortcuts` ensures
 * any future refactor that copy-pastes a hotkey advertisement onto
 * this static summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-keyshortcuts attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2806: stats-this-week-list ul has no aria-keyshortcuts attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-keyshortcuts")).toBe(false);
    expect(ul.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});
