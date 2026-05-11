import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3298: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onunhandledrejection` event
 * handler attribute is only meaningful on <body> (and historically <frameset>),
 * where it fires when a Promise is rejected without a handler. Attaching it as
 * an inline attribute on a <ul> would create a no-op handler from HTML's
 * perspective, but would still expose an executable string in DOM serialization
 * and could be misinterpreted by tooling, mistakenly trigger inline-handler
 * CSP violations, or signal an accidental copy-paste of body-level error
 * handling into a presentational list. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `onunhandledrejection`. Pinning it here ensures any future change that
 * accidentally attaches an `onunhandledrejection` handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onunhandledrejection attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3298: stats-prev-week ul has no onunhandledrejection attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunhandledrejection")).toBe(false);
    expect(ul.getAttribute("onunhandledrejection")).toBeNull();
  });
});
