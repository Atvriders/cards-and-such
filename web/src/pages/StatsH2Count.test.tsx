import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1909: StatsPage renders a fixed set of section cards, each titled with an
 * `<h2>` element. The page-level layout currently emits exactly 11 unconditional
 * `<h2>` headings (Activity, Records, Top played, Plays by hour of day, Plays
 * by category × day-of-week, This week, Personal records, Personal records by
 * category, Most-hinted games, Replays, Achievements).
 *
 * Existing per-section tests (StatsSectionH2*Parent) only verify each h2 by
 * text content individually — none of them assert the *total count*. A future
 * refactor that accidentally drops or duplicates a section would slip past the
 * per-section selectors (since each only asks "does at least one h2 with this
 * text exist?"). Pin the structural count of `<h2>` elements directly so a
 * removed/added section card surfaces as a test failure.
 */
describe("StatsPage — total <h2> count (structural pin)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1909: renders exactly 11 <h2> elements (one per section card)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    expect(document.querySelectorAll("h2").length).toBe(11);
  });
});
