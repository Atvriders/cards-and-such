import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1929: StatsPage's `stats-personal-records` card renders a framing subtitle
 * authored as
 *   <p className="stats-chart-label">Top 10 best times across all games</p>
 * immediately below the <h2>Personal records</h2> heading. Existing tests
 * pin (W1193) the substring text + class match and (W1809) the <p>
 * tagName, but neither pins the subtitle's `textContent` for *exact*
 * equality. That gap means a regression that appended a stray glyph
 * (e.g. "Top 10 best times across all games ✨"), prefixed marketing
 * copy ("New! Top 10 best times across all games"), or accidentally
 * spliced a child element whose text concatenates into the paragraph
 * (e.g. inserting a "(beta)" badge inside the same <p>) would still
 * satisfy `getByText` and the tagName check while silently changing
 * the visible copy a user sees.
 *
 * Lock the subtitle's `textContent` to the canonical string with strict
 * equality so any drift — leading/trailing whitespace, additional child
 * text, alternate punctuation, or rewording — surfaces immediately.
 * Mirrors W1809 (tagName) but targets text content.
 */
describe("StatsPage stats-personal-records — subtitle text", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1929: stats-personal-records subtitle textContent equals 'Top 10 best times across all games'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    // Locate the subtitle by its styling-hook class so the assertion is
    // not pre-filtered by the very text we're about to pin. There is
    // exactly one `.stats-chart-label` element inside the
    // personal-records card.
    const subtitles = card.querySelectorAll("p.stats-chart-label");
    expect(subtitles.length).toBe(1);
    const subtitle = subtitles[0] as HTMLParagraphElement;
    // Sanity: same element other Stats subtitle tests reach for.
    expect(
      within(card).getByText("Top 10 best times across all games"),
    ).toBe(subtitle);
    // The load-bearing assertion: exact textContent equality. No leading
    // or trailing whitespace, no spliced child text, no alternate copy.
    expect(subtitle.textContent).toBe("Top 10 best times across all games");
  });
});
