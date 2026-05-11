import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The legacy `onwebkitanimationend` inline event-handler attribute is a
 * vendor-prefixed cousin of `onanimationend` that some older WebKit-based
 * browsers exposed as an IDL/content attribute on every element. Pinning its
 * absence ensures no future refactor (e.g. animating the prev-week list in or
 * out) attaches an inline `onwebkitanimationend="..."` handler to this <ul>:
 * inline handlers bypass our React event system, defeat CSP `script-src`
 * hardening, and create a hidden execution path that escapes lint / type
 * checks. Sibling tests already pin the absence of a wide array of attributes
 * on this element; this test fills in the `onwebkitanimationend` slot.
 */
describe("StatsPage stats-prev-week ul — onwebkitanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkitanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationend")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationend")).toBeNull();
  });
});
