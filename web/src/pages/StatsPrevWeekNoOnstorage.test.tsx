import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3280: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onstorage` attribute is a
 * window-level event handler content attribute; it only has defined meaning
 * when set on <body> (where it mirrors window.onstorage). On any other element
 * — including this presentational <ul> — `onstorage` carries no semantics, but
 * if it were ever attached it would still be serialized into the DOM and could
 * mislead future refactors, static analyzers, or assistive technology trying
 * to interpret it. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `onstorage`. Pinning
 * it here ensures any future change that accidentally attaches an `onstorage`
 * handler attribute to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onstorage attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3280: stats-prev-week ul has no onstorage attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstorage")).toBe(false);
    expect(ul.getAttribute("onstorage")).toBeNull();
  });
});
