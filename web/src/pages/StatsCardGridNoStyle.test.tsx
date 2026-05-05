import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2102: StatsPage's responsive `.stats-card-grid` <section> wrapper carries
 * NO inline `style` attribute. Sibling tests already pin: tagName=SECTION
 * (W1235), exact className equality "stats-card-grid" (W1918), and absence
 * of an `id` (W1998). All grid layout — `display: grid`, the
 * `grid-template-columns` track definition, and the `@media (min-width:
 * 1024px)` rule that promotes `stats-activity` to span 2 columns — lives in
 * the stylesheet behind the `.stats-card-grid` class hook. There is
 * intentionally no inline `style` on the wrapper.
 *
 * An inline `style` attribute would (a) raise CSS specificity above the
 * stylesheet rules and silently break overrides, (b) defeat the design
 * intent that the responsive layout is driven entirely by the class hook,
 * and (c) couple the layout to JS-side string templating instead of a
 * single source of truth in CSS. Pin the ABSENCE of `style` on the
 * `.stats-card-grid` <section> so that any future refactor introducing an
 * inline style attribute on the wrapper is caught and reviewed.
 */
describe("StatsPage stats-card-grid — section style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2102: .stats-card-grid <section> has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("SECTION");
    expect(grid!.classList.contains("stats-card-grid")).toBe(true);

    // Pin the absence of an inline `style` attribute on the section. The
    // grid layout is owned entirely by the .stats-card-grid CSS rule; an
    // inline style would raise specificity above the stylesheet and couple
    // layout to JS-side string templating. Must be reviewed deliberately.
    expect(grid!.hasAttribute("style")).toBe(false);
  });
});
