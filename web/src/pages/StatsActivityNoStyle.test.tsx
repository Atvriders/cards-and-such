import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2123: StatsPage's `data-testid="stats-activity"` card — the
 * `.stats-card.stats-card--exportable` wrapper holding the Activity heading,
 * summary tiles, and the line-chart export — carries NO inline `style`
 * attribute. Sibling tests already pin its className shape
 * (StatsActivityCardClass), absence of an `id` (StatsActivityNoId),
 * absence of ARIA noise (StatsActivityNoAria), child count
 * (StatsActivityChildCount), and the parent grid wrapper's lack of an
 * inline style (StatsCardGridNoStyle). What was NOT pinned is the
 * activity card element itself remaining free of an inline `style`
 * attribute.
 *
 * All visual presentation of the activity card — padding, background,
 * the column-span promotion at the `@media (min-width: 1024px)`
 * breakpoint, the export-button placement — flows from the
 * `.stats-card` and `.stats-card--exportable` class hooks in CSS. An
 * inline `style` attribute would (a) raise CSS specificity above the
 * stylesheet and silently shadow stylesheet rules, (b) couple
 * presentation to JS-side string templating instead of a single source
 * of truth in CSS, and (c) defeat the design intent that the activity
 * card's appearance is controlled exclusively by class hooks. Pin the
 * ABSENCE of `style` on the activity card so any future refactor that
 * sneaks an inline style onto this wrapper is caught and reviewed.
 */
describe("StatsPage stats-activity — card style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2123: stats-activity card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card).not.toBeNull();
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--exportable")).toBe(true);

    // Pin the absence of an inline `style` attribute on the activity
    // card. Visual presentation is owned entirely by the `.stats-card`
    // and `.stats-card--exportable` CSS rules; an inline style would
    // raise specificity above the stylesheet and couple presentation
    // to JS-side string templating. Must be reviewed deliberately.
    expect(card.hasAttribute("style")).toBe(false);
  });
});
