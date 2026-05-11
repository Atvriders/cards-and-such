import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onseeking` attribute is a media-element event handler that fires while a
 * <video> or <audio> element is seeking. It carries no defined semantics on a
 * <ul>, but if it were present it would still be parsed by the browser as an
 * inline event handler, creating a potential XSS sink and a misleading signal
 * to anything inspecting the DOM. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, cite, ARIA,
 * etc.), but no test pins `onseeking` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onseeking` handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onseeking attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onseeking attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onseeking")).toBe(false);
    expect(ul.getAttribute("onseeking")).toBeNull();
  });
});
