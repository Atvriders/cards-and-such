import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3292: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ononline` attribute is a global
 * event handler attribute that fires when the browser regains network
 * connectivity, and it is only meaningful on <body> (or, via IDL, on
 * window/HTMLElement event handlers). On a presentational <ul> it carries no
 * defined semantics, but if it were ever attached its string contents would be
 * compiled into an inline event handler — bypassing React's synthetic event
 * system, evading CSP `script-src` policies that forbid inline handlers, and
 * introducing a latent XSS sink if any of its value ever derived from user
 * input. Sibling tests pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `ononline`. Pinning it here ensures any future
 * change that accidentally attaches an `ononline` handler to this summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ononline attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3292: stats-prev-week ul has no ononline attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ononline")).toBe(false);
    expect(ul.getAttribute("ononline")).toBeNull();
  });
});
