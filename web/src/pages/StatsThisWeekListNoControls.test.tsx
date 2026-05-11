import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3087: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `controls`
 * attribute is only meaningful on media elements like <audio> and <video>, where
 * it instructs the user agent to expose built-in playback controls. On a <ul>
 * the attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret this presentational
 * summary list as a media region with playback affordances. Many other attribute
 * absences are already pinned on this ul (id, role, style, tabindex, cite, loop,
 * ARIA, etc.), but no test pins `controls` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `controls` attribute to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3087: stats-this-week-list ul has no controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("controls")).toBe(false);
    expect(ul.getAttribute("controls")).toBeNull();
  });
});
