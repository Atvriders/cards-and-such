import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3277: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpopstate` attribute is a
 * legacy inline event handler defined on Window for navigating browser
 * history. Placing it on a list element has no defined effect and would
 * register a global popstate handler at parse time, which is both surprising
 * and a code-injection footgun. Sibling tests pin the absence of many
 * attributes and inline handlers on this <ul>, but none pin `onpopstate`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onpopstate` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpopstate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3277: stats-prev-week ul has no onpopstate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpopstate")).toBe(false);
    expect(ul.getAttribute("onpopstate")).toBeNull();
  });
});
