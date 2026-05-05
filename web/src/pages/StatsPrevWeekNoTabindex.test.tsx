import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2267: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) and
 * has no interactive controls of its own. Sibling structural contracts are
 * already pinned for class names, child counts, label/value tags, and the
 * absence of `id`, `role`, and inline `style` on this <ul>, but no existing
 * test pins the absence of a `tabindex` attribute. Adding a `tabindex`
 * (either 0 to insert the list into the tab order, or -1 to make it
 * programmatically focusable) would change the page's keyboard navigation
 * contract: keyboard users would land on a non-interactive <ul> with no
 * associated action, a known accessibility anti-pattern. Pinning the
 * absence of `tabindex` ensures any future refactor that attempts to make
 * the list focusable is reviewed deliberately rather than slipping in
 * silently.
 */
describe("StatsPage stats-prev-week ul — tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2267: stats-prev-week ul has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("tabindex")).toBe(false);
    expect(ul.getAttribute("tabindex")).toBeNull();
  });
});
