import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2179: StatsPage's outermost wrapper element (`data-testid="stats-page"`,
 * `className="stats-page"`) is intentionally rendered WITHOUT an inline
 * `style` attribute. All visual layout for the page is driven by the
 * `.stats-page` CSS rules and by the layout-probe code that reads
 * `.stats-page` (StatsPage.tsx ~line 641). Existing tests pin the root's
 * tag (W1426/W1974), exact className (W1979), classList membership (W797),
 * and absence of `id`/aria — but none pin the absence of an inline `style`
 * attribute on the root. A regression that adds inline styles (e.g.
 * `style={{ display: "flex" }}` or computed width/height props bleeding
 * into the wrapper) would silently override the stylesheet's cascade,
 * defeat theme switches, and cause subtle layout drift that no current
 * assertion catches. Lock it: the page-root must carry no `style`
 * attribute at all.
 */
describe("StatsPage root — page-root has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2179: stats-page root element does not have a style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const root = screen.getByTestId("stats-page");
    expect(root).not.toBeNull();
    // Pin the absence of any inline style attribute. Styling must come
    // exclusively from the .stats-page CSS class, not from inline props.
    expect(root.hasAttribute("style")).toBe(false);
  });
});
