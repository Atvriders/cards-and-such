import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1792: StatsPage's `stats-prev-week` card renders its prior-week
 * metric rows as native list items inside a <ul data-testid="stats-prev-week">.
 * Existing tests cover the wrapping <ul>'s tagName (W1605) and class
 * (W1361-ish), the per-row child counts (W1656/W1672/W1680), the row
 * count, the label classes/tags and value <em> tags — but NONE
 * explicitly pin the first prior-week row's tagName as "LI".
 *
 * A regression that switched the row from <li> to <div> (e.g. while
 * refactoring to flexbox-only layout) would silently break list
 * semantics — screen readers would no longer announce the prior-week
 * trio as a list, and assistive tech relying on `role=listitem` would
 * stop seeing them. The existing child-count and class assertions would
 * still pass against a <div>.children.length of 2, so the semantics
 * regression goes undetected. This test pins the first prev-week row's
 * tagName to "LI", mirroring W1781 for the current-week list.
 */
describe("StatsPage stats-prev-week — first row tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1792: stats-prev-week first row is rendered as an <li> element", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const list = screen.getByTestId("stats-prev-week");
    const firstRow = list.firstElementChild;
    expect(firstRow).not.toBeNull();
    // Pin the native list-item semantics — a switch to <div> would break
    // assistive-tech list announcements while passing every other existing
    // structural assertion (2-child count, label/value tags).
    expect(firstRow!.tagName).toBe("LI");
  });
});
