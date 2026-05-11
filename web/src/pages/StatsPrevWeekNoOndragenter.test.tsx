import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3193: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondragenter` attribute is an
 * inline event handler that fires when a dragged item enters the element's
 * drop target zone. This presentational summary list is not a drop target —
 * it merely displays the previous week's per-deck stats — so attaching an
 * `ondragenter` handler would either be dead code or, worse, inject
 * executable script content through HTML attribute serialization. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / drag-and-drop / global attributes on
 * this <ul>, but none pin the absence of `ondragenter`. Pinning it here
 * ensures any future change that accidentally attaches an `ondragenter`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondragenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3193: stats-prev-week ul has no ondragenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragenter")).toBe(false);
    expect(ul.getAttribute("ondragenter")).toBeNull();
  });
});
