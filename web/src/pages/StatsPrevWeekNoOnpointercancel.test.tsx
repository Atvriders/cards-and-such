import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3217: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointercancel` content
 * attribute is an inline event-handler attribute used to register a pointer
 * cancellation listener directly in markup. On this presentational summary
 * <ul> there is no pointer interaction model, so any such handler would be
 * either dead code or — worse — a vector for inline-script execution if a
 * future refactor accidentally interpolated user content into it. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global / event-handler attributes on
 * this <ul>, but none pin the absence of `onpointercancel`. Pinning it here
 * ensures any future change that accidentally attaches an `onpointercancel`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointercancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3217: stats-prev-week ul has no onpointercancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointercancel")).toBe(false);
    expect(ul.getAttribute("onpointercancel")).toBeNull();
  });
});
