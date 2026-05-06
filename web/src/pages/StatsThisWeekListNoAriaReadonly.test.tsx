import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2798: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, presentational <ul>
 * summarising the three "this week" stat rows (plays / wins / average
 * time). The list itself is not an interactive widget — it is neither a
 * form control nor an editable region — so authoring an `aria-readonly`
 * attribute on it would be both semantically incorrect and potentially
 * confusing to assistive technology, which would interpret it as a
 * promise that the element is normally editable but currently locked.
 *
 * Sibling pins already lock the absence of `id`, `role`, `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, `aria-busy`, `aria-checked`,
 * `aria-current`, `aria-expanded`, `aria-haspopup`, `aria-modal`,
 * `aria-pressed`, `aria-roledescription`, and `aria-selected` on this
 * same <ul>, but no existing test pins the absence of `aria-readonly`.
 * Adding `aria-readonly` would misleadingly imply this static summary
 * list is a writable widget temporarily in a read-only state. Pinning
 * its absence ensures any future refactor that attaches the attribute
 * is caught and reviewed rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-readonly attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2798: stats-this-week-list ul has no aria-readonly attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-readonly")).toBe(false);
    expect(ul.getAttribute("aria-readonly")).toBeNull();
  });
});
