import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2654: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a plain, fully-rendered <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). The data backing the list is
 * derived synchronously from localStorage during render — there is no async
 * fetch, no suspense boundary, and no loading state attached to this list.
 * Sibling pins already cover the absence of `id`, `role`, `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, and `aria-hidden`, but no existing test pins the absence
 * of an `aria-busy` attribute on this <ul>. Adding `aria-busy="true"` would
 * misleadingly signal to assistive technology that the list is still loading
 * or being updated, which would cause screen readers to announce stale or
 * incomplete content and to suppress live updates. Pinning the absence of
 * `aria-busy` ensures any future refactor that attempts to mark this static
 * summary list as busy is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-busy attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2654: stats-prev-week ul has no aria-busy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-busy")).toBe(false);
    expect(ul.getAttribute("aria-busy")).toBeNull();
  });
});
