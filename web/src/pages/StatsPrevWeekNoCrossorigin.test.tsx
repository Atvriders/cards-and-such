import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2915: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `crossorigin` attribute is
 * only meaningful on resource-loading elements such as <img>, <audio>,
 * <video>, <link>, and <script>, where it controls CORS behavior for fetched
 * subresources. On a <ul> the attribute has no defined semantics, but leaving
 * it present would still appear in DOM serialization and could mislead future
 * refactors, crawlers, or tooling that inspects CORS-related markup. Sibling
 * tests already pin the absence of `cite`, `coords`, `shape`, `headers`,
 * `disabled`, and many other attributes on this <ul>, but none pin the absence
 * of `crossorigin`. Pinning it here ensures any future change that accidentally
 * attaches a `crossorigin` value to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — crossorigin attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2915: stats-prev-week ul has no crossorigin attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("crossorigin")).toBe(false);
    expect(ul.getAttribute("crossorigin")).toBeNull();
  });
});
