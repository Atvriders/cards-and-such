import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2108: The <ul> rendered inside the "Personal records by category"
 * stats card carries the `stats-pr-list stats-pr-list--by-cat` class
 * pair (pinned by W1333) but does NOT carry an `id` attribute. The
 * sibling card-level id-absence is pinned (W2029) and the list's
 * class pair is pinned (W1333), but no test pins the absence of an
 * `id` on the list element itself. If a refactor were to attach
 * `id="stats-pr-list-by-cat"` (or any other id) for fragment
 * anchoring, scrollIntoView, aria-controls wiring, or label-for
 * targeting, it would silently add a stable DOM selector hook with
 * implications for CSS `#id` rules, `document.getElementById`
 * consumers, and URL hash navigation while every existing
 * assertion continues to pass. Pin the absence of an `id` attribute
 * on the list so the contract is enforced.
 */
describe("StatsPage — personal records by category list has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2108: stats-personal-records-by-category list has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    const list = within(card).getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("id")).toBe(false);
  });
});
