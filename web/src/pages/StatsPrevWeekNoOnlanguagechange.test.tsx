import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3286: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onlanguagechange` attribute is
 * a global event-handler content attribute that, if present, would register an
 * inline JavaScript handler for the `languagechange` event when the user's
 * preferred language is updated. On this presentational summary list there is
 * no need to react to language changes — translation flows are handled
 * elsewhere — and inline event handler attributes are an anti-pattern that
 * bypasses CSP and React's synthetic event system. Sibling tests pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array
 * of ARIA / global attributes on this <ul>, but none pin the absence of
 * `onlanguagechange`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onlanguagechange` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onlanguagechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3286: stats-prev-week ul has no onlanguagechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onlanguagechange")).toBe(false);
    expect(ul.getAttribute("onlanguagechange")).toBeNull();
  });
});
