import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3100: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `controlslist` attribute is
 * only meaningful on media elements (<audio>, <video>) where it customizes the
 * set of controls the user agent exposes (e.g. nodownload, nofullscreen,
 * noremoteplayback). On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as a media-controls hint. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `controlslist`. Pinning it here ensures any future change that accidentally
 * attaches a `controlslist` value to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — controlslist attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3100: stats-prev-week ul has no controlslist attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("controlslist")).toBe(false);
    expect(ul.getAttribute("controlslist")).toBeNull();
  });
});
