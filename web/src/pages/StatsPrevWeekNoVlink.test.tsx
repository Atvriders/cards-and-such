import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3064: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The legacy HTML `vlink` attribute
 * was only ever defined on <body> in HTML 3.2/4 to set the color of visited
 * hyperlinks, and it was removed in HTML5 in favor of CSS. On a <ul> the
 * attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could mislead crawlers, assistive
 * technology, or future refactors that try to interpret it as a styling hint.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `vlink`. Pinning it here ensures any future
 * change that accidentally attaches a `vlink` color to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — vlink attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3064: stats-prev-week ul has no vlink attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("vlink")).toBe(false);
    expect(ul.getAttribute("vlink")).toBeNull();
  });
});
