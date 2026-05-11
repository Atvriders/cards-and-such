import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3084: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `loop`
 * attribute is only meaningful on media elements like <audio> and <video>, where
 * it instructs the user agent to seek back to the start once playback ends. On
 * a <ul> the attribute carries no defined semantics, but leaving it present
 * would still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, or future refactors that try to interpret this
 * presentational summary list as a looping media region. Many other attribute
 * absences are already pinned on this ul (id, role, style, tabindex, cite,
 * ARIA, etc.), but no test pins `loop` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `loop` attribute to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — loop attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3084: stats-this-week-list ul has no loop attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("loop")).toBe(false);
    expect(ul.getAttribute("loop")).toBeNull();
  });
});
