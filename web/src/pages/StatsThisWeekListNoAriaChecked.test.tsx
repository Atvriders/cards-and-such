import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2786: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). It is a static summary list — not a checkbox, radio,
 * menuitemcheckbox, menuitemradio, option, switch, or treeitem widget
 * that supports a checked state. Sibling pins already cover the absence
 * of `aria-selected`, `aria-pressed`, `aria-current`, `aria-modal`,
 * `aria-haspopup`, `aria-expanded`, and many other state attributes on
 * this same <ul>, but no existing test pins the absence of an
 * `aria-checked` attribute. `aria-checked` is only meaningful on widgets
 * with a tri-state or two-state checked semantic; placing it on a plain
 * summary <ul> is a misuse that confuses assistive technology by
 * implying the list itself is checkable. Pinning the absence ensures a
 * future refactor that attempts to bolt on `aria-checked` to this
 * static list is caught in review.
 */
describe("StatsPage stats-this-week-list ul — aria-checked attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2786: stats-this-week-list ul has no aria-checked attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-checked")).toBe(false);
    expect(ul.getAttribute("aria-checked")).toBeNull();
  });
});
