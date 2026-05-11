import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3310: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onslotchange` attribute
 * is a content-attribute event handler that only fires on <slot> elements
 * inside a shadow DOM when the assigned nodes change. On any other element —
 * and certainly on a presentational <ul> — it has no defined behavior, but
 * leaving it present would still register a string-form event handler via DOM
 * serialization and could leak code into the global execution scope, confuse
 * future refactors that try to interpret it as a slot binding, or trip
 * security audits scanning for inline event handlers. Sibling tests already
 * pin the absence of many other attributes on this <ul>, but none pin the
 * absence of `onslotchange`. Pinning it here ensures any future change that
 * accidentally attaches an `onslotchange` handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onslotchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3310: stats-prev-week ul has no onslotchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotchange")).toBe(false);
    expect(ul.getAttribute("onslotchange")).toBeNull();
  });
});
