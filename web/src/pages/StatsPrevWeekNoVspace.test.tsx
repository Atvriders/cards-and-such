import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3076: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `vspace` attribute is a
 * deprecated presentational attribute that was historically supported on
 * <img>, <object>, <applet>, and <marquee> elements to control vertical
 * whitespace around the element. It has never been defined on <ul> and is
 * obsolete in modern HTML; layout spacing must be expressed via CSS instead.
 * Leaving `vspace` present on this <ul> would carry no semantic meaning but
 * could still surface in DOM serialization and mislead crawlers, assistive
 * technology, or future refactors that interpret it as a layout hint. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global attributes on this <ul>, but
 * none pin the absence of `vspace`. Pinning it here ensures any future change
 * that accidentally attaches a `vspace` value to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — vspace attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3076: stats-prev-week ul has no vspace attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("vspace")).toBe(false);
    expect(ul.getAttribute("vspace")).toBeNull();
  });
});
