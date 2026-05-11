import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onwebkitanimationiteration` inline event handler attribute fires each time a
 * WebKit-prefixed CSS animation completes one iteration. It has no role on a
 * presentational weekly summary list, and any handler attached via this DOM
 * attribute would execute attacker-controlled or unreviewed JavaScript in the
 * page's origin. Pinning its absence here ensures any future change that
 * accidentally attaches an `onwebkitanimationiteration` handler to this list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwebkitanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkitanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationiteration")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationiteration")).toBeNull();
  });
});
