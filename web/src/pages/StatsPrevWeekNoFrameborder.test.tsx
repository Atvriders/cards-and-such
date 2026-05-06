import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2973: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `frameborder` attribute is
 * a deprecated presentational attribute that historically only applied to
 * <frame> and <iframe> elements (and even there is obsolete in HTML5, replaced
 * by CSS `border`). On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as a frame-border style hint. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global / frame-related attributes on this <ul>, but none
 * pin the absence of `frameborder`. Pinning it here ensures any future change
 * that accidentally attaches a `frameborder` value to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — frameborder attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2973: stats-prev-week ul has no frameborder attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("frameborder")).toBe(false);
    expect(ul.getAttribute("frameborder")).toBeNull();
  });
});
