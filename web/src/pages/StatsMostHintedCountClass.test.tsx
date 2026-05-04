import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1405: The "Most-hinted games" stats card renders each row's hint count
 * via a <span class="stats-most-hinted-count"> sibling that follows the
 * Sparkline. That className is the styling hook StatsPage.css uses to apply
 * the bold weight and amber accent (font-weight: 700; color: #fbbf24) that
 * makes the count visually distinct from the title. Other tests pin the
 * rank span (W1383), title span (W1394), and Play link href, but no test
 * pins the count element's tagName + `stats-most-hinted-count` className +
 * rendered numeral together. A regression that swapped the wrapping element
 * to a <div>, dropped the class hook, or rendered the count from a
 * different field would silently break the styled accent column while
 * other row assertions stayed green. Seed a single hint count so row 0
 * renders, then assert the count span's tag, class hook, and rendered text.
 */
describe("StatsPage — most-hinted row count class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1405: stats-most-hinted row 0 renders count as <span> with stats-most-hinted-count class and seeded numeral", () => {
    localStorage.setItem(
      "cards-hints-used",
      JSON.stringify({ klondike: 7 }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const row0 = within(card).getByTestId("stats-most-hinted-row-0");
    const count = row0.querySelector("span.stats-most-hinted-count");
    expect(count).not.toBeNull();
    expect(count?.tagName).toBe("SPAN");
    expect(count?.textContent).toBe("7");
  });
});
