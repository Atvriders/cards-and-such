import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2774: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising three read-only "this week" stats rows (plays / wins /
 * average time). It is purely informational — it is not part of any
 * navigation, pagination, stepper, tablist, or other widget where one
 * item among siblings represents the "current" location/page/step.
 * Sibling pins already cover the absence of `id`, `role`, `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, `aria-busy`, `aria-haspopup`,
 * `aria-pressed`, `aria-selected`, and `aria-role-description` on this
 * same <ul>, but no existing test pins the absence of an `aria-current`
 * attribute. Adding `aria-current` (with any value: "page", "step",
 * "true", etc.) would misleadingly signal to assistive technology that
 * this static summary list represents a positional or navigational
 * "current" element, causing screen readers to announce a misleading
 * "current page/step/location" cue. Pinning the absence of
 * `aria-current` ensures any future refactor that attempts to mark this
 * static summary list with a current-state indicator is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-current attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2774: stats-this-week-list ul has no aria-current attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-current")).toBe(false);
    expect(ul.getAttribute("aria-current")).toBeNull();
  });
});
