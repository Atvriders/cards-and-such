import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1394: The "Most-hinted games" stats card renders each row's title via a
 * <span class="stats-most-hinted-title"> sibling of the rank span. That
 * className is the styling hook StatsPage.css uses to control the title
 * column's typography and truncation. Other tests pin the row testid, the
 * rank span (W1383), the Play link href (W615), and the title's text
 * content via getByText, but no test pins the title element's tagName +
 * `stats-most-hinted-title` className together. A regression that swapped
 * the wrapping element to a <div> or dropped the class hook would silently
 * break the row layout while every text-based assertion stayed green.
 * Seed a single hint count so row 0 renders, then assert the title span's
 * tag, class hook, and rendered title text.
 */
describe("StatsPage — most-hinted row title class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1394: stats-most-hinted row 0 renders title as <span> with stats-most-hinted-title class and game title text", () => {
    localStorage.setItem(
      "cards-hints-used",
      JSON.stringify({ klondike: 5 }),
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
    const title = row0.querySelector("span.stats-most-hinted-title");
    expect(title).not.toBeNull();
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Klondike Solitaire");
  });
});
