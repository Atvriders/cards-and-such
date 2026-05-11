import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3238: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The legacy HTML `onshow` event
 * handler attribute was associated with the now-removed <menu type="context">
 * and <menuitem> showing flow and has no defined behavior on a <ul>. If it
 * were ever attached to this presentational summary list it would either be
 * silently ignored or, depending on the user agent, treated as an inline event
 * handler — a potential vector for accidental script execution via attribute
 * injection. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and a broad array of ARIA / global / event-handler
 * attributes on this <ul>, but none pin the absence of `onshow`. Pinning it
 * here ensures any future change that accidentally attaches an `onshow`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onshow attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3238: stats-prev-week ul has no onshow attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onshow")).toBe(false);
    expect(ul.getAttribute("onshow")).toBeNull();
  });
});
