import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3190: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondragend` content attribute is
 * a global event-handler attribute that, when present, registers an inline
 * JavaScript handler invoked at the end of a drag operation. This <ul> is a
 * purely presentational summary list with no drag-and-drop semantics; attaching
 * an inline `ondragend` handler would couple presentation to behavior, bypass
 * React's synthetic event system, and create an XSS surface if any user-derived
 * data ever flowed into the attribute. Sibling tests already pin the absence of
 * `cite`, `id`, `role`, `style`, `tabindex`, `is`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `ondragend`.
 * Pinning it here ensures any future change that accidentally attaches an
 * inline drag-end handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondragend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3190: stats-prev-week ul has no ondragend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragend")).toBe(false);
    expect(ul.getAttribute("ondragend")).toBeNull();
  });
});
