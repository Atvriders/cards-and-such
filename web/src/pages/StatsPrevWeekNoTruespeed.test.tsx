import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3051: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `truespeed` attribute is a
 * legacy boolean attribute that only ever had meaning on the IE-only <marquee>
 * element, where it controlled whether scrollAmount values under 60ms were
 * honored verbatim. On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be serialized into the DOM and could confuse
 * assistive technology, crawlers, or future refactors that try to interpret it
 * as a meaningful flag. Sibling tests pin the absence of many other stray
 * attributes on this <ul>; pinning `truespeed` here ensures any future change
 * that accidentally attaches it to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — truespeed attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3051: stats-prev-week ul has no truespeed attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("truespeed")).toBe(false);
    expect(ul.getAttribute("truespeed")).toBeNull();
  });
});
