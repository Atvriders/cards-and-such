import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3086: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `controls` attribute is a
 * boolean attribute defined only on media elements (<audio> and <video>),
 * where it instructs the user agent to expose playback controls. On a <ul>
 * the attribute carries no defined semantics, but leaving it present would
 * still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, or future refactors that try to interpret it as a
 * media-controls hint. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `controls`. Pinning it
 * here ensures any future change that accidentally attaches a `controls`
 * attribute to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3086: stats-prev-week ul has no controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("controls")).toBe(false);
    expect(ul.getAttribute("controls")).toBeNull();
  });
});
