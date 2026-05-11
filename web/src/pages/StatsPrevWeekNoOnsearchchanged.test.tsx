import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onsearchchanged` attribute
 * is not a defined HTML event handler attribute. Leaving such an unknown
 * `on*`-prefixed attribute on the element would be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret it as a real event binding.
 * Sibling tests already pin the absence of a broad array of attributes on
 * this <ul>, but none pin the absence of `onsearchchanged`. Pinning it
 * here ensures any future change that accidentally attaches an
 * `onsearchchanged` attribute to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsearchchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsearchchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsearchchanged")).toBe(false);
    expect(ul.getAttribute("onsearchchanged")).toBeNull();
  });
});
