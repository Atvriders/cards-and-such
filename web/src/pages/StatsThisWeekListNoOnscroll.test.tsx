import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3176: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is a plain presentational <ul>. The HTML `onscroll` content attribute is an
 * event-handler attribute that, if set, would register an inline scroll handler
 * by parsing its value as JavaScript. On a non-scrolling weekly summary list it
 * carries no purpose, and an accidental `onscroll` would both run arbitrary
 * code and violate strict Content Security Policies that disallow inline event
 * handlers. Many other event-handler and structural attribute absences on this
 * ul are already pinned, but no test pins `onscroll`. Pinning it here ensures
 * any future change that attaches an inline scroll handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onscroll attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3176: stats-this-week-list ul has no onscroll attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onscroll")).toBe(false);
    expect(ul.getAttribute("onscroll")).toBeNull();
  });
});
