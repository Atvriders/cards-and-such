import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3271: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onunload` content attribute is
 * an event handler for the window's unload event and is only meaningful on
 * <body> and <frameset> elements per HTML spec. On a <ul> it carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and, more concerningly, any inline-event-handler attribute
 * provides a vector for stored XSS or accidental code execution if user
 * content ever flows into this list. Sibling tests already pin the absence of
 * `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `onunload`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onunload` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onunload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3271: stats-prev-week ul has no onunload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunload")).toBe(false);
    expect(ul.getAttribute("onunload")).toBeNull();
  });
});
