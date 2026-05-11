import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3295: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onrejectionhandled` attribute
 * corresponds to the global event handler for the `rejectionhandled` event,
 * which fires on Window/WorkerGlobalScope when a previously-unhandled promise
 * rejection is finally handled. It has no defined meaning as a content
 * attribute on an arbitrary <ul>, and even if the browser silently ignores it,
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as an event-handler hook. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of
 * `onrejectionhandled`. Pinning it here ensures any future change that
 * accidentally attaches an `onrejectionhandled` handler to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onrejectionhandled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3295: stats-prev-week ul has no onrejectionhandled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onrejectionhandled")).toBe(false);
    expect(ul.getAttribute("onrejectionhandled")).toBeNull();
  });
});
