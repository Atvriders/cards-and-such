import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3172: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onwheel` content attribute, if
 * present, would register an inline event handler that runs whenever the user
 * scrolls the wheel over the element — a behavior this presentational summary
 * list has no need for and that would also bypass React's synthetic event
 * system, potentially leaking globals or executing attacker-controlled strings.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `onwheel`. Pinning it here ensures any future
 * change that accidentally attaches an inline wheel handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwheel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3172: stats-prev-week ul has no onwheel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwheel")).toBe(false);
    expect(ul.getAttribute("onwheel")).toBeNull();
  });
});
