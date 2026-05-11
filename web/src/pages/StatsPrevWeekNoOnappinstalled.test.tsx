import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3301: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onappinstalled` event handler
 * attribute is a Window-level event handler defined by the Web App Manifest
 * spec — it fires on the global Window when a PWA install completes, and has
 * no meaning whatsoever on a <ul> element. Attaching it inline as an HTML
 * attribute on a list would be ignored by browsers as an event handler but
 * would still be exposed via DOM serialization, potentially confusing
 * crawlers, scanners, or refactor tooling. Sibling tests already pin the
 * absence of many global, ARIA, and event-handler attributes on this <ul>,
 * but none pin the absence of `onappinstalled`. Pinning it here ensures any
 * future change that accidentally attaches an `onappinstalled` handler to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onappinstalled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3301: stats-prev-week ul has no onappinstalled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onappinstalled")).toBe(false);
    expect(ul.getAttribute("onappinstalled")).toBeNull();
  });
});
