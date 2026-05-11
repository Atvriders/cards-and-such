import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3268: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforeunload` attribute is a
 * window-level event handler attribute that is only meaningful on <body> and
 * <frameset> elements, where it fires when the document is about to be
 * unloaded. On a <ul> the attribute carries no defined semantics, but if it
 * were present its string value would be compiled into an event handler that
 * could fire navigation-blocking prompts or trigger side effects on tab close.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `onbeforeunload`. Pinning it here ensures any
 * future change that accidentally attaches an unload handler to this
 * presentational summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforeunload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3268: stats-prev-week ul has no onbeforeunload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeunload")).toBe(false);
    expect(ul.getAttribute("onbeforeunload")).toBeNull();
  });
});
