import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3199: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ondragover` attribute is a
 * global event-handler content attribute that, when present, would register a
 * drag-and-drop hover handler on the element. This presentational summary list
 * is not a drop target and has no drag-and-drop affordance; attaching an
 * `ondragover` handler would silently introduce drag interaction surface area,
 * potentially preventing default browser behavior, breaking pointer
 * accessibility, or enabling unintended drop semantics. Sibling tests already
 * pin the absence of many global, ARIA, and event-handler attributes on this
 * <ul>, but none pin the absence of `ondragover`. Pinning it here ensures any
 * future change that accidentally attaches an `ondragover` handler to this
 * static list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondragover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3199: stats-prev-week ul has no ondragover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragover")).toBe(false);
    expect(ul.getAttribute("ondragover")).toBeNull();
  });
});
