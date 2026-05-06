import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2977: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The legacy HTML `marginheight`
 * attribute was only ever defined on <body> and frame-related elements
 * (<frame>, <iframe>) in HTML 4 and is obsolete in modern HTML. On a <ul> it
 * carries no semantics whatsoever, but leaving it present would still be
 * serialized into the DOM and could either be mistakenly honored by quirks
 * mode browsers or confuse future refactors that try to interpret it as a
 * spacing hint. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `marginheight`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `marginheight` value to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — marginheight attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2977: stats-prev-week ul has no marginheight attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("marginheight")).toBe(false);
    expect(ul.getAttribute("marginheight")).toBeNull();
  });
});
