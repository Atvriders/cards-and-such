import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3158: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpaste` attribute is an
 * inline event-handler attribute that would attach a paste handler to the
 * element if present. This <ul> is a presentational summary list with no
 * editable descendants — it never legitimately needs a paste handler, and any
 * inline `onpaste=` would either be a stray serialization artifact or a XSS
 * vector if attacker-controlled content ever flowed into the render path.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `onpaste`. Pinning it here ensures any future
 * change that accidentally attaches an inline paste handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpaste attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3158: stats-prev-week ul has no onpaste attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpaste")).toBe(false);
    expect(ul.getAttribute("onpaste")).toBeNull();
  });
});
