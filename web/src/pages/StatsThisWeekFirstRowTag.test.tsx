import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1781: StatsPage's `stats-this-week` card renders its current-week
 * metric rows as native list items inside a <ul data-testid="stats-this-week-list">.
 * Existing tests cover the wrapping <ul>'s tagName (W1604) and className
 * (W1361), the per-row child counts (W1656/W1672/W1680), the row count
 * (W1626), the label classes/tags and value EM tags, and the wins/avg
 * delta directions — but NONE explicitly pin the first current-week
 * row's tagName as "LI".
 *
 * A regression that switched the row from <li> to <div> (e.g. while
 * refactoring to flexbox-only layout) would silently break list
 * semantics — screen readers would no longer announce the current-week
 * trio as a list, and assistive tech relying on `role=listitem` would
 * stop seeing them. The existing child-count and class assertions would
 * still pass against a <div>.children.length of 3, so the semantics
 * regression goes undetected. This test pins the first this-week row's
 * tagName to "LI".
 */
describe("StatsPage stats-this-week — first row tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1781: stats-this-week-list first row is rendered as an <li> element", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const firstRow = list.firstElementChild;
    expect(firstRow).not.toBeNull();
    // Pin the native list-item semantics — a switch to <div> would break
    // assistive-tech list announcements while passing every other existing
    // structural assertion (3-child count, label/value/delta classes).
    expect(firstRow!.tagName).toBe("LI");
  });
});
