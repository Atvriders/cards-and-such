import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3299: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onunhandledrejection` attribute is a global event handler content attribute
 * intended for the <body> element (and reflected on Window) to receive
 * unhandled Promise rejections. On a presentational <ul> it carries no useful
 * semantics: any handler attached there would never fire from the
 * platform-level rejection plumbing, but it would still be serialized into the
 * DOM, parsed as inline JavaScript on hydration, and act as a vector for
 * accidental script execution or stale handlers. Many sibling attribute
 * absences on this same ul are already pinned (cite, id, role, style,
 * tabindex, ARIA, plus a long tail of inline event handlers), but no test
 * pins `onunhandledrejection` absence. Pinning it here ensures any future
 * change that accidentally attaches an `onunhandledrejection` handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onunhandledrejection attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3299: stats-this-week-list ul has no onunhandledrejection attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunhandledrejection")).toBe(false);
    expect(ul.getAttribute("onunhandledrejection")).toBeNull();
  });
});
