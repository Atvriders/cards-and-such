import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onhide` attribute is not a standard HTML
 * event handler attribute on <ul> elements; it has no defined semantics here
 * and any value would be silently ignored by the browser. Leaving such an
 * attribute present would still be exposed via DOM serialization and could
 * mislead crawlers or future refactors. Sibling tests pin the absence of
 * many other attributes on this element; this test pins `onhide` so any
 * future change that accidentally attaches it is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onhide attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onhide attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhide")).toBe(false);
    expect(ul.getAttribute("onhide")).toBeNull();
  });
});
