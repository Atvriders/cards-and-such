import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3322: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onvisibilitychange` IDL
 * attribute / event handler is defined on Document (and historically only
 * meaningfully fires on the document object), not on individual list
 * elements. Attaching it as a content attribute on a <ul> would silently
 * register an inline event handler that never fires through its normal
 * lifecycle but would still execute its body via the HTML parser's
 * compileEventHandler path, creating both a dead-code and a potential
 * inline-script-injection surface. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array
 * of ARIA / global attributes on this <ul>, but none pin the absence of
 * `onvisibilitychange`. Pinning it here ensures any future change that
 * accidentally attaches an `onvisibilitychange` handler to this
 * presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onvisibilitychange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3322: stats-prev-week ul has no onvisibilitychange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onvisibilitychange")).toBe(false);
    expect(ul.getAttribute("onvisibilitychange")).toBeNull();
  });
});
