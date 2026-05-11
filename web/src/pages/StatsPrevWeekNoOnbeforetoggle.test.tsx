import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3232: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforetoggle` content
 * attribute is an inline event handler for the `beforetoggle` event, which
 * fires on elements that support the popover or dialog show/hide lifecycle
 * (e.g. <dialog>, elements with the `popover` attribute). On a presentational
 * <ul> with no popover/dialog semantics, this attribute carries no defined
 * meaning, but leaving an inline handler attribute present would still be
 * exposed via DOM serialization and could surprise future refactors or
 * accessibility tooling. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of
 * `onbeforetoggle`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onbeforetoggle` handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforetoggle attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3232: stats-prev-week ul has no onbeforetoggle attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforetoggle")).toBe(false);
    expect(ul.getAttribute("onbeforetoggle")).toBeNull();
  });
});
