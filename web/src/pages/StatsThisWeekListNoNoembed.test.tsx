import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3080: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". `noembed` is not
 * a defined HTML attribute on any element — the legacy <noembed> tag was an
 * element used as fallback content for the obsolete <embed> element and never
 * existed as an attribute. Attaching a `noembed` attribute to a <ul> would
 * carry no defined semantics, but it would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a meaningful hint. A wide array of
 * other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `noembed` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `noembed` attribute to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — noembed attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3080: stats-this-week-list ul has no noembed attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("noembed")).toBe(false);
    expect(ul.getAttribute("noembed")).toBeNull();
  });
});
