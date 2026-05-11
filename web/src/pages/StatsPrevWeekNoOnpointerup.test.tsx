import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3211: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointerup` attribute is a
 * pointer-event handler that fires when a pointing device button is released
 * over the element. Attaching such a handler inline to this presentational
 * summary list would silently wire up interactive behavior on what is
 * semantically a static list, risking accidental tap/click side effects on
 * touch devices and confusing assistive technology that does not expect
 * pointer interactivity on a <ul>. Sibling tests already pin the absence of
 * `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA
 * / global / event-handler attributes on this <ul>, but none pin the absence
 * of `onpointerup`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onpointerup` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3211: stats-prev-week ul has no onpointerup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerup")).toBe(false);
    expect(ul.getAttribute("onpointerup")).toBeNull();
  });
});
