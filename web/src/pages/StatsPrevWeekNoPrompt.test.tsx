import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3036: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `prompt` attribute is a
 * legacy/obsolete attribute that was once associated with <isindex> and is not
 * a valid attribute on a <ul>. While modern browsers ignore unknown attributes
 * on lists, leaving one present would still be exposed via DOM serialization
 * and could mislead assistive technology, crawlers, or future refactors that
 * try to interpret it. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `prompt`. Pinning it
 * here ensures any future change that accidentally attaches a `prompt` value
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — prompt attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3036: stats-prev-week ul has no prompt attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("prompt")).toBe(false);
    expect(ul.getAttribute("prompt")).toBeNull();
  });
});
